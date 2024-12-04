import './Registration.css'
import '../Container/Container.css'
import { requestRegistration, requestEnter } from '../../requests/requestRegister';
import { useState } from 'react';
import { saveTokenWithExpToCookie } from '../../JWTProvider'
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

export function Registration( {sharedKey} ) {
    const location = useLocation();

    if (sharedKey === null || sharedKey === undefined) {
        sharedKey = location.state?.sharedKey;
    }

    const [formData, setFormData] = useState({
        nickName: '',
        password: ''
    });
    const [buttonValue, setButtonValue] = useState('Войти')
    const [actionForm, setActionForm] = useState({title: 'Вход', suffix: 'Зарегистрироваться'})
    const navigate = useNavigate();

    const handleNavigate  = () => {
        navigate('/working', {
            state: {
                sharedKey: sharedKey
            }
        })
    }

    function handleChange(e) {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value
        })
    }

    async function handleSubmit(e) {
        e.preventDefault()

        if (formData.nickName === '' || formData.password === '') {
            console.log('Данные не заполнены')
            return
        }

        let res;
            
        if (actionForm.title === 'Вход') {

            res = await requestEnter(formData.nickName, formData.password, sharedKey)
            
        }
        else {
            res = await requestRegistration(formData.nickName, formData.password, sharedKey)
        }

        if (res.error !== undefined) {
            console.log(res.error)
        }
        else {
            saveTokenWithExpToCookie(res.token);
            handleNavigate();
        }
    }

    function handleChangeState(e) {
        e.preventDefault()
        if (buttonValue === 'Войти') {
            setButtonValue('Зарегистрироваться')
            setActionForm({title: 'Регистрация', suffix: 'Вход'})
        }
        else {
            setButtonValue('Войти')
            setActionForm({title: 'Вход', suffix: 'Регистрация'})
        }

    }

    return (
        <div className='container'>
            <form className='form-container' onSubmit={handleSubmit}>
                <h2>{actionForm.title}</h2>    
                <div className='container-for-field'>
                    <FieldInput label='Никнейм' type='text' name='nickName' value={formData.nickName} onChange={handleChange}></FieldInput>
                    <FieldInput label='Пароль' type='password' name='password' value={formData.password} onChange={handleChange}></FieldInput>
                </div>
                <button type='submit'>{buttonValue}</button>
                <span className='underlined' onClick={handleChangeState}>{actionForm.suffix}</span>
            </form>
        </div>
    );
};

function FieldInput({label, type, name, value, onChange}) {
    return (
        <div className='field-container'>
            <input type={type} name={name} value={value} onChange={onChange} placeholder={label}></input>
        </div>
    )
}