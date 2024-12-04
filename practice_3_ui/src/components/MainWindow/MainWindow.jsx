import { getTokenFromCookie, decodeToken } from '../../JWTProvider';
import './MainWindow.css'
import { useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { requestGetNotes, requestAddNote, requestDeleteNote } from '../../requests/requestNotes';


export function MainWindow() {
    const [tokenData, setTokenData] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const formRef = useRef(null)

    const location = useLocation();
    const sharedKey = location.state?.sharedKey || ''

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);

    const [notes, setNotes] = useState([]); 

    useEffect(() => {
        const fetchNotes = async () => {
            const tok = checkToken()
            if (!tok) {
                navigate('/', { state: { sharedKey: sharedKey } });
                return;
            }

            setTokenData(tok);

            const jwt = getTokenFromCookie();
            
            if (!jwt) {
                console.log('Токен остутствует')
                navigate('/', { state: { sharedKey: sharedKey } });
            }

            const fetchedNotes = await requestGetNotes(sharedKey, jwt);

            if (!fetchedNotes) {
                console.log('Ошибка запроса записей.')
            }

            setNotes(fetchedNotes || []);
        };

        fetchNotes();
    }, []);

    function checkToken() {
        let result;
        try {
            const token = getTokenFromCookie();
            if (!token) {
                console.log("Токен отсутствует в cookie.");
                return null;
            }
    
            result = decodeToken(token);
            if (result === null) {
                console.log("Не удалось декодировать токен.");
                return null;
            }
            return result;
        } catch (error) {
            console.log('Ошибка:', error.message);
            return null;
        }
    }
    

    async function fetchUpdateNotes(e, jwt) {
        if (e) e.preventDefault(); 
        try {
            const fetchedNotes = await requestGetNotes(sharedKey, jwt);
            setNotes(fetchedNotes || []);
        } catch (error) {
            console.log("Ошибка при загрузке заметок:", error);
        }
    }

    async function handleAddNote(e) {
        e.preventDefault(); 
        
        const jwt = getTokenFromCookie();
            
        if (!jwt) {
            console.log('Токен остутствует')
            navigate('/', { state: { sharedKey: sharedKey } });
        }

        const form = formRef.current;   
        const formData = new FormData(form);

        const sendingData = Object.fromEntries(formData.entries());

        if (sendingData.title === '' || sendingData.description === '') {
            console.log('Поля не заполнены')
            setIsOpen(false);
            return;
        }

        sendingData.jwt = jwt;

        console.log('Отправляемые данные:', sendingData); 

        const res = await requestAddNote(sendingData, sharedKey)

        fetchUpdateNotes(e, jwt)

        setIsOpen(false)
    }

    function handleToEnter(e) {
        e.preventDefault()
        document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        navigate('/', { state: { sharedKey: sharedKey } })
    }

    function updateNotes(id) {
        setNotes(notes.filter((n) => n.id !== id));
    }

    return (
        <div className="container-main">
            <div className='center-container'>
                <div className='main-block'>

                    <div className='title-container'>
                        <h3>{tokenData ? tokenData.nickName : 'Загрузка'}</h3>
                        <button onClick={handleToEnter}>Выйти</button>
                    </div>

                    <div className='notes-container'>
                        {notes.map((note) => (
                            
                            <Link key={note.id} to={`/working/${note.id}`} state={{noteDetails: note, sharedKey: sharedKey}}>
                                <Notes note={note} sharedKey={sharedKey} updateNotes={updateNotes}></Notes>
                            </Link>
                    
                        ))}
                    </div>

                    <button className='add-button' onClick={openModal}>Добавить запись</button>
                </div>

                <div className="modal-overlay" style={{ display: isOpen ? 'flex' : 'none' }}>
                    <div className="modal">
                        <form ref={formRef} id='add-el' className='form-add'>
                            <div className='part-form'>
                                <label htmlFor="title">Title</label>     
                                <input name='title'></input>
                            </div>
                            <div className='part-form'>
                                <label htmlFor="description">Description</label>     
                                <textarea rows={4} name='description' style={{resize: 'none'}}></textarea>
                            </div>
                        </form>

                        <button onClick={handleAddNote} className='add-button' form='add-el'>Добавить</button>
                        <button className='close-button' onClick={closeModal}>
                            <img src="static\close-square-svgrepo-com.svg" alt="del" />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

function Notes( {note, sharedKey, updateNotes} ) {
    const navigate = useNavigate();

    async function handleDeleteNote(e) {

        const jwt = getTokenFromCookie();
            
        if (!jwt) {
            console.log('Токен остутствует')
            navigate('/', { state: { sharedKey: sharedKey } });
        }

        e.preventDefault()
        await requestDeleteNote(note.id, sharedKey, jwt)
        updateNotes(note.id);
    }

    return(
        <div className='note'>
            <div className='title-note'>
                <span>{note.title}</span>
                <span className='date-note'>{note.creation_date}</span>
            </div>
            <button onClick={handleDeleteNote}>
                <img src="static\trash-svgrepo-com.svg" alt="del" />
            </button>

        </div>
    );
}