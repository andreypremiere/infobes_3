/* global BigInt */

import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { generateRandomNumber, calculateNumberB, calculateNumberS, deriveKey } from "./numberTools";
import { getKeys, sendKeyB } from "./requests/requestExchangeKey";
import { Registration } from "./components/Registration/Registration";
import { MainWindow } from "./components/MainWindow/MainWindow";
import { Note } from './components/MainWindow/Note'

function App() {
  const [b, setb] = useState(generateRandomNumber());
  const [B, setB] = useState(null);
  const [S, setS] = useState(null);
  const [derivedKey, setDerivedKey] = useState(undefined);


  useEffect(() => {
    const fetchData = async () => {
      const keys = await getKeys(); 
      
      const B_loc = calculateNumberB(keys.key_g, b, keys.key_p);
      setB(B_loc);

      sendKeyB(B_loc);

      const S_local = calculateNumberS(keys.key_A, b, keys.key_p);
      setS(S_local);

      // function uint8ArrayToHex(uint8Array) {
      //   return Array.from(uint8Array)
      //       .map(byte => byte.toString(16).padStart(2, '0')) // Преобразуем каждый байт в шестнадцатеричное значение
      //       .join(''); 
      // }    

      const derivedKey = await deriveKey(S_local); // Генерация ключа
      setDerivedKey(derivedKey);
      // console.log(`derivedKey: ${uint8ArrayToHex(derivedKey)}`)

      // await compareKeys(derivedKey)
      // const data = await getMessage();
      // console.log(`iv: ${data.iv}`)
      // console.log(`iv: ${typeof data.iv}`)

      // console.log(`encrypted_message: ${data.encrypted_message}`)
      // console.log(`encrypted_message: ${typeof data.encrypted_message}`)

      // const decryptedMessage = decryptMessage(data.iv, data.encrypted_message, derivedKey)
      // console.log(decryptedMessage)


      // const dataForChipher = {'one': 'hello', 'two': [32, 28]}
      // const dataIvAndMessage = encryptMessage(derivedKey, dataForChipher)
      // console.log(`iv: ${dataIvAndMessage.iv}`)
      // console.log(`mes: ${dataIvAndMessage.encryptedMessage}`)

      // sendMessage(dataIvAndMessage.iv, dataIvAndMessage.encryptedMessage);

  };

  fetchData();

  }, []); 

  return (
    <Router>
        <Routes>
            <Route path='/' element={<Registration sharedKey={derivedKey}></Registration>} />
            <Route path="/working" element={<MainWindow></MainWindow>} />
            <Route path="/working/:id" element={<Note></Note>} />
        </Routes>
    </Router>
  );
}

export default App;
