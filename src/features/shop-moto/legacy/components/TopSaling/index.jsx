import React, { useEffect, useState } from 'react';
import "./topsaling.scss";
import { Link } from "react-router-dom";
import picture1 from "../../assets/images/naked.jpg";
import axios from 'axios';
import numberWithCommas from 'utils/numberWithCommas';


export default function TopSaling () {
    const [products, setProducts] = useState([])
    useEffect(()=> {
        axios.get('/api/products/top-sale')
        .then(res => {
            if(res.data.success){
                setProducts(res.data.data)
            }
        }).catch(e=> console.log(e.message))
    }, [])

    return (
        <div className="container">
            <div className="topsaling">
                <div className="topsaling_title">
                   <p> SẢN PHẨM BÁN CHẠY NHẤT</p>
                   <div className="see_all">Xem tất cả</div>
                </div>
                <div className="topsaling_list">
                {products && products.map((item, index)=>(
                    <Link key={index} to={`/shop-moto/product/${item._id || item.id}`} className="topsaling_list_item">
                        <img src={item ? item.img : ''} className="" alt="" />
                        <div className="item_info">
                            <div className="item_info_name">
                                {item.name}
                            </div>
                            <div className="item_info_price">
                                Giá: {numberWithCommas(Number(item.price))} đ
                            </div> 
                        </div>
                    </Link>
                ))}
                </div>
            </div>
        </div>
    );
}
