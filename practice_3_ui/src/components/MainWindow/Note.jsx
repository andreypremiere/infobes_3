import React, { useRef } from 'react';
import { useParams } from 'react-router-dom';
import './Note.css'
import { useLocation, useNavigate } from 'react-router-dom';
import { requestUpdateNote } from '../../requests/requestNotes';
import { getTokenFromCookie } from '../../JWTProvider';


export function Note() {
    const location = useLocation();
    const { id } = useParams(); 
    const note = location.state?.noteDetails;
    const sharedKey = location.state?.sharedKey;
    const formRef = useRef(null)
    const navigate = useNavigate();


    if (!note) { 
        return <div>Заметка не найдена</div>; 
    }

    async function handleRequest(e) {
        e.preventDefault(); 
        
        const form = formRef.current;
        const formData = new FormData(form);

        const sendingData = Object.fromEntries(formData.entries());
        sendingData.id = id;

        console.log('Отправляемые данные:', sendingData); 

        const jwt = getTokenFromCookie();
            
            if (!jwt) {
                console.log('Токен остутствует')
                navigate('/', { state: { sharedKey: sharedKey } });
            }

        const res = await requestUpdateNote(sendingData, sharedKey, jwt)
        console.log('Результат отправки обновления формы', res)

        navigate('/working', {
            state: {
                sharedKey: sharedKey
            }
        })

    }

    return (
        <div className='note-block'>
            <div className="modal">
                <form ref={formRef} className='form-add'>
                    <div className='part-form'>
                        <label htmlFor="title">Title</label>     
                        <input name='title' placeholder='Заголовок' defaultValue={note.title}></input>
                    </div>
                    <div className='part-form'>
                        <label htmlFor="description">Description</label>     
                        <textarea placeholder='Описание' rows={4} name='description' style={{resize: 'none'}} defaultValue={note.description}></textarea>
                    </div>
                </form>
                
                <button onClick={handleRequest} className='add-button'>Сохранить</button>
            </div>
        </div>
    )
}