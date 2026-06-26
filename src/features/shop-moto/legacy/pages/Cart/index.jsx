import { React, useEffect, useState } from 'react'
import { AiOutlineMinusSquare, AiOutlinePlusSquare } from 'react-icons/ai'
import { BsRecordCircleFill } from 'react-icons/bs'
import { RiDeleteBinLine } from 'react-icons/ri'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import useQuery from "hooks/useQuery";

import { cartEmpty, removeAccessory, removeProduct, selectQuantity } from 'stateslice/CartSlice'
import cartEmptImg from 'assets/images/empty-cart.png'
import Loading from 'components/Loading'
import Modal from 'components/Modal'
import Payment from 'components/Payment'
import PopupCheckOut from 'components/PopupCheckout'
import numberWithCommas from 'utils/numberWithCommas'
import './cart.scss'
import axios from 'axios';
import { removeFormCheckOut } from 'stateslice/CheckOutData';
import checkPromotion from 'utils/CheckPromotion'
import { GiCandlebright } from 'react-icons/gi'

export default function Cart() {
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    useEffect(() => {
        scrollToTop();
    }, []);
    
    const handleBackToCheckout = () => {
        setLoading(true)
        setPayment(false)
        setTimeout(() => {
        setLoading(false)
        setcheckOutModal(true)
        }, 500)
    }

    const [loadingPage, setLoadingPage] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checkOutModal, setcheckOutModal] = useState(false);
    const [checkoutFormData, setCheckoutFormData] = useState(null);
    const [payment, setPayment] = useState(false);
    
    const handleCheckout = () => {
        setcheckOutModal(true);
        setTimeout(() => {
            setLoading(false);
        }, 500);
    }
    // actions for comments    
    useEffect(() => {
        getDataApi();
    }, [])

    const getDataApi = () => {
        setLoadingPage(true);
        setTimeout(() => {
            setLoadingPage(false);
            clearTimeout();
        }, 500)
    }

    const dispatch = useDispatch();
    const { cartList } = useSelector((state) => state);

    const handleRemoveProduct = (id) => {
        dispatch(removeProduct({ id }))
        toast.success('Xóa sản phẩm thành công')
    }

    const handleRemoveAccessory = (id) => {
        dispatch(removeAccessory({ id }))
        toast.success('Xóa sản phẩm thành công')
    }

    const handleQuantityChange = (id, quantity) => {
        if (quantity === 0) return;
        if (quantity === 50) return;
        dispatch(selectQuantity({ id, quantity }));
    }

    function total() {
        let totalMoto = 0
        let totalAccessory = 0
        if (cartList.cartMoto.length > 0) {
            totalMoto = cartList.cartMoto.reduce(
                (sum) => (
                    sum + 10000000
                ), 0)
        }
        if (cartList.cartAccessory.length > 0) {
            totalAccessory = cartList.cartAccessory.reduce(
                (sum, product) => {
                    const price = product.price 
                    if (checkPromotion(product)) {
                        const rate = product.promotion_id?.rate / 100 * price
    
                        return sum + price * product.quantity - rate
                    } else return sum + price * product.quantity
                }, 0)
        }
        return totalAccessory + totalMoto
    }

    function discount() {
        let discount = 0
        if (cartList.cartAccessory.length > 0) {
            discount = cartList.cartAccessory.reduce(
                (sum, product) => {
                    if (checkPromotion(product)) {
                        const price = product.price
                        const rate = product.promotion_id?.rate / 100 * price * product.quantity
                        return sum + rate
                    } else return sum
                }, 0)
        }
        return discount
    }

    const query = useQuery();
    useEffect(() => {
        if(query.get("vnp_TransactionStatus")){
            const orderData = JSON.parse(localStorage.getItem("persist:root")).formData
            if (query.get("vnp_TransactionStatus") === '00' && JSON.parse(orderData)) {
                setLoading(true)
                const createOrder = async () => {
                    try {
                        axios.post('/api/orders/add', JSON.parse(orderData))
                            .then(res=> {
                                if (res.data.success) {
                                    setPayment(false)
                                    dispatch(cartEmpty())
                                    dispatch(removeFormCheckOut())
                                    toast.success('Thanh toán thành công')
                                }
                                else {
                                    toast.error('Thanh toán thất bại')
                                }
                            }).catch(err=> {console.log(err)});
                        setLoading(false)
                    } catch(e) {
                        console.log(e);
                        toast.error('Thanh toán thất bại')
                    }
                }
                createOrder();
            }
        }
    }, [dispatch, query])

    return (
        <div>
            <Modal show={checkOutModal} setShow={setcheckOutModal} size='max-w-4xl'>
                <PopupCheckOut
                    checkOutModal={checkOutModal}
                    setcheckOutModal={setcheckOutModal}
                    setLoading={setLoading}
                    setPayment={setPayment}
                    setCheckoutFormData={setCheckoutFormData}
                />
            </Modal>
            <Modal show={payment} setShow={setPayment} size='max-w-2xl' title="Thanh Toán">
                <Payment
                    type='cart'
                    back={handleBackToCheckout}
                    formData={checkoutFormData}
                    setPayment={setPayment}
                    setLoading={setLoading}
                    setcheckOutModal={setcheckOutModal}
                />
            </Modal>
            {loadingPage ?
                <div className="product-loading">
                    <Loading />
                </div> :
                <div className="cart">
                    { loading && <Loading /> }
                    <div className="container">
                        <div className="cart_title">
                            Giỏ hàng
                        </div>
                        {(cartList.cartAccessory.length > 0 || cartList.cartMoto.length > 0) ?
                            <div className="body">
                                {cartList.cartMoto && cartList.cartMoto.length > 0 &&
                                    <div className="list_moto">
                                        <div className="title">
                                            <h1><BsRecordCircleFill /> Xe mô tô</h1>
                                        </div>
                                        <div className="list_item">
                                            {cartList.cartMoto.map((item, index) => (
                                                <div className="item" key={`moto_${index}`}>
                                                    <Link to={`/shop-moto/product/${item.id}`} className="w-48  h-32">
                                                        <img src={item.image} alt="product" className="w-full h-full object-cover mr-5" />
                                                    </Link>
                                                    <div className="description">
                                                        <h1>{item.name}</h1>
                                                    </div>
                                                    { 
                                                        checkPromotion(item) ? 
                                                        <div className="text-sm">
                                                            <p className='w-32 font-bold'>Khuyến Mãi</p>
                                                            <ol className="">
                                                                { item.promotion_id?.rate && 
                                                                    <li><GiCandlebright /> Giảm giá {item.promotion_id?.rate}%</li>
                                                                }
                                                                { item.promotion_id?.items.map((item, index)=> (
                                                                    <li key={index}><GiCandlebright /> {item}</li>
                                                                ))}
                                                            </ol>
                                                        </div> 
                                                        : ''
                                                    }
                                                    <div className="price">
                                                        <p>10.000.000₫</p>
                                                        <span>(Giá niêm yết {numberWithCommas(item.listedPrice)}₫)</span>
                                                    </div>
                                                    <div className="quantity">
                                                        <AiOutlineMinusSquare className="btn-quantity" />
                                                        <p>1</p>
                                                        <AiOutlinePlusSquare className="btn-quantity" />
                                                    </div>
                                                    <div className="total_price">
                                                        <p>10.000.000₫</p>
                                                    </div>
                                                    <span className="delete_product" onClick={() => handleRemoveProduct(item.id)}><RiDeleteBinLine /></span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                }
                                {cartList.cartAccessory.length > 0 && cartList.cartAccessory &&
                                    <div className="list_accessory">
                                        <div className="title">
                                            <h1><BsRecordCircleFill /> Phụ kiện</h1>
                                        </div>
                                        <div className="list_item">
                                            {cartList.cartAccessory.map((item, index) => (
                                                <div className="item" key={`accessory_${index}`}>
                                                    <Link to={`/shop-moto/accessory/${item.productId}`} className="w-48 h-32">
                                                        <img src={item.image} alt="product" className="w-full h-full object-cover mr-5" />
                                                    </Link>
                                                    <div className="description">
                                                        <h1>{item.name}</h1>
                                                    </div>
                                                    { 
                                                        checkPromotion(item) ? 
                                                        <div className="text-sm">
                                                            <p className='font-bold'>Khuyến Mãi</p>
                                                            <ol className="">
                                                                { item.promotion_id?.rate && 
                                                                    <li><GiCandlebright /> Giảm giá {item.promotion_id?.rate}%</li>
                                                                }
                                                                { item.promotion_id?.items.map((item, index)=> (
                                                                    <li key={index}><GiCandlebright /> {item}</li>
                                                                ))}
                                                            </ol>
                                                        </div> 
                                                        : ''
                                                    }
                                                    <div className="price">
                                                        <p>{numberWithCommas(item.price)}₫</p>
                                                    </div>
                                                    <div className="quantity">
                                                        <AiOutlineMinusSquare
                                                            className={`btn-quantity ${item.quantity === 1 ? "" : "active"}`}
                                                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                        />
                                                        <p>{item.quantity}</p>
                                                        <AiOutlinePlusSquare
                                                            className="btn-quantity active"
                                                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                        />
                                                    </div>
                                                    <div className="total_price">
                                                        { 
                                                            checkPromotion(item) ? 
                                                                <div className="">
                                                                    <span className="line-through text-lg text-gray-500">{numberWithCommas(item.quantity * item.price)}₫</span>
                                                                    <p>{ numberWithCommas(item.price - (item.promotion_id?.rate / 100 * item.price)) }</p>
                                                                </div>
                                                            : <p>{numberWithCommas(item.quantity * item.price)}₫</p>
                                                        } 
                                                    </div>
                                                    <span className="delete_product" onClick={() => handleRemoveAccessory(item.id)}><RiDeleteBinLine /></span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                }
                                <div className="total_bill">
                                    <p className="text-right text-lg mb-4 text-sky-500">
                                        Giảm giá:
                                        <span className="p-4">{numberWithCommas(discount())}₫</span>
                                    </p>
                                    <p className="border-b-2 inline-block">
                                        Tổng tiền
                                        <span className="p-4">{numberWithCommas(total())}₫</span>
                                    </p>
                                </div>
                                <div className="pay btn" onClick={handleCheckout}>
                                    <p>Thanh toán</p>
                                </div>
                            </div> :
                            <div className="cart-empty">
                                <div>
                                    <img src={cartEmptImg} alt="acrt-empty" />
                                </div>
                            </div>
                        }
                    </div>
                </div>}
        </div>
    )
}
