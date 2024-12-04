export async function getKeys() {
    try {
        const response = await fetch('http://localhost:5000/get_keys', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        // console.log('Полученные ключи:', data);
        return data;
    } catch (error) {
        console.error('Ошибка при получении ключей:', error);
        return null;
    }
}

export async function sendKeyB(keyB) {
    try {
        const response = await fetch('http://localhost:5000/get_key_B', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                key_B: keyB.toString(), 
            }),
        });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const data = await response.json();
    } catch (error) {
        console.error('Ошибка при отправке ключа B:', error);
    }
}


export async function getMessage() {
    try {
        const response = await fetch('http://localhost:5000', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Ошибка: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Ошибка при получении ключей:', error);
        return null;
    }
}

export async function compareKeys(divireKey) {
    const response = await fetch('http://localhost:5000/compare_devire_key', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            'devire_key': btoa(String.fromCharCode(...divireKey)), 
        }),
    });
}

export async function sendMessage(iv, data) {
    const response = await fetch('http://localhost:5000/get_encrypt_message', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
        },
        body: JSON.stringify({
            'iv': iv,
            'decryptMessage': data
        })
    })
}