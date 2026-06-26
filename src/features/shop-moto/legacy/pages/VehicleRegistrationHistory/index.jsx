import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from 'react-router-dom';

import Loading from "components/Loading";
import { toast } from "react-toastify";
import { AiOutlineClockCircle } from "react-icons/ai";
import moment from "moment";
import Modal from "components/Modal";


export default function VehicleRegistrationHistory() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  useEffect(() => {
    scrollToTop();
  }, []);
  const { userInfo } = useSelector((state) => state);
  const [loadingPage, setLoadingPage] = useState(true);
  const [listMan, setListMan] = useState({});
  const [confirm, setConfirm] = useState(false);
  const [confirmId, setConfirmId] = useState(false);

  useEffect(() => {
    axios.get(`api/vehicle-registration/user/${userInfo._id}`)
    .then(res => {
      if (res.data.success) {
        setListMan(res.data.data)
      }
      setLoadingPage(false)
    }).catch ((e) => {
      toast.error('Không thể kết nối máy chủ')
    })
  }, [userInfo])

  const hanldeCancelBookService = (id) => {
    axios.post(`api/vehicle-registration/status`, { id, status: -1})
    .then(res => {
      if (res.data.success) {
        const index = listMan.findIndex(prev => prev._id === id);
        listMan[index].status = -1;
        setConfirm(false)
        toast.success('Bạn đã hủy thành công.')
      }
    }).catch((e)=>{
      toast.error('Không thể kết nối máy chủ')
    })
  }

  const handleSelectItemCancel = (id) =>{
    setConfirm(true)
    setConfirmId(id)
  }
  
return (
  <>
  { loadingPage ? <Loading /> :
    <div className="maintenance">
      <Modal show={confirm} setShow={setConfirm} title="Xác nhận hủy đơn hàng">
        <div className="mt-2">
          <p className="text-sm text-gray-500">
            Bạn có chắc chắn muốn hủy đăng ký?
          </p>
        </div>
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={()=> hanldeCancelBookService(confirmId)}
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
      <div className="container">
          <div className="maintenance-title">
              <h1>Lịch sử đăng ký xe</h1>
          </div>
          <div className="maintenance-content">
            <div className="maintenance-list">
          {
            listMan.length ? <div className="">
              {
              listMan && listMan.map((item, index) => (
                <div key={index} className="maintenance-list-item">
                  <div className="item-top">
                    <div className="item-top-left">
                      <h2 className="text-lg"><b>Mã đơn hàng: </b> <i>{item._id}</i></h2>
                      <p>
                          <AiOutlineClockCircle />
                          <i> Ngày đặt hàng: {moment(item.createdAt).format("DD/MM/YYYY hh:mm")}</i>
                      </p>
                    </div>
                    <div className="item-top-status_right">
                      <div className={`btn btn-${
                          item.status === 0 ? 'pending' :
                          item.status === 2 ? 'transport' :
                          item.status === 1 ? 'received' : 'cancel'
                      }`}>{
                          item.status === 0 ? 'Đang xử lý' :
                          item.status === 2 ? 'Đã tiếp nhận' :
                          item.status === 1 ? 'Đã hoàn tất' : 'Đã hủy'
                      }</div>
                      <div className={`btn btn-${
                          item.payment === 0 ? 'pending' :
                          item.payment === 3 ? 'transport' :
                          item.payment === 1 ? 'received' : 'cancel'
                      }`}>{
                          item.payment === 0 ? 'Đang xử lý' :
                          item.payment === 3 ? 'Đã hoàn trả' :
                          item.payment === 1 ? 'Đã thanh toán' : 'Không thành công'
                      }</div>
                    </div>
                  </div>
                  <div className="item-content-main">
                      <Link to={`/shop-moto/product/${item?.product?.productId}`} className="item-content-main-info flex items-center">
                        <img className="w-48 h-32" src={item?.product?.image} alt="" />
                        <div className="ml-20">
                          <p className="font-bold w-32 inline-block">Tên xe:</p>
                          <b>{item.product?.name}</b>
                          <div className="">
                            <p className="font-bold w-32 inline-block">Thương hiệu: </p>
                            <span>{item?.product?.brand}</span>
                          </div>
                          <div className="">
                            <p className="font-bold w-32 inline-block">Dòng xe: </p>
                            <span>{item?.product?.type}</span>
                          </div>
                        </div>
                      </Link>
                  </div>
                  { item.status === 0 && 
                    <div
                        className="w-full text-right"
                    >
                        <button className="btn-cancel btn" onClick={() => handleSelectItemCancel(item._id)}>
                          Hủy
                        </button>
                    </div>}
                </div>
                ))
              }
            </div> : <div className="">Bạn chưa có yêu cầu đăng ký xe nào.</div>
          }
          </div>
        </div>
      </div>
    </div>}
  </>);
}
