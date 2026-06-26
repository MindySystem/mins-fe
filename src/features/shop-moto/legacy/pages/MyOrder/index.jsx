import noOrders from 'assets/images/no-order.png';
import axios from 'axios';
import Loading from 'components/Loading';
import Modal from 'components/Modal';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { AiOutlineClockCircle } from 'react-icons/ai';
import { FaListAlt, FaLuggageCart, FaScrewdriver } from 'react-icons/fa';
import { GiCancer, GiReceiveMoney } from 'react-icons/gi';
import { TbTruckDelivery } from 'react-icons/tb';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import checkPromotion from 'utils/CheckPromotion';
import numberWithCommas from 'utils/numberWithCommas';
import Review from './components/Review';

export default function MyOrder() {
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    useEffect(() => {
        scrollToTop();
    }, []);
    const { userInfo } = useSelector((state) => state);
    const [loadingPage, setLoadingPage] = useState(false);
    const [myOrders, setMyOrders] = useState();
    const [confirm, setConfirm] = useState(false);
    const [modalReview, setModalReview] = useState(false);
    const [formReview, setFormReview] = useState(false);
    const [confirmId, setConfirmId] = useState(false);
    // actions for comments    
    const fetchUserOrder = (id) => {
        setLoadingPage(true);
        axios.get(`/api/orders/user/${id}`)
        .then(res => {
            if (res.data.success) {
                setMyOrders(res.data.data);
            }
            setLoadingPage(false);
        })
    }
    useEffect(() => {
        fetchUserOrder(userInfo._id);
    }, [userInfo._id]);

    const [currentTab, setCurrentTab] = useState('all');
    const countStatus = (status) => {
        return myOrders?.filter(bill => bill.status === status).length;
    }

    const newOrders = [].concat(myOrders ? myOrders : [])
        .sort((a, b) => a.itemM > b.itemM ? 1 : -1)
        .filter(order => currentTab === "all" ?
            true : order.status === currentTab);

    const handleCancelOrder = (id) => {
        axios.post(`api/orders/status`, { id, status: 5})
        .then(res => {
          if (res.data.success) {
            const index = newOrders.findIndex(prev => prev._id === id);
            newOrders[index].status = 5;
            setConfirm(false)
            toast.success('Bạn đã hủy thành công.')
          }
        }).catch((e)=>{
          toast.error('Không thể kết nối máy chủ')
        })
    }

  const handleSelectItemCancel = (id) => {
    setConfirm(true)
    setConfirmId(id)
  }

  const handleItemReview = (id, type, productId) => {
    setFormReview({user: userInfo._id, id, type, productId})
    setModalReview(true)
  }

return (
    <>
        <Modal show={modalReview} setShow={setModalReview} title="Đánh giá sản phẩm">
            <Review setModal={setModalReview} formReview={formReview} reload={fetchUserOrder}/>
        </Modal>
        <Modal show={confirm} setShow={setConfirm} title="Xác nhận hủy đơn hàng">
            <div className="mt-2">
            <p className="text-sm text-gray-500">
                Bạn có chắc chắn muốn hủy đặt lịch bảo dưỡng?
            </p>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
                type="button"
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={()=> handleCancelOrder(confirmId)}
            >
                Xác nhận
            </button>
            <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                onClick={()=> setConfirm(false)}
            >
                Bỏ qua
            </button>
            </div>
        </Modal>
            {loadingPage ?
                <div className="product-loading">
                    <Loading />
                </div> :
                <div className="my-order">
                    <div className="container">
                        <div className="my-order-title">
                            <h1><FaLuggageCart /> Lịch sử mua hàng</h1>
                        </div>
                        <div className="my-order-menu">
                            <div className={`my-order-menu-item ${currentTab === 'all' ? 'active' : ''}`}  onClick={() => setCurrentTab('all')}>
                                <FaListAlt className="text-red-500 mr-2" />
                                Tất cả
                                {myOrders?.length ?
                                    <span className="count-item">{myOrders.length}</span>
                                    : ''}
                            </div>
                            <div className={`my-order-menu-item ${currentTab === 0 ? 'active' : ''}`}  onClick={() => setCurrentTab(0)}>
                                <FaScrewdriver className="text-red-500 mr-2" />
                                Đang xử lý
                                {
                                countStatus(0) ?
                                    <span className="count-item">
                                        {countStatus(0)}
                                    </span> : ''
                                }
                            </div>
                            <div className={`my-order-menu-item ${currentTab === 2 ? 'active' : ''}`}  onClick={() => setCurrentTab(2)}>
                                <TbTruckDelivery className="text-red-500 mr-2" />
                                Đang vận chuyển
                                {
                                countStatus(2) ?
                                    <span className="count-item">
                                        {countStatus(2)}
                                    </span> : ''
                                }
                            </div>
                            <div className={`my-order-menu-item ${currentTab === 1 ? 'active' : ''}`}  onClick={() => setCurrentTab(1)}>
                                <GiReceiveMoney className="text-red-500 mr-2" />
                                Đã nhận
                                {
                                countStatus(1) ?
                                    <span className="count-item">
                                        {countStatus(1)}
                                    </span> : ''
                                }
                            </div>
                            <div className={`my-order-menu-item ${currentTab === 3 ? 'active' : ''}`}  onClick={() => setCurrentTab(3)}>
                                <GiCancer className="text-red-500 mr-2" />
                                Đã hủy
                                {
                                countStatus(3) ?
                                    <span className="count-item">
                                        {countStatus(3)}
                                    </span> : ''
                                }
                            </div>
                        </div>
                <div className="my-order-content">
                    <div className="my-order-list">
                        <div>
                            {
                                newOrders?.length > 0 ? newOrders?.map((order, index) => (
                                    <div key={index} className="my-order-list-item">
                                        <div className="item-tag"
                                            style={{
                                                color:
                                                    order.status === 1 ? "green" :
                                                        order.status === 3 ? "#d40a25" :
                                                            "#ffc318"
                                            }}
                                        >
                                            <i className="fas fa-tag"></i>
                                        </div>
                                        <div className="item-top">
                                            <div className="item-top-left">
                                                <h2 className="text-lg"><b>Mã đơn hàng: </b> <i>{order._id}</i></h2>
                                                <p>
                                                    <AiOutlineClockCircle />
                                                    <i> Ngày đặt hàng: {moment(order.createdAt).format("DD/MM/YYYY hh:mm")}</i>
                                                </p>
                                            </div>
                                            <div className="item-top-status_right">
                                                <div className={`btn btn-${
                                                    order.status === 0 ? 'pending' :
                                                    (order.status === 3 || order.status === 5)? 'transport' :
                                                    order.status === 2 ? 'transport' :
                                                    order.status === 1 ? 'received' : 'cancel'
                                                }`}>{
                                                    order.status === 0 ? 'Đang xử lý' :
                                                    order.status === 2 ? 'Đã tiếp nhận' :
                                                    order.status === 3 ? 'Đang vận chuyển' :
                                                    order.status === 5 ? 'Đã gửi yêu cầu hủy' :
                                                    order.status === 4 ? 'Chờ nhận' :
                                                    order.status === 1 ? 'Đã nhận' : 'Đã hủy'
                                                }</div>
                                                <div className={`btn btn-${
                                                    order.payment === 0 ? 'pending' :
                                                    order.payment === 3 ? 'transport' :
                                                    order.payment === 1 ? 'received' : 'cancel'
                                                }`}>{
                                                    order.payment === 0 ? 'Đang xử lý' :
                                                    order.payment === 3 ? 'Đã hoàn trả' :
                                                    order.payment === 1 ? 'Đã thanh toán' : 'Không thành công'
                                                }</div>
                                            </div>
                                        </div>
                                        
                                        { order.orderMoTo && order.orderMoTo.length > 0 && 
                                            <fieldset>
                                            <legend>Mo To:</legend>
                                            {
                                            order.orderMoTo.map((item, index) => (
                                                <div key={index} className="item-content-items">
                                                    <div className="item-content">
                                                        <Link  to={`/shop-moto/product/${item.productId}`} className="flex items-center w-1/2">
                                                            <img src={item.image} alt="" />
                                                            <div className="item-content-info">
                                                                <p>{item.name}</p>
                                                                <i>Số lượng: x{item.quantity}</i>
                                                            </div>
                                                        </Link>
                                                        <div className="">
                                                            Giá xe
                                                        { checkPromotion(item) ? 
                                                            <div className="">
                                                                <span className="line-through text-xs text-gray-500">{numberWithCommas(item.quantity * item.listedPrice)}₫</span>
                                                                <p className="font-bold">{numberWithCommas((item.quantity * item.listedPrice) - (item.promotion_id?.rate / 100 * item.listedPrice))}₫</p>
                                                            </div>
                                                            : <p>{numberWithCommas(item.listedPrice)}₫</p>
                                                        }
                                                        </div>
                                                        <div className="item-content-price">
                                                            <p><b>{numberWithCommas(item.price)}₫</b></p>
                                                            {order.status === 1 && (
                                                                item.rating === 1 ?
                                                                    <span className="btn btn-info">Đã đánh giá</span> :
                                                                    <span
                                                                        className="btn btn-pending"
                                                                        onClick={()=> handleItemReview(item._id, 'moto', item.productId)}>
                                                                        Đánh giá
                                                                    </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                ))
                                            }
                                             <div className='text-right'>  
                                                {order.orderMoTo.status === 0 && <div className="btn btn-pending">Đang xử lý</div>}
                                                {order.orderMoTo.status === 2 && <div className="btn btn-transport">Đã tiếp nhận</div>}
                                                {order.orderMoTo.status === 3 && <div className="btn btn-transport">Đang vận chuyển</div>}
                                                {order.orderMoTo.status === 5 && <div className="btn btn-transport">Đã gửi yêu cầu hủy</div>}
                                                {order.orderMoTo.status === 1 && <div className="btn btn-received">Đã nhận</div>}
                                                {order.orderMoTo.status === -1 && <div className="btn btn-cancel">Đã hủy</div>}
                                            </div>
                                        </fieldset>
                                        }
                                        { order.orderAccessory && 
                                        <fieldset>
                                            <legend>Phụ Tùng:</legend>
                                            {
                                              order.orderAccessory.map((item, index) => (
                                                <div key={index} className="item-content-items">
                                                    <div className="item-content">
                                                    <Link to={`/shop-moto/accessory/${item.productId}`} className=" flex items-center">
                                                        <img src={item.image} alt="" className="w-[100px]" />
                                                        <div className="item-content-info">
                                                            <p>{item.name}</p>
                                                            <i>Số lượng: x{item.quantity}</i>
                                                        </div>
                                                    </Link>
                                                    <div className="item-content-price">
                                                        { checkPromotion(item) ? 
                                                            <div className="">
                                                                <span className="line-through text-xs text-gray-500">{numberWithCommas(item.quantity * item.price)}₫</span>
                                                                <p className="font-bold">{numberWithCommas((item.quantity * item.price) - (item.promotion_id?.rate / 100 * item.price))}₫</p>
                                                            </div>
                                                            : <p>{numberWithCommas(item.quantity * item.price)}₫</p>
                                                        }
                                                        {order.status === 1 && (
                                                            item.rating === 1 ?
                                                                <span className="btn btn-info">Đã đánh giá</span> :
                                                                <span
                                                                    className="btn btn-pending"
                                                                    onClick={()=> handleItemReview(item._id, 'accessory', item.productId)}>
                                                                    Đánh giá
                                                                </span>
                                                        )}
                                                    </div>
                                                    </div>
                                                </div>
                                                ))
                                            }
                                            <div className='text-right'>  
                                                {order.orderMoTo.status === 0 && <div className="btn btn-pending">Đang xử lý</div>}
                                                {order.orderMoTo.status === 2 && <div className="btn btn-transport">Đã tiếp nhận</div>}
                                                {order.orderMoTo.status === 3 && <div className="btn btn-transport">Đang vận chuyển</div>}
                                                {order.orderMoTo.status === 1 && <div className="btn btn-received">Đã nhận</div>}
                                                {order.orderMoTo.status === -1 && <div className="btn btn-cancel">Đã hủy</div>}
                                            </div>
                                        </fieldset>
                                        }
                                        <div className="flex justify-end w-full ">
                                            <div className="w-96">
                                                <div className="flex justify-between text-sm px-4 text-yellow-500">
                                                    Phí ship: <b>{numberWithCommas(order.fee ? order.fee : 0 )} ₫</b>
                                                </div>
                                                <div className="flex justify-between font-bold text-rose-400 px-4">
                                                    Giảm giá: <b>{numberWithCommas(order.discount ? order.discount : 0)}₫</b>
                                                </div>
                                                <div className="flex justify-between text-lg px-4 text-sky-500">
                                                    Giá trị thực tế: <b>{numberWithCommas(order.totalEstimate ? order.totalEstimate : 0 )} ₫</b>
                                                </div>
                                                <div className="flex justify-between item-total">
                                                    Giá trị đơn hàng: <b>{numberWithCommas(order.totalPrice)} ₫</b>
                                                </div>
                                            </div>
                                        </div>
                                        { order.status === 0 && 
                                            <div
                                                className="w-full text-right"
                                            >
                                                <button className="btn-cancel btn" onClick={() => handleSelectItemCancel(order._id)}>
                                                    Hủy đơn hàng
                                                </button>
                                            </div>}

                                    </div>
                            )) : <div className="item-order-empty">
                                <img src={noOrders} alt="" />
                                <p>NO ORDER HERE!</p>
                            </div>
                        }
                    </div>
                </div>
            </div>
                    </div>
                </div>
            }
        </>
    )
}
