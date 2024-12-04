import psycopg2


class DatabaseConnection:
    def __init__(self):
        self.DB_CONFIG = {
            'dbname': 'practice_3_infobes',
            'user': 'postgres',
            'password': '1111',
            'host': 'localhost',  # или IP-адрес
            'port': 5432  # порт PostgreSQL по умолчанию
        }

        self.connection = None

        self.get_db_connection()

    def __del__(self):
        print('Соединение разорвано')
        self.connection.close()

    def get_db_connection(self):
        try:
            self.connection = psycopg2.connect(**self.DB_CONFIG)
        except Exception as e:
            print(f"Ошибка подключения к базе данных: {e}")
