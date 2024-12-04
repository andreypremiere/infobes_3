import CryptoJS from 'crypto-js';


export function encryptMessage(sharedKeyBites, message) {
    const iv = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Base64);
    const ivWordArray = CryptoJS.enc.Base64.parse(iv);

    const sharedKey = CryptoJS.lib.WordArray.create(sharedKeyBites);

    // Шифрование
    const encryptedMessage = CryptoJS.AES.encrypt(
        JSON.stringify(message), 
        sharedKey,  
        {
            iv: ivWordArray,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7,
        }
    ).toString();

    return { iv: iv, encryptedMessage: encryptedMessage };
}
    

// Функция для расшифровки сообщения
export function decryptMessage(ivBase64, encryptedMessageBase64, sharedKeyBites) {
    const iv = CryptoJS.enc.Base64.parse(ivBase64);
    const encryptedMessage = CryptoJS.enc.Base64.parse(encryptedMessageBase64);
    const sharedKey = CryptoJS.lib.WordArray.create(sharedKeyBites);

  
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: encryptedMessage },
      sharedKey, // Преобразуем sharedKey
      {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );
  
    const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(plaintext); 
  }

