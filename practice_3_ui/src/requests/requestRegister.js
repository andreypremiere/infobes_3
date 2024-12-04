import {encryptMessage, decryptMessage} from '../cryptoTools'

export async function requestRegistration(nickName, password, sharedKey) {
    const dataForSending = {'nickName': nickName, 'password': password}

    const encryptedMessage = encryptMessage(sharedKey, dataForSending)

    const result = await fetch('http://localhost:5000/register_user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            'iv': encryptedMessage.iv, 
            'encryptedMessage': encryptedMessage.encryptedMessage
        }),
    })

    if (!result.ok) {
        const responseData = await result.json();
        return responseData
    }

    const responseData = await result.json();

    const decryptedData = decryptMessage(responseData.iv, responseData.encryptedMessage, sharedKey)
        
    return decryptedData;
}

export async function requestEnter(nickName, password, sharedKey) {
    const dataForSending = {'nickName': nickName, 'password': password}

    const encryptedMessage = encryptMessage(sharedKey, dataForSending)

    const result = await fetch('http://localhost:5000/enter_user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            'iv': encryptedMessage.iv, 
            'encryptedMessage': encryptedMessage.encryptedMessage
        }),
    })


    if (!result.ok) {
        const responseData = await result.json();
        return responseData
    }

    const responseData = await result.json();

    const decryptedData = decryptMessage(responseData.iv, responseData.encryptedMessage, sharedKey)

    return decryptedData
}