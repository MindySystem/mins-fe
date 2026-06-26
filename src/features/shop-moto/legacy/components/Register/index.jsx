/* eslint-disable */
import React from 'react'
import { useState } from 'react'
import './register.scss'
import Axios from 'axios'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import { addUserInfo } from 'stateslice/UserSlice'

export default function Register({ setLogin, setLoading }) {
    const [check, setCheck] = useState({})
    const dispatch = useDispatch()
    const [errorMessage, setErrorMessage] = useState({
        errorName: "",
        errorEmail: "",
        errorPassword: "",
        errorRePassword: "",
        errorPhone: "",
        errorEmail: ""
    })

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: ""
    })

    const checkEmail = (value) => {
        const regexEmail = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)
        if (regexEmail.test(value)) {
            setErrorMessage({ ...errorMessage, errorEmail: "" })
            setFormData({ ...formData, email: value })
            setCheck({ ...check, email: true })
        } else {
            setCheck({ ...check, email: false })
            setErrorMessage({ ...errorMessage, errorEmail: "Email không hợp lệ!" })
        }
    }

    const checkPassword = (value) => {
        const regexPassAlphaLo = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})")
        if (regexPassAlphaLo.test(value)) {
            setErrorMessage({ ...errorMessage, errorPassword: "" })
            setFormData({ ...formData, password: value })
            setCheck({ ...check, password: true })
        } else {
            setCheck({ ...check, password: false })
            setErrorMessage({ ...errorMessage, errorPassword: "Mật khẩu phải có ít nhất 8 ký tự gồm số, chữ thường, hoa và ký tự đặc biệt!" })
        }
    }
    const checkRePassword = (value) => {
        if (value === formData.password) {
            setErrorMessage({ ...errorMessage, errorRePassword: '' })
            setCheck({ ...check, repassword: true })
        } else {
            setCheck({ ...check, repassword: false })
            setErrorMessage({ ...errorMessage, errorRePassword: 'Mật khẩu nhập lại không khớp' })
        }
    }
    const checkPhone = (value) => {
        const regexPhone = new RegExp(/^[0-9\-\+]{9,12}$/)
        if (regexPhone.test(value)) {
            setErrorMessage({ ...errorMessage, errorPhone: "" })
            setFormData({ ...formData, phone: value })
            setCheck({ ...check, phone: true })
        } else {
            setCheck({ ...check, phone: false })
            setErrorMessage({ ...errorMessage, errorPhone: "Số điện thoại không hợp lệ" })
        }
    }
    const checkNull = (id, value) => {
        if (value) {
            setFormData({ ...formData, [id]: value })
            setCheck({ ...check, [id]: true })
        } else {
            setCheck({ ...check, [id]: false })
        }
    }
    function FormError(props) {
        if (props.isHidden) { return null; }
        return (<div className="form-error">{props.errorMessage}</div>)
    }
    const handelRegisterUser = async (e) => {
        e.preventDefault();
        let count = 0
        if (Object.keys(check).length === 6) {
            Object.entries(check).map((item) => {
                if (item) {
                    count += 1
                }
            })
        }
        if (count === 6) {
            setLoading(true)
            await Axios.post('/api/users/register', formData)
                .then((res) => {
                    setLoading(false)
                    if (res.data.success) {
                        setLogin(0)
                        dispatch(addUserInfo(res.data.data))
                        toast.success('Đăng ký thành công')
                    }
                    toast.error(res.data.error)
                })
                .catch((e) => { console.log(e) })
        }
    }

    return (
        <div className="register ">
            <div className="register-container">
                <div className="container-body">
                    <div>
                        <h2 className="title">Đăng Ký</h2>
                    </div>
                    <div className="mt-8">
                        <p className="register-with-title">Đăng ký với</p>
                        <div className="mt-1 grid grid-cols-3 gap-3">
                            <div className="register-with-item">
                                <span className="sr-only">Facebook</span>
                                <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="register-with-item">
                                <span className="sr-only">Sign in with Twitter</span>
                                <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                                </svg>
                            </div>
                            <div className="register-with-item">
                                <span className="sr-only">Sign in with GitHub</span>
                                <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
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
                        <div className="mt-6">
                            <form className="form space-y-6">
                                <div>
                                    <label htmlFor="email" className="form-label">
                                        Họ và tên
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            autoComplete="name"
                                            required
                                            onChange={(e) => checkNull('name', e.target.value)}
                                            className="form-input"
                                        />
                                        <FormError isHidden={errorMessage.errorName} errorMessage={errorMessage.errorName} />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="email" className="form-label">
                                        Email
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
                                        <FormError isHidden={errorMessage.errorEmail} errorMessage={errorMessage.errorEmail} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="password" className="form-label">
                                        Mật khẩu
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            autoComplete="current-password"
                                            onChange={(e) => checkPassword(e.target.value)}
                                            required
                                            className="form-input"
                                        />
                                        <FormError isHidden={errorMessage.rrorPassword} errorMessage={errorMessage.errorPassword} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="password" className="form-label">
                                        Nhập lại mật khẩu
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="re-password"
                                            name="re-password"
                                            type="password"
                                            autoComplete="current-repassword"
                                            onChange={(e) => checkRePassword(e.target.value)}
                                            required
                                            className="form-input"
                                        />
                                        <FormError isHidden={errorMessage.errorRePassword} errorMessage={errorMessage.errorRePassword} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="password" className="form-label">
                                        Số điện thoại
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="text"
                                            autoComplete="current-phone"
                                            required
                                            onChange={(e) => checkPhone(e.target.value)}
                                            className="form-input"
                                        />
                                        <FormError isHidden={errorMessage.errorPhone} errorMessage={errorMessage.errorPhone} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label htmlFor="password" className="form-label">
                                        Địa chỉ
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="address"
                                            name="address"
                                            type="text"
                                            autoComplete="current-address"
                                            required
                                            onChange={(e) => checkNull('address', e.target.value)}
                                            className="form-input"
                                        />
                                        <FormError isHidden={errorMessage.errorEmail} errorMessage={errorMessage.errorEmail} />
                                    </div>
                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        onClick={handelRegisterUser}
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Đăng Ký
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
