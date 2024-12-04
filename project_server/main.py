import base64
import datetime
import jwt
from flask import Flask, request, jsonify
from flask_cors import CORS

from diffie_hellman.JWTProvider import parse_token
from diffie_hellman.diffie_tools import DiffieHellman
from PasswordHasher import PasswordHasher as ph
from DatabaseConnection import DatabaseConnection as DB
from diffie_hellman.Config import Config

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

SECRET_KEY = Config.SECRET_KEY

connect = DB()

diffie_hellman = None

if not diffie_hellman:
    diffie_hellman = DiffieHellman()

# print(diffie_hellman.p)
# print(diffie_hellman.g)
# print(diffie_hellman.A)


@app.route('/get_keys', methods=['GET'])
def get_keys():
    try:
        return jsonify({"key_A": str(diffie_hellman.A),  # Преобразуем в строку, если это необходимо
                        "key_p": str(diffie_hellman.p),
                        "key_g": str(diffie_hellman.g)
                        }), 200

    except Exception as e:
        # Возврат ошибки в случае исключения
        return jsonify({"error": str(e)}), 500


# Сделать генерацию p и g на клиенте
@app.route('/get_key_B', methods=['POST'])
def get_key_B():
    try:
        key = request.get_json()
        key_B = int(key.get('key_B'))

        # print(f'Получено число B: {key_B}')
        diffie_hellman.calculate_S(key_B)
        # print(f'S: {diffie_hellman.S}')
        # print(f'deriveKey: {diffie_hellman.gen_key.hex()}')
    except Exception as e:
        return f'Ошибка get_key_B: {e}', 499
    return jsonify({"status": "success", "message": "Key B processed successfully"}), 200


@app.route('/compare_devire_key', methods=['POST'])
def compare_keys():
    key = request.get_json()
    key = key.get('devire_key')
    # print(key)
    # print(type(key))
    # devire_key = bytes.fromhex(key)
    received_key = base64.b64decode(key)
    # print(f'received_key: {received_key}')
    # print(f'diffie_hellman.gen_key: {diffie_hellman.gen_key}')

    # print(received_key == diffie_hellman.gen_key)
    return jsonify({'message': 'Данные получены'}), 200


@app.route('/', methods=['GET'])
def home():
    data = {'one': 'hello', 'two': 45, 'data': [2, 8289, '202', '289']}
    iv, encrypt_mes = diffie_hellman.encrypt_message(data)

    # Кодируем IV и сообщение в base64
    response_data = {
        "iv": iv,
        "encrypted_message": encrypt_mes
    }

    # Возвращаем JSON с IV и шифром
    return jsonify(response_data), 200


@app.route('/get_encrypt_message', methods=['POST'])
def get_message():
    data = request.get_json()
    iv = data.get('iv')
    decryptMessage = data.get('decryptMessage')

    result = diffie_hellman.decrypt_message(iv, decryptMessage)
    return jsonify(), 200


@app.route('/register_user', methods=['POST'])
def register_user():
    data = request.get_json()
    iv = data.get('iv')
    encrypted_message = data.get('encryptedMessage')
    result = diffie_hellman.decrypt_message(iv, encrypted_message)
    # print(result)
    nick_name = result.get('nickName')
    password = result.get('password')
    hash_password = ph.hash_password(password)

    current_time = datetime.datetime.utcnow()
    cursor = connect.connection.cursor()

    try:
        # Выполнение запроса для добавления нового пользователя
        cursor.execute(
            """
            INSERT INTO Users (Nickname, HashPassword, Role) 
            VALUES (%s, %s, %s);
            """,
            (nick_name, hash_password, 'client')
        )

        # Подтверждаем изменения в базе данных
        connect.connection.commit()

        jwt_token = jwt.encode({'nickName': nick_name,
                                'role': 'client',
                                "exp": current_time + datetime.timedelta(minutes=5)},
                               SECRET_KEY, algorithm='HS256')

        iv_res, encrypted_response = diffie_hellman.encrypt_message({'token': jwt_token})

        response = {'iv': iv_res,
                    'encryptedMessage': encrypted_response}
        return jsonify(response), 200

    except Exception as e:
        connect.connection.rollback()
        return {'error': str(e)}, 500
    finally:
        cursor.close()


@app.route('/enter_user', methods=['POST'])
def enter_user():
    data = request.get_json()
    iv = data.get('iv')
    encrypted_message = data.get('encryptedMessage')
    result = diffie_hellman.decrypt_message(iv, encrypted_message)
    # print(result)
    nick_name = result.get('nickName')
    password = result.get('password')

    current_time = datetime.datetime.utcnow()
    cursor = connect.connection.cursor()

    try:
        cursor.execute("SELECT * FROM Users WHERE Nickname = %s;", (nick_name,))

        user = cursor.fetchone()

        if user:
            user_data = {
                'id': user[0],
                'nickname': user[1],
                'role': user[2],
                'hashpassword': user[3]
            }
        else:
            return jsonify({'error': 'Пользователь не найден'}), 404

        if not ph.check_password(password, user_data['hashpassword']):
            return jsonify({'error': 'Неверный пароль'}), 404

        jwt_token = jwt.encode({'nickName': nick_name,
                                'role': user_data['role'],
                                "exp": current_time + datetime.timedelta(minutes=5)},
                               SECRET_KEY, algorithm='HS256')

        iv_res, encrypted_response = diffie_hellman.encrypt_message({'token': jwt_token})

        response = {'iv': iv_res,
                    'encryptedMessage': encrypted_response}
        return jsonify(response), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()


