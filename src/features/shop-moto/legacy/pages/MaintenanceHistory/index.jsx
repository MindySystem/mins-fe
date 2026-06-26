import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import Loading from "components/Loading";
import { toast } from "react-toastify";
import './maintenance-history.scss';
import { AiOutlineClockCircle } from "react-icons/ai";
import moment from "moment";
import Modal from "components/Modal";


export default function MaintenanceHistory() {
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
    axios.get(`api/maintenance-service/user/${userInfo._id}`)
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
    axios.post(`api/maintenance-service/status`, { id, status: 5})
    .then(res => {
      if (res.data.success) {
        const index = listMan.findIndex(prev => prev._id === id);
        listMan[index].status = 5;
        setConfirm(false)
        toast.success('Bạn đã gửi yêu cầu hủy đơn thành công.')
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
            Bạn có chắc chắn muốn hủy đặt lịch bảo dưỡng?
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
              <h1>Lịch sử bảo dưỡng</h1>
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
                          item.status === 5 ? 'transport' :
                          item.status === 1 ? 'received' : 'cancel'
                      }`}>{
                          item.status === 0 ? 'Đang xử lý' :
                          item.status === 2 ? 'Đã tiếp nhận' :
                          item.status === 5 ? 'Yêu cầu hủy đơn' :
                          item.status === 1 ? 'Đã hoàn tất' : 'Đã hủy'
                      }</div>
                    </div>
                  </div>
                  <div className="item-content-main">
                      <div className="item-content-main-info">
                          <p><b>Tên xe:</b> {item.product?.name}</p>
                          <p><b>Khung xe:</b> {item.product?.engineNumber}</p>
                          <p><b>Số Máy:</b> {item.product?.frameNumber}</p>
                      </div>
                      <div className="item-content-main-right">
                          <p><b>Ngày bảo dưỡng:</b> {item.dateTime}</p>
                          <p><b>Kỹ thuật viên:</b> {item.staff?.name}</p>
                          <p><b>Chi tiết dịch vụ:</b> {item.description}</p>
                      </div>
                  </div>
                  { [0,2,3].includes(item.status) && 
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
            </div> : <div className="">Bạn chưa có lịch bảo dưỡng nào</div>
          }
          </div>
        </div>
      </div>
    </div>}
  </>);
}
