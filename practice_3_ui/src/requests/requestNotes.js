import { decodeToken, getTokenFromCookie } from "../JWTProvider"
import { encryptMessage, decryptMessage } from "../cryptoTools"

export async function requestUpdateNote(data, sharedKey, jwt) {

    data.jwt = jwt;

    const encryptedMessage = encryptMessage(sharedKey, data)

    const result = await fetch('http://localhost:5000/update_note', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            'iv': encryptedMessage.iv, 
            'encryptedMessage': encryptedMessage.encryptedMessage
        }),
    })

    if (result.status === 200) {
        return true
    }
    
    return false
}

export async function requestGetNotes(sharedKey, jwt) {
    if (!jwt) {
        return null;
    }

    const data = {'jwt': jwt}

    console.log(data)

    const encryptedMessage = encryptMessage(sharedKey, data)

    const result = await fetch('http://localhost:5000/get_user_notes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            'iv': encryptedMessage.iv, 
            'encryptedMessage': encryptedMessage.encryptedMessage
        }),
    })

    const responseData = await result.json();

    const decryptedData = decryptMessage(responseData.iv, responseData.encryptedMessage, sharedKey)

    return decryptedData.notes
}

export async function requestAddNote(sendingData, sharedKey) {

    const encryptedMessage = encryptMessage(sharedKey, sendingData)
    console.log(sendingData)

    const result = await fetch('http://localhost:5000/add_note', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            'iv': encryptedMessage.iv, 
            'encryptedMessage': encryptedMessage.encryptedMessage
        }),
    })

    const responseData = await result.json();

    return responseData
}

export async function requestDeleteNote(id, sharedKey, jwt) {
    const sendingData = {id: id, jwt: jwt}

    const encryptedMessage = encryptMessage(sharedKey, sendingData)

    const result = await fetch('http://localhost:5000/delete_note', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            'iv': encryptedMessage.iv, 
            'encryptedMessage': encryptedMessage.encryptedMessage
        }),
    })

    const responseData = await result.json();

    return responseData
}