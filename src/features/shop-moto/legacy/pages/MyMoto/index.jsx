import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

import Loading from "components/Loading";
import noCollection from 'assets/images/no-collection.png';
import Modal from "components/Modal";
import './mymoto.scss';
import moment from "moment";
import MyMotoInfo from "./components/MyMotoInfo";


export default function MyMoto(props) {
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    useEffect(() => {
        scrollToTop();
    }, []);
    const { userInfo } = useSelector((state) => state);
    const [loadingPage, setLoadingPage] = useState(false);
    const [myMoTos, setMyMotos] = useState(false);
    const [myMoToDetail, setMyMoToDetail] = useState(false);
    const [motoId, setMotoId] = useState(false);
    
    // actions for comments    
    useEffect(() => {
        if (userInfo){
            setLoadingPage(true);
            axios.get(`/api/my-mo-to/user/${userInfo._id}`)
            .then(res => {
                if(res.data.success){
                    setMyMotos(res.data.data)
                }
                setLoadingPage(false);
            })
        }
    }, [userInfo])

    const handleSelectMyMoto = (id) => {
        setMyMoToDetail(true)
        setMotoId(id)
    }

    return (
        <div className="my-moto">
            <Modal show={myMoToDetail} setShow={setMyMoToDetail} title="Thông tin xe của bạn">
                <MyMotoInfo id={motoId} setLoadingPage={setLoadingPage}/>
            </Modal>
            {loadingPage && <Loading /> }
            <div className="container">
                <div className="my-moto-title">
                    <h1>Xe của bạn</h1>
                </div>
                {
                    myMoTos ? myMoTos.map((item, index) => (
                        <div key={index} className="my-moto-list">
                            <div className="my-moto-list-item">
                                <div className="item-left">
                                    <div className="item-img">
                                        <img src={item && item.orderMoTo.image} alt="" />
                                    </div>
                                </div>
                                <div className="item-right">
                                    <h1 className="title">Thông tin xe</h1>
                                    <div className="item-content">
                                        <div>
                                            <span>Ngày nhận xe: </span>
                                            <i className="item-time">{item && moment(item.createAt).format('DD-MM-YYYY hh:mm')}</i>
                                        </div>
                                        <div>
                                            <span>Thương hiệu: </span>
                                            <span className="item-brand">{item && item.orderMoTo.brand}</span>
                                        </div>
                                        <div>
                                            <span>Dòng xe: </span>
                                            <span className="item-type">{item && item.orderMoTo.type}</span>
                                        </div>
                                        <div>
                                            <span>Tên Xe: </span>
                                            <span className="item-name">{item && item.orderMoTo.name}</span>
                                        </div>
                                        <div>
                                            <span>Trạng thái: </span>
                                            <span className={`btn-${item.status === 1 ? 'received' : item.status === 2 ? 'pending':
                                                                    item.status === 3 ? 'cancel' : 'pending' }`}>
                                                {item.status === 1 ? 'Đang hoạt động' : item.status === 2 ? 'Đang bán' : item.status === 3 ? 'Đã bán' : 'đang xử lý'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="btn-info btn-detail" onClick={()=> handleSelectMyMoto(item._id)}>Xem chi tiết</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )) :
                    <img src={noCollection} className="w-full" alt="noCollection" />
                }
            </div>
        </div>
    );
}
