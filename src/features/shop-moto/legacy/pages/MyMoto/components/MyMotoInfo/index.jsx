import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import './my-mo-to.scss';

export default function MyMotoInfo ({ id, setLoadingPage }) {
  const [motoDetail, setMotoDetail] = useState('')
  const [transform, setTransform] = useState()
  const [maintenanceDetail, setMaintenanceDetail] = useState({})

  useEffect(() => {
    setLoadingPage(true);
    axios.get(`/api/my-mo-to/${id}`)
    .then(res => {
        if(res.data.success){
          setMotoDetail(res.data.data);
        }
        setLoadingPage(false);
    })
  }, [id, setLoadingPage])

const handleCheckStatus = (item) => {
  let result = {}
  if (item.status === 1) {
    result = {
      style: 'used',
      msg: 'Đã sử dụng' 
    }
  }
  if (item.status === 2) {
      result = {
        style: 'active-moto',
        msg: 'Kế tiếp' 
      }
    }
  if (item.status === 0) {
    result = {
      style: 'normal',
      msg: '' 
    }
  }
  if (item.status === 3) {
    result = {
      style: 'disable',
      msg: 'Không dùng' 
    }
  }
  return result
}

const handleSelectMaintenan = (item) => {
  setMaintenanceDetail(item)
  setTransform({transform: 'translateY(0)', opacity: 1})
}

return (
  <div>
  { motoDetail &&
    <div className="my-moto-info">
      <div className="content">
        <div className="content-item">
          <p className="item-name">Tên xe: </p>
          <span>{motoDetail.orderMoTo.name}</span>
        </div>
        <div className="content-item">
          <p className="item-name">Số Khung: </p>
          <span>{motoDetail.frameNumber }</span>
        </div>
        <div className="content-item">
          <p className="item-name">Số Máy: </p>
          <span>{motoDetail.engineNumber}</span>
        </div>
        <div className="content-item">
          <p className="item-name">Ngày nhận xe: </p>
          <span>{ moment(motoDetail.timeReceived).format('DD/MM/YYYY') }</span>
        </div>
      </div>
      <h2 className="maintenance-title2">Lịch bảo dưỡng</h2>
      <div className="maintenance-schedule">
        {
            motoDetail.maintenanceTimes.map((item, index) => {
              return (
              <div
                key={index}
                className={`maintenance-item ${handleCheckStatus(item).style}`}
                onClick={() => handleSelectMaintenan(item)}>
                <p className="item-name">P{index + 1}</p>
                <span className="item-status">
                  { handleCheckStatus(item).msg}
                </span>
                <div className="item-date">
                  <p>Từ: {moment(Number(item.startDate)).format('DD/MM/YYYY')}</p>
                  <p>- {moment(item.finishDate).format('DD/MM/YYYY')}</p>
                </div>
              </div>
            )})
          }
      </div>
        <div className="over-detail-wrap">
      <div className="over-detail" style={{ ...transform }}>
          <h1 className="over-detail-title">
            Chi tiết lịch sử sữa chữa
          </h1>
          <div className="over-detail-content">
            <span className={`over-detail-status ${handleCheckStatus(maintenanceDetail).style}`}>
              {handleCheckStatus(maintenanceDetail).msg}
            </span>
            <div className="content-item">
              <b>Ngày làm dịch vụ:</b>
              <p>{maintenanceDetail.timeUsed && moment(maintenanceDetail.timeUsed).format('DD/MM/YYYY')}</p>
            </div>
            <div className="content-item">
              <b>Kỹ thuật viên:</b>
              <p>{maintenanceDetail && maintenanceDetail.staff}</p>
            </div>
            <div className="content-description">
              <p><b>Mô tả:</b></p>
              <textarea readOnly value={maintenanceDetail && maintenanceDetail.description} placeholder="Mô tả công việc..."/>
            </div>
          </div>
          <p className="w-full text-right">
            <span
              className="btn-cancel"
              onClick={()=>setTransform(({
                transform: 'translateY(200%)', opacity: 0
                }))
              }>
                đóng
            </span>
          </p>
        </div>
      </div>
    </div>
    }
  </div>
)}
