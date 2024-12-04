export function saveTokenWithExpToCookie(token) {
    try {
        // Раскодируем JWT без проверки
        const base64Payload = token.split('.')[1];
        const payload = JSON.parse(atob(base64Payload)); // Декодирование Base64

        // Извлекаем `exp` из payload
        const expTimeInSeconds = payload.exp;
        const currentTimeInSeconds = Math.floor(Date.now() / 1000);
        const maxAge = expTimeInSeconds - currentTimeInSeconds;

        console.log('Токен распарсенный:', payload);

        if (maxAge > 0) {
            // Сохраняем токен в cookie с рассчитанным временем жизни
            document.cookie = `jwt=${token}; path=/; Secure; SameSite=Strict; max-age=${maxAge}`;
        } else {
            console.error("Срок действия токена истек, невозможно сохранить в cookie.");
        }
    } catch (error) {
        console.error("Ошибка при обработке JWT токена:", error);
    }
}

export function getTokenFromCookie() {
    try {
        const cookies = document.cookie.split('; ');
        const jwtCookie = cookies.find(row => row.startsWith('jwt='));
        // console.log(jwtCookie);
        return jwtCookie ? jwtCookie.split('=')[1] : null;
    }
    catch (error) {
        console.log('Ошибка взятия токена из кук')
        return null
    }
    
}

export function decodeToken(token) {
    try {
        // Раскодируем JWT без проверки
        const base64Payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(base64Payload)); // Декодирование Base64
        return decodedPayload;
    } catch (err) {
        console.error('Ошибка при декодировании токена:', err);
        return null;
    }
}
