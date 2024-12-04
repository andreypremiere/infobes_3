import base64
import json
import os
import random
import gmpy2
from cryptography.hazmat.primitives import hashes, padding
from cryptography.hazmat.primitives.asymmetric import dh
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.ciphers.algorithms import AES
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives.padding import PKCS7
from sympy import primitive_root
import base64
import json


class DiffieHellman:
    def __init__(self):
        self.p = None
        self.g = None
        self.a = None
        self.A = None
        self.S = None
        self.gen_key = None

        self.generate_large_prime_p()
        self.generate_number_g()
        self.generate_random_a()
        self.calculate_A()

        # print('Экземпляр создан')

    def generate_dh_parameters(self, bits=512):
        parameters = dh.generate_parameters(generator=2, key_size=bits)
        return parameters

    def generate_large_prime_p(self, bits=512):
        parameters = self.generate_dh_parameters(bits)
        while not gmpy2.is_prime(parameters.parameter_numbers().p):
            parameters = self.generate_dh_parameters(bits)
        self.p = parameters.parameter_numbers().p

    def generate_number_g(self):
        self.g = primitive_root(self.p, smallest=False)

    def generate_random_a(self, min_val=10, max_val=10 ** 50):
        """Генерирует случайное число в диапазоне [min_val, max_val]."""
        self.a = random.randint(min_val, max_val)

    def calculate_A(self):
        self.A = pow(self.g, self.a, self.p)

    def calculate_S(self, B):
        self.S = pow(B, self.a, self.p)

        self.derive_key()

    # исправить расчет на клиенте симметричного ключа
    def derive_key(self):
        shared_key = None

        if isinstance(self.S, int):
            shared_key = self.S.to_bytes((self.S.bit_length() + 7) // 8, 'big')

        hkdf = HKDF(
            algorithm=hashes.SHA256(),
            length=32,  # Длина ключа в байтах (256 бит)
            salt=None,
            info=b'diffie-hellman encryption',
        )
        # print(self.gen_key)
        self.gen_key = hkdf.derive(shared_key)

    def encrypt_message(self, message):
        iv = os.urandom(16)
        data = json.dumps(message)

        padder = padding.PKCS7(128).padder()
        padded_data = padder.update(data.encode("utf-8")) + padder.finalize()

        cipher = Cipher(algorithms.AES(self.gen_key), modes.CBC(iv))
        encryptor = cipher.encryptor()
        ciphertext = encryptor.update(padded_data) + encryptor.finalize()

        return base64.b64encode(iv).decode('utf-8'), base64.b64encode(ciphertext).decode('utf-8')

    def decrypt_message(self, iv: str, encrypted_message: str):
        iv_bytes = base64.b64decode(iv)
        encrypted_bytes = base64.b64decode(encrypted_message)

        cipher = Cipher(algorithms.AES(self.gen_key), modes.CBC(iv_bytes))
        decryptor = cipher.decryptor()

        decrypted_padded = decryptor.update(encrypted_bytes) + decryptor.finalize()

        unpadder = PKCS7(algorithms.AES.block_size).unpadder()
        decrypted_bytes = unpadder.update(decrypted_padded) + unpadder.finalize()

        decrypted_message = decrypted_bytes.decode('utf-8')

        try:
            return json.loads(decrypted_message)
        except json.JSONDecodeError:
            return decrypted_message
