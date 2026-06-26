import Loading from 'components/Loading';
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { ImProfile } from 'react-icons/im';
import { useSelector } from 'react-redux';
import picture from '../../assets/logo/logo_moto.jpg';

export default function Profile(props) {
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    useEffect(() => {
        scrollToTop();
    }, []);

    let navigate = useNavigate()
    const [loadingPage, setLoadingPage] = useState(false);
    const { userInfo } = useSelector(state => state)
    // actions for comments    
    useEffect(() => {
        if (!userInfo) {
            return navigate("/shop-moto/");
        }
        setLoadingPage(true);
        setTimeout(() => {
            setLoadingPage(false);
            clearTimeout();
        }, 500)
    }, [userInfo, navigate])
    return (
        <>
            {loadingPage ?
                <div className="product-loading">
                    <Loading />
                </div> :
                <div className="profile">
                    <div className="container">
                        <div className="userInfo">
                            <div className="userInfo__item">
                                <div className="userInfo__item__title">
                                    <ImProfile /> Thông tin cá nhân
                                </div>
                                <div className="userInfo__item__content">
                                    <form className="userInfo__item__content__form">
                                        <div className="form-item avatar">
                                            <img className="form-item__img" src={picture} alt="" />
                                            <div className="choose">
                                                <input className="form-item__file" type="file" />
                                                <span>Thay ảnh đại diện</span>
                                            </div>
                                        </div>
                                        <div className="form-item">
                                            <label className="form-item__label" htmlFor="">Số điện thoại</label>
                                            <input className="form-item__input" type="text" defaultValue={ userInfo?.phone } />
                                        </div>

                                        <div className="form-item">
                                            <label className="form-item__label" htmlFor="">Tên người dùng</label>
                                            <input className="form-item__input" type="text" defaultValue={ userInfo?.name } />
                                        </div>

                                        <div className="form-item">
                                            <label className="form-item__label" htmlFor="">Email</label>
                                            <input className="form-item__input" type="email" defaultValue={ userInfo?.email } />
                                        </div>

                                        <div className="form-item">
                                            <label className="form-item__label" htmlFor="">Địa chỉ</label>
                                            <input className="form-item__input" type="text" placeholder="Nhập địa chỉ hiện tại số nhà, đường,..." defaultValue={ userInfo?.address }/>
                                        </div>

                                        <div className="changePassword">
                                            Thay đổi mật khẩu
                                        </div>

                                        <div className="form-item">
                                            <label className="form-item__label" htmlFor="">Nhập mật khẩu mới</label>
                                            <input className="form-item__input" type="password" placeholder="Nhập mật khẩu mới" />
                                        </div>

                                        <div className="form-item">
                                            <label className="form-item__label" htmlFor="">Nhập lại mật khẩu mới</label>
                                            <input className="form-item__input" type="password" placeholder="Nhập lại mật khẩu mới" />
                                        </div>

                                        <div className="form-item">
                                            <button type="button" className="form-item__btn">Cập nhật</button>
                                        </div>

                                    </form>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
            }
        </>
    )
}
