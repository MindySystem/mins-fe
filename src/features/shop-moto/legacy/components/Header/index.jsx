import { useEffect, useRef, useState } from "react";
import { AiOutlineHistory, AiOutlineUser } from "react-icons/ai";
import { BsSearch } from "react-icons/bs";
import { FiLogOut, FiShoppingCart } from 'react-icons/fi';
import { ImProfile } from "react-icons/im";

import { Link, useLocation, useNavigate } from "react-router-dom";
import Adventure from "../../assets/images/ADVENTURE.jpg";
import Cruiser from "../../assets/images/cruiser.jpg";
import Naked from "../../assets/images/naked.jpg";
import Sport from "../../assets/images/sport.png";
import SportTouring from "../../assets/images/sport_touring.jpg";
import Touring from "../../assets/images/touring.jpg";
import logo from "../../assets/logo/logo_moto.jpg";

import axios from "axios";
import Loading from "components/Loading";
import Login from "components/Login/Login";
import Register from "components/Register";
import SlideOver from "components/SlideOver";
import { FaMotorcycle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { removeUserInfo } from 'stateslice/UserSlice';
import { setCookie } from "utils/cookies";
import numberWithCommas from "utils/numberWithCommas";
import './header.scss';
import { RiBillFill, RiFileHistoryFill } from "react-icons/ri";

function Header() {
    const [search, setSearch] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pageActive, setPageActive] = useState(1);

    const [login, setLogin] = useState(0);

    const { cartList, userInfo } = useSelector((state) => state);
    const [cartCount, setCartCount] = useState(0);

    const searchHeaderDiv = useRef();
    const searchHeaderInput = useRef();
    const searchHeaderResult = useRef();
    const [searchValue, setSearchValue] = useState('')
    const [searchResult, setResults] = useState([])

    const { pathname } = useLocation();
    const dispatch = useDispatch()

    useEffect(() => {
        if (search) {
            setTimeout(async () => {
                await axios.post('/api/products/find-products', { key: searchValue, limit: 10 })
                    .then((res) => {
                        if (res.data.success) {
                            setResults(res.data.data);
                        }
                    })
                    .catch((err) => { console.log(err); });
                clearTimeout()
            }, 500);
        }
    }, [search, searchValue]);

    useEffect(() => {
        if (cartList) {
            setCartCount(cartList.cartMoto.length + cartList.cartAccessory.length)
        }
    }, [cartList])

    const closeSearch = (e) => {
        if (searchHeaderDiv.current !== e.target
            && searchHeaderInput.current !== e.target
            && searchHeaderResult.current !== e.target
        ) {
            setSearchValue(null)
            setSearch(false);
        }
    }

    const handleLogout = () => {
        setLoading(true)
        setTimeout(() => {
            setCookie('TOKEN', null, 0)
            setLoading(false)
            dispatch(removeUserInfo())
            toast.success('Đăng xuất thành công')
            clearTimeout()
        }, 500)
    }

    const handleActivePage = () => {
        if (pathname === '/') setPageActive(1)
        else if (pathname === '/catalog-moto') setPageActive(2)
        else if (pathname === '/service') setPageActive(3)
        else if (pathname === '/catalog-accessory') setPageActive(4)
        else if (pathname === '/news') setPageActive(5)
        else setPageActive(0)
    }

    useEffect(() => {
        handleActivePage();
    })
    const navigate = useNavigate();
    const handleSearchMoTo = (e) => {
        e.preventDefault();
        if(searchValue) {
            setSearch(false)
            setSearchValue(null)
            setSearch(false)
            setSearchValue(null)
            return navigate(`/catalog-moto?search=${searchValue}`)
        }
    }

    return (
        <div>
            <SlideOver show={login === 1} setLogin={setLogin} title={'Tài Khoản'}>
                <Login setLogin={setLogin} setLoading={setLoading} />
            </SlideOver>
            <SlideOver show={login === 2} setLogin={setLogin} title={'Tài Khoản'}>
                <Register setLogin={setLogin} setLoading={setLoading} />
            </SlideOver>
            {loading && <Loading />}

            <div className="header">
                <div className="container">
                    <div className="header__wrap">
                        <div className="logo">
                            <Link to="/shop-moto/">
                                <img src={logo} alt="logo" />
                            </Link>
                        </div>

                        <div className="header__right">
                            <div className="header_menu">
                                <div className={`header_menu_item btn ${pageActive === 1 ? 'active' : ''}`}>
                                    <Link to="/shop-moto/">Trang chủ</Link>
                                </div>
                                <div className={`header_menu_item btn ${pageActive === 2 ? 'active' : ''}`}>
                                    <Link to='/shop-moto/catalog-moto'>
                                        <p className="btn">Dòng xe</p>
                                    </Link>
                                    <div className="header_submenu_dongxe_wrap">
                                        <div className="header_submenu_dongxe">
                                            <Link to="/shop-moto/catalog-moto" className="header_submenu_dongxe_item">
                                                <div className="header_submenu_dongxe_item_img">
                                                    <img src={Naked} alt="type" />
                                                </div>
                                                <p className="header_submenu_dongxe_item_type">HYPER NAKED</p>
                                            </Link>
                                            <Link to="/shop-moto/catalog-moto" className="header_submenu_dongxe_item">
                                                <div className="header_submenu_dongxe_item_img">
                                                    <img src={Sport} alt="type" />
                                                </div>
                                                <p className="header_submenu_dongxe_item_type">SUPPER SPORT</p>
                                            </Link>
                                            <Link to="/shop-moto/catalog-moto" className="header_submenu_dongxe_item">
                                                <div className="header_submenu_dongxe_item_img">
                                                    <img src={Touring} alt="type" />
                                                </div>
                                                <p className="header_submenu_dongxe_item_type">TOURING</p>
                                            </Link>
                                            <Link to="/shop-moto/catalog-moto" className="header_submenu_dongxe_item">
                                                <div className="header_submenu_dongxe_item_img">
                                                    <img src={SportTouring} alt="type" />
                                                </div>
                                                <p className="header_submenu_dongxe_item_type">SPORT TOURING</p>
                                            </Link>
                                            <Link to="/shop-moto/catalog-moto" className="header_submenu_dongxe_item">
                                                <div className="header_submenu_dongxe_item_img">
                                                    <img src={Cruiser} alt="type" />
                                                </div>
                                                <p className="header_submenu_dongxe_item_type">CRUISER</p>
                                            </Link>
                                            <Link to="/shop-moto/catalog-moto" className="header_submenu_dongxe_item">
                                                <div className="header_submenu_dongxe_item_img">
                                                    <img src={Adventure} alt="type" />
                                                </div>
                                                <p className="header_submenu_dongxe_item_type">ADVENTURE</p>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                                <div className={`header_menu_item btn ${pageActive === 3 ? 'active' : ''}`}>
                                    <p className="btn">Dịch vụ</p>
                                    <div className="header_submenu_dichvu">
                                        <Link to='/shop-moto/maintenance' className="header_submenu_dichvu_item">
                                            <p>Đặt lịch bảo dưỡng</p>
                                        </Link>
                                        <Link to='/shop-moto/vehicle-registration'className="header_submenu_dichvu_item">
                                            <p>Đăng ký xe</p>
                                        </Link>
                                        <Link to='/shop-moto/rescue' className="header_submenu_dichvu_item">
                                            <p>Cứu hộ</p>
                                        </Link>
                                    </div>
                                </div>
                                <Link to="/shop-moto/catalog-accessory" className={`header_menu_item btn ${pageActive === 4 ? 'active' : ''}`}>
                                    <p className="btn">Phụ tùng </p>
                                </Link>
                                <div className={`header_menu_item btn ${pageActive === 5 ? 'active' : ''}`}>Tin túc</div>
                            </div>

                            <div className="header_cart">
                                <div className="header_search_icon btn" onClick={() => setSearch(prev => !prev)}>
                                    <p><BsSearch className="icon" /></p>
                                </div>
                                <div className="header_cart_icon btn">
                                    <Link to="/shop-moto/cart">
                                        <FiShoppingCart className="icon" />
                                        {cartCount > 0 && (
                                            <p className="count-item-cart">{cartCount}</p>
                                        )}
                                    </Link>
                                </div>
                            </div>
                            <div className="header_account">
                                { Object.keys(userInfo || {}).length === 0 ?
                                    <div>
                                        <AiOutlineUser className="icon" />
                                        <div className="header_login btn" onClick={() => setLogin(1)}>Đăng nhập |</div>
                                        <div className="header_register btn pl-1" onClick={() => setLogin(2)}>Đăng ký</div>
                                    </div> :
                                    <div className="use-login btn">
                                        <p>{userInfo.name}</p>
                                        <div className="sub-menu-user">
                                            <Link to="/shop-moto/profile" className="flex items-center">
                                                <ImProfile className="icon" />
                                                <p>Thông tin cá nhân</p>
                                            </Link>
                                            <Link to="/shop-moto/my-moto" className="flex items-center">
                                                <FaMotorcycle className="icon" />
                                                <p>Xe của bạn</p>
                                            </Link>
                                            <Link to="/shop-moto/my-order" className="flex items-center">
                                                <AiOutlineHistory className="icon" />
                                                <div>Lịch sử mua hàng</div>
                                            </Link>
                                            <Link to="/shop-moto/maintenance-history" className="flex items-center">
                                                <RiFileHistoryFill className="icon" />
                                                <div>Lịch sử bảo dưỡng</div>
                                            </Link>
                                            <Link to="/shop-moto/vehicle-registration-history" className="flex items-center">
                                                <RiBillFill className="icon" />
                                                <div>Lịch sử đăng ký xe</div>
                                            </Link>
                                            {/* <Link to="/shop-moto/" className="flex items-center">
                                                <CgArrowsExchangeAlt className="icon" />
                                                <p>Trao đổi xe</p>
                                            </Link> */}
                                            <Link to="/shop-moto/" className="flex items-center" onClick={handleLogout}>
                                                <FiLogOut className="icon" />
                                                <p>Đăng xuất</p>
                                            </Link>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
                {
                    search &&
                    <div className="header_search" ref={searchHeaderDiv} onClick={closeSearch} >
                        <form onSubmit={handleSearchMoTo}>
                            <input type="text" className="header_search_input" ref={searchHeaderInput} placeholder="Nhập tên sản phẩm ..." onChange={(e) => setSearchValue(e.target.value)} />
                        </form>
                        <BsSearch className="icon" />
                            <div className="header_search_result">
                                <div className="header_search_result-list" ref={searchHeaderResult}>
                                    {searchResult.length > 0 && searchResult.map((item, index) => (
                                        <Link key={index} to={`/shop-moto/product/${item._id || item.id}`} className="header_search_result-item">
                                            <div className="header_search_result-item-img">
                                                <img src={item.img || Touring} alt='' />
                                            </div>
                                            <p className="header_search_result-item-name">
                                                {item.name}
                                            </p>
                                            <p className="header_search_result-item-price">
                                                {numberWithCommas(item.price)}đ
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                    </div>
                }

            </div>
        </div>
    );
}

export default Header;
