import jwt
from jwt import ExpiredSignatureError, InvalidTokenError
import datetime

from diffie_hellman.Config import Config

SECRET_KEY = Config.SECRET_KEY


def parse_token(token):
    try:

        # Декодируем токен и проверяем подпись
        decoded = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        print("Декодированный токен:", decoded)
        return decoded
    except ExpiredSignatureError:
        print("Срок действия токена истек.")
        return None
    except InvalidTokenError as e:
        print(f"Неверный токен: {e}")
        return None
