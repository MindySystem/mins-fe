/* eslint-disable */
import InputField from 'custom-field/InputField'
import React from 'react'
import { useState } from 'react'
import './Login.scss'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
import { BsFacebook, BsTwitter, BsGithub } from 'react-icons/bs'
import { toast } from 'react-toastify'
import Loading from 'components/Loading'
import { useDispatch } from 'react-redux'
import { addUserInfo } from 'stateslice/UserSlice'
import axios from 'axios'
import { setCookie } from 'utils/cookies'

export default function Login({ setLogin, setSigin }) {
    const [showPass, setShowPass] = useState(false)
    const [typePass, setTypePass] = useState(false)

    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const [errorMessage, setErrorMessage] = useState({
        errorEmail: "",
        errorPassword: ""
    })
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })

    const checkEmail = (value) => {
        const regexEmail = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)
        if (regexEmail.test(value)) {
            setErrorMessage( prev => ({email: ''}))
            setFormData({ ...formData, email: value })
        } else {
            setErrorMessage( prev => ({email: "Email không hợp lệ!"}))
            setFormData({ ...formData, email: '' })
        }
    }

    const checkPassword = (value) => {
        const regexPassAlphaLo = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})")
        if (regexPassAlphaLo.test(value)) {
            setErrorMessage( prev => ({password: ''}))
            setFormData({ ...formData, password: value })
        } else {
            setErrorMessage( prev => ({password: "Mật khẩu phải có ít nhất 8 ký tự gồm số, chữ thường, hoa và ký tự đặc biệt!"}))
            setFormData({ ...formData, password: '' })
        }
    }
    function FormError(props) {
        if (props.isHidden) { return null; }
        return (<div className="form-error">{props.errorMessage}</div>)
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (formData.email && formData.password) {  
            await axios.post('/api/users/signin', formData)
                .then(res => {
                    if (res.data.success) {
                        setLogin(0)
                        setCookie('TOKEN', res.data.data.token)
                        dispatch(addUserInfo({ user: res.data.data }))
                        toast.success('Đăng nhập thành công')
                    } else {
                        toast.error(res.data.error)
                        setLoading(false);
                    }
                }).catch(err => toast.error(err));
        } else {
            setLoading(false);
            toast.warn('Vui lòng nhập đầy đủ thông tin')
        }
    }

    const handleShowPass = () => {
        setTypePass(prev => !prev)
        setShowPass(prev => !prev)
    }

    return (
        <div className="login">
            <div className="box-login">
                <div className="box-login-container">
                    <div>
                        <h2 className="container-title">Đăng Nhập</h2>
                    </div>
                    <div className="container-body">
                        <div>
                            <p className="login-width">Đăng nhập với</p>

                            <div className="login-width-list">
                                <div
                                    className="item"
                                >
                                    <span className="sr-only">Facebook</span>
                                    <BsFacebook className="w-5 h-5"/>
                                </div>

                                <div
                                    className="item"
                                >
                                    <span className="sr-only">Sign in with Twitter</span>
                                    <BsTwitter className="w-5 h-5" />
                                </div>

                                <div
                                    className="item"
                                >
                                    <span className="sr-only">Sign in with GitHub</span>
                                    <BsGithub className="w-5 h-5" />

                                </div>
                            </div>

                            <div className="mt-6 relative">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <form className="form space-y-6">
                                <div>
                                    <label htmlFor="email" className="form-label">
                                        Email address
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            onChange={(e) => checkEmail(e.target.value)}
                                            className="form-input"
                                        />
                                        <FormError isHidden={errorMessage.email} errorMessage={errorMessage.email} />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label htmlFor="password" className="form-label">
                                        Password
                                    </label>
                                    <div className="mt-1 relative">
                                        <input
                                            id="password"
                                            name="password"
                                            type={ typePass ? 'text' : 'password'}
                                            autoComplete="current-password"
                                            required
                                            onChange={(e) => checkPassword(e.target.value)}
                                            className="form-input"
                                        />
                                        <FormError isHidden={errorMessage.password} errorMessage={errorMessage.password} />
                                        <span className="show-pass" onClick={handleShowPass}>
                                        {
                                            showPass ?
                                            <AiOutlineEyeInvisible />
                                            : <AiOutlineEye />
                                        }
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <input
                                            id="remember-me"
                                            name="remember-me"
                                            type="checkbox"
                                            className="form-checkbox"
                                        />
                                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                            Lưu thông tin
                                        </label>
                                    </div>

                                    <div className="text-sm">
                                        <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                                            Quên mật khẩu?
                                        </a>
                                    </div>
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        onClick={(e) => handleLogin(e)}
                                        className="form-button"
                                    >
                                        Đăng Nhập
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
