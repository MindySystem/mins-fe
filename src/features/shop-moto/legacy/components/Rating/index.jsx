import React, { useEffect, useState } from 'react';
import moment from "moment/moment";
import avatar from '../../assets/logo/logo_moto.jpg'
import StarRating from "./components/StarRating";
import './rating.scss';
import axios from 'axios';

function Rating({ id }) {
    const [listRating, setListRating] = useState([])

    useEffect(() => {
        axios.get(`/api/product-review/${id}`)
        .then(res => {
            if(res.data.success) {
                setListRating(res.data.data);
            }
        }).catch((e)=> {
            console.log(e.message)
        })
    }, [id])
    
    const ratingSum = listRating.reduce(
        (avg, rating) =>
            avg +
            rating.rate_number
        , 0
    );
    const ratingAvg = ratingSum / listRating.length;

    return (
        <div className=" p-8 border-b-4">
            <div className="w-full">
                <h1 className="text-2xl pb-4">
                    Đánh giá
                    <span className="text-sm text-white bg-sky-400 p-1 ml-2 rounded top-0" >{listRating.length}</span>
                </h1>
                <div className="text-3xl w-full inline-block text-center">
                    <h3 className="text-xl">Đánh Giá Trung Bình</h3>
                    <p>{ratingAvg ? ratingAvg : 0}</p>
                    <div className="text-center w-full">
                        <StarRating rating={ratingAvg ? ratingAvg : 0} />
                    </div>
                </div>
            </div>
            <div className="list-rating pt-8">
                {listRating && listRating.map((item, index) => (
                    <div className="flex items-center mb-4" key={index}>
                        <div className="mr-4 w-14 rounded-full overflow-hidden">
                            <img src={avatar} className="rounded-full" alt="avatar" />
                        </div>
                        <div className="w-full">
                            <div className="">
                                <p className="text-gray-600 font-bold text-lg inline-block">{item.user.name} </p>
                                <span className="text-gray-400 ml-2">{moment(item.createdAt).fromNow()}</span>
                            </div>
                            <StarRating rating={item.rate_number} />
                            <div className="w-full">
                                {item.note}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
export default Rating;