@app.route('/update_note', methods=['POST'])
def update_note():
    data = request.get_json()
    iv = data.get('iv')
    encrypted_message = data.get('encryptedMessage')
    cursor = None

    try:
        # Расшифровка сообщения
        result = diffie_hellman.decrypt_message(iv, encrypted_message)
        # print(result)

        result_jwt = parse_token(result.get('jwt'))
        if not result_jwt:
            return jsonify({'error': 'Ошибка токена'}), 400

        # Извлечение полей
        id_note = result.get('id')
        title = result.get('title')
        description = result.get('description')

        if not id_note or not title or not description:
            return jsonify({'error': 'Missing required fields'}), 400

        # Подключение к базе данных
        cursor = connect.connection.cursor()

        # Выполнение SQL-запроса
        update_query = """
                UPDATE Notes
                SET title = %s, description = %s
                WHERE id = %s
            """
        cursor.execute(update_query, (title, description, id_note))

        # Фиксация изменений
        connect.connection.commit()

        return jsonify({'message': 'Note updated successfully'}), 200

    except Exception as e:
        # Обработка ошибок
        # print(f"Error updating note: {e}")
        return jsonify({'error': str(e)}), 500

    finally:
        # Закрытие курсора
        if cursor:
            cursor.close()


@app.route('/get_user_notes', methods=['POST'])
def get_user_notes():
    data = request.get_json()
    iv = data.get('iv')
    encrypted_message = data.get('encryptedMessage')
    cursor = None  # Инициализация переменной cursor

    try:
        result = None
        # Расшифровка сообщения
        try:
            result = diffie_hellman.decrypt_message(iv, encrypted_message)
        except Exception as e:
            print('Проблема в парсе', e)
        print('result', result)

        token = result.get('jwt')

        decoded_token = parse_token(token)

        # Извлечение полей
        nick_name = decoded_token.get('nickName')
        role = decoded_token.get('role')
        cursor = connect.connection.cursor()  # Создаём курсор

        if role == 'client':
            # Выполняем SQL-запрос для получения всех записей
            cursor.execute(
                "SELECT id, title, description, usernickname, createdat FROM Notes WHERE UserNickname = %s;",
                (nick_name,))
        elif role == 'admin':
            cursor.execute("SELECT id, title, description, usernickname, createdat FROM Notes")

        notes = cursor.fetchall()

        # Формируем список заметок
        notes_list = [
            {
                'id': note[0],
                'title': note[1],
                'description': note[2],
                'usernickname': note[3],
                'creation_date': datetime.datetime.strftime(note[4], "%d.%m.%y %H:%M")  # Преобразование даты в ISO-формат
            }
            for note in notes
        ]

        # print(notes_list)
        # Шифрование ответа
        iv_res, encrypted_response = diffie_hellman.encrypt_message({'notes': notes_list})

        response = {'iv': iv_res,
                    'encryptedMessage': encrypted_response}
        return jsonify(response), 200

    except Exception as e:
        # Возвращаем ошибку в случае сбоя
        return jsonify({'error': str(e)}), 500

    finally:
        # Безопасное закрытие курсора, если он был создан
        if cursor:
            cursor.close()



@app.route('/add_note', methods=['POST'])
def add_note():
    # Получаем данные из запроса
    data = request.get_json()
    iv = data.get('iv')
    encrypted_message = data.get('encryptedMessage')
    cursor = None

    try:
        # Расшифровываем сообщение
        result = diffie_hellman.decrypt_message(iv, encrypted_message)

        result_jwt = parse_token(result.get('jwt'))

        if not result_jwt:
            return jsonify({'error': 'Ошибка токена'}), 400

        title = result.get('title')
        description = result.get('description')
        user_nickname = result_jwt.get('nickName')

        # Проверяем обязательные поля
        if not title or not user_nickname:
            return jsonify({'error': 'Title and usernickname are required'}), 400

        # Подключаемся к базе данных
        cursor = connect.connection.cursor()

        # Выполняем SQL-запрос для вставки новой записи
        cursor.execute(
            """
            INSERT INTO Notes (title, description, usernickname)
            VALUES (%s, %s, %s);
            """,
            (title, description, user_nickname)
        )

        # Получаем результат вставки
        connect.connection.commit()

        return jsonify({'success': True}), 201

    except Exception as e:
        # Обрабатываем ошибки
        return jsonify({'error': str(e)}), 500

    finally:
        cursor.close()


@app.route('/delete_note', methods=['POST'])
def delete_note():
    # Получаем данные из запроса
    data = request.get_json()
    iv = data.get('iv')
    encrypted_message = data.get('encryptedMessage')
    cursor = None

    try:
        # Расшифровываем сообщение
        result = diffie_hellman.decrypt_message(iv, encrypted_message)

        jwt_decoded = parse_token(result.get('jwt'))

        if not jwt_decoded:
            return jsonify({'error': 'Ошибка токена'}), 404

        note_id = result.get('id')

        # Проверяем наличие id
        if not note_id:
            return jsonify({'error': 'Note ID is required'}), 400

        # Подключаемся к базе данных
        cursor = connect.connection.cursor()

        # Удаляем запись с указанным id
        cursor.execute("DELETE FROM Notes WHERE id = %s;", (note_id,))
        connect.connection.commit()

        # Проверяем, была ли запись удалена
        if cursor.rowcount == 0:
            return jsonify({'error': 'Note not found or already deleted'}), 404

        # Формируем успешный ответ
        return jsonify({'success': True, 'message': f'Note with ID {note_id} deleted successfully'}), 200

    except Exception as e:
        # Обрабатываем ошибки
        return jsonify({'error': str(e)}), 500

    finally:
        # Безопасно закрываем курсор
        if cursor:
            cursor.close()


if __name__ == '__main__':
    app.run(debug=False)
