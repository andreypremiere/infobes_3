
import { prime } from 'bigint-crypto-utils';
import { modPow } from 'bigint-crypto-utils';


// Генерация большого простого числа (асинхронная функция)
export async function generateLargePrime(bits = 512) {
  const largePrime = await prime(bits);
  return largePrime;
}


// Функция для получения простых делителей числа
function getPrimeFactors(n) {
  let factors = [];
  let i = 2n;
  while (i * i <= n) {
    while (n % i === 0n) {
      factors.push(i);
      n /= i;
    }
    i += 1n;
  }
  if (n > 1n) {
    factors.push(n);
  }
  return factors;
}

// Функция для нахождения примитивного корня по модулю p
export async function findPrimitiveRoot(p) {
  const pMinusOne = p - 1n;
  
  // Получаем простые делители числа p-1
  const factors = getPrimeFactors(pMinusOne);
  
  // Ищем примитивный корень
  for (let g = 2n; g < p; g++) {
    let isPrimitive = true;
    
    // Проверяем для каждого делителя p-1
    for (let factor of factors) {
      // Если g^(p-1/factor) % p == 1, то g не примитивный корень
      if (modPow(g, pMinusOne / factor, p) === 1n) {
        isPrimitive = false;
        break;
      }
    }
    
    if (isPrimitive) {
      return g; // Возвращаем примитивный корень
    }
  }

  return null; // Примитивный корень не найден
}
