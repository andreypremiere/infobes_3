/* global BigInt */

import bigInt from 'big-integer';
import CryptoJS from 'crypto-js';


// Генерация числа b
export function generateRandomNumber(minExp = 1, maxExp = 50) {
    const randomNumber = getRandomBigIntInRange(minExp, maxExp)

    // console.log("Сгенерированное число:", randomNumber.toString());

    return randomNumber;
}

// Расчет числа B
export function calculateNumberB(g, b, p) {

    const result = modPow(g, b, p)
    return result;
}

// Расчет общего числа
export function calculateNumberS(A, b, p) {

    const result = modPow(A, b, p)
    return result
}

export async function deriveKey(sharedKey) {
  // Преобразуем sharedKey (число) в ArrayBuffer
  const sharedKeyBuffer = new Uint8Array(
      BigInt(sharedKey).toString(16).match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
  );

  // Константы HKDF
  const salt = new Uint8Array(); // Пустой Uint8Array для соли
  const info = new TextEncoder().encode('diffie-hellman encryption'); // Информация для HKDF

  // Импортируем sharedKey как ключ
  const baseKey = await crypto.subtle.importKey(
      'raw',
      sharedKeyBuffer,
      { name: 'HKDF' },
      false,
      ['deriveBits', 'deriveKey']
  );

  // Генерируем производный ключ
  const derivedKey = await crypto.subtle.deriveKey(
      {
          name: 'HKDF',
          hash: 'SHA-256',
          salt: salt,
          info: info,
      },
      baseKey,
      { name: 'AES-CBC', length: 256 }, // Тип производного ключа
      true,
      ['encrypt', 'decrypt']
  );

  // Экспортируем ключ в формате ArrayBuffer
  const rawKey = await crypto.subtle.exportKey('raw', derivedKey);

  // Возвращаем ключ в виде массива байтов
  return new Uint8Array(rawKey); // Исправлено: возвращаем Uint8Array
}

  

  function uint8ArrayToWordArray(u8Array) {
    const words = [];
    for (let i = 0; i < u8Array.length; i += 4) {
        words.push(
            (u8Array[i] << 24) |
            (u8Array[i + 1] << 16) |
            (u8Array[i + 2] << 8) |
            u8Array[i + 3]
        );
    }
    return CryptoJS.lib.WordArray.create(words, u8Array.length);
}

function modPow(base, exponent, modulus) {
    base = BigInt(base);
    exponent = BigInt(exponent);
    modulus = BigInt(modulus);

    let result = 1n;
    base = base % modulus;

    while (exponent > 0n) {
        if (exponent % 2n === 1n) {
            result = (result * base) % modulus;
        }
        exponent = exponent >> 1n; // делим на 2
        base = (base * base) % modulus;
    }

    return result;
}

function getRandomBigIntInRange(minExponent = 1, maxExponent = 50) {
    // Преобразуем степени в числа типа BigInt
    const min = BigInt(10 ** minExponent);
    const max = BigInt(10 ** maxExponent);
  
    if (min > max) {
      throw new Error("Минимальное значение не может быть больше максимального.");
    }
  
    // Диапазон
    const range = max - min + BigInt(1);
  
    // Генерация случайного числа в диапазоне
    const rand = BigInt(Math.floor(Math.random() * Number(range))); // Ограничиваем `Math.random()` до диапазона
    return min + rand;
  }
  
  export async function deriveKeyPythonCompatible(sharedKey) {
    // Преобразуем sharedKey (число) в ArrayBuffer так же, как в Python
    const sharedKeyBuffer = BigInt(sharedKey)
        .toString(16) // Преобразуем число в строку HEX
        .padStart(sharedKey.length * 2, '0') // Дополняем до чётного количества символов
        .match(/.{1,2}/g) // Разбиваем на пары символов
        .map((byte) => parseInt(byte, 16)); // Преобразуем в байты

    // Конвертируем в Uint8Array
    const sharedKeyArray = new Uint8Array(sharedKeyBuffer);

    // Константы HKDF
    const salt = null; // Нет соли, аналогично Python
    const info = new TextEncoder().encode('diffie-hellman encryption'); // Информация для HKDF

    // Импортируем sharedKey как ключ
    const baseKey = await crypto.subtle.importKey(
        'raw',
        sharedKeyArray,
        { name: 'HKDF' },
        false,
        ['deriveBits', 'deriveKey']
    );

    // Генерируем производный ключ
    const derivedKey = await crypto.subtle.deriveKey(
        {
            name: 'HKDF',
            hash: 'SHA-256',
            salt: new Uint8Array(0), // Пустая соль
            info: info,
        },
        baseKey,
        { name: 'AES-CBC', length: 256 }, // Тип производного ключа
        true,
        ['encrypt', 'decrypt']
    );

    // Экспортируем ключ в формате Uint8Array
    const rawKey = await crypto.subtle.exportKey('raw', derivedKey);

    // Возвращаем ключ в виде массива байтов
    return new Uint8Array(rawKey);
}