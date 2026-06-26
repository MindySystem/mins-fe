import image1 from "assets/images/accessory-r1.jpg";
import image2 from "assets/images/accessory-r2.jpg";
import image3 from "assets/images/accessory-r3.jpg";
import axios from "axios";
import Product2 from '../../assets/images/promotion-bg.png';
import Comment from "components/Comment";
import Loading from "components/Loading";
import Rating from "components/Rating";
import Sale from 'assets/images/sale.png'

import { useEffect, useState } from "react";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { GiCandlebright } from "react-icons/gi";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { addToCartAccessory } from "stateslice/CartSlice";
import numberWithCommas from "utils/numberWithCommas";
import './accessory.scss';
import checkPromotion from "utils/CheckPromotion";

export default function Accessory(props) {
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    useEffect(() => {
        scrollToTop();
    }, []);
    const dispatch = useDispatch();
    const { id } = useParams()
    const [accessory, setAccessory] = useState();
    const [loading, setLoading] = useState(false);
    const [loadingPage, setLoadingPage] = useState(false);   
    const [quantity, setQuantity] = useState(1)
    const { cartList } = useSelector(state => state)
    
    // actions for comments    
    useEffect(() => {
        const getDataApi = async () => {
            setLoadingPage(true);
            await axios.get(`/api/accessory/${id}`)
                .then((res) => {
                    if (res.data.success) {
                        setAccessory(res.data.data)
                        setLoadingPage(false);
                    }
                }).catch(err => console.log(err))
        }
        getDataApi();
    }, [id])

    const handleAddToCartAccessory = (id) => {
        setLoading(true);
        const index = cartList.cartAccessory.findIndex((item) => item.productId === id);
        setTimeout(() => {
            const accessoryCart = {
                name: accessory.name,
                brand: accessory.brand,
                image: accessory.img,
                price: accessory.price,
                type: accessory.type,
                promotion_id: accessory.promotion_id || null,
                promotion_code: accessory.promotion_code,
                quantity
            }
            if (index >= 0) {
                if (Number(cartList.cartAccessory[index].quantity) + Number(quantity) > 50 || Number(cartList.cartAccessory[index].quantity) > 50) {
                    toast.error('Sản phẩm vượt quá số lượng cho phép - 50 sản phẩm')
                } else {
                    dispatch(addToCartAccessory({ id, accessoryCart }))
                    toast.success('Thêm giỏ hàng thành công.')
                }
            } else {
                dispatch(addToCartAccessory({ id, accessoryCart }))
                toast.success('Thêm giỏ hàng thành công.')
            }
            setLoading(false);
            clearTimeout();    
        }, 500);
    }

    return (
        <>
            {loadingPage &&
                <div className="product-loading">
                    <Loading />
                </div>
            }
            {accessory &&
                <div className="accessory">
                    {loading && <Loading />}
                    <div className="container">
                        <div className="flex">
                            <div className="accessory-container-left">
                                <div className="accessory-img">
                                    <img src={accessory.img ? accessory.img : ""} className="" alt={accessory.name} />
                                </div>
                                <div className="accessory-info">
                                    <h3>{accessory.name}</h3>
                                    { checkPromotion(accessory) ? 
                                        <div className="">
                                            <span className="line-through text-lg text-gray-500">{numberWithCommas(accessory.price)}₫</span>
                                            <p className="price flex items-center">
                                                {numberWithCommas(accessory.price - (accessory.promotion_id?.rate / 100 * accessory.price))}₫
                                                <p style={{ backgroundImage: `url(${Sale})` }}
                                                    className="w-16 h-10 bg-contain bg-no-repeat flex items-center justify-center">
                                                </p>
                                            </p>
                                        </div> 
                                        : <p className="price">{numberWithCommas(accessory.price)}₫</p>
                                    }
                                    <p><b>Thương hiệu:</b> {accessory.brand}</p>
                                    <p className="mt-2">Số lượng: </p>
                                    <div className="quantity">
                                        <AiOutlineMinus className="icon" onClick={() => setQuantity(item => item === 1 ? item : item -= 1)} />
                                        <input type="number" min="1" max="99" value={quantity} name="quantity" onChange={(e) => setQuantity(Number(e.target.value) >= 50 ? 50 : Number(e.target.value) <= 0 ? 1 : e.target.value)} />
                                        <AiOutlinePlus className="icon" onClick={() => setQuantity(item => item >= 50 ? 50 : item = Number(item) + 1)} />
                                    </div>
                                    <div className="flex mt-10">
                                        <p className="addtocart" onClick={() => handleAddToCartAccessory(accessory._id)}>Thêm vào giỏ hàng</p>
                                    </div>
                                    <div className="">
                                        { checkPromotion(accessory) &&
                                            <div className="promotion">
                                                <p style={{ backgroundImage: `url(${Product2})` }}>Khuyến Mãi</p>
                                                <ol className="">
                                                { accessory.promotion_id?.rate && 
                                                    <li><GiCandlebright /> Giảm giá {accessory.promotion_id?.rate}%</li>
                                                }
                                                    { accessory.promotion_id?.items.map((item, index)=> (
                                                        <li key={index}><GiCandlebright /> {item}</li>
                                                    ))}
                                                </ol>
                                            </div> 
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className="accessory-container-right">
                                <div className="content">
                                    <div className="item">
                                        <div className="item-img">
                                            <img src={image1} alt="" />
                                        </div>
                                        <div className="item-content">
                                            <p>Bảo đảm chất lượng</p>
                                            <span>Sản phẩm bảo đảm chất lượng.</span>
                                        </div>
                                    </div>
                                    <div className="item">
                                        <div className="item-img">
                                            <img src={image2} alt="" />
                                        </div>
                                        <div className="item-content">
                                            <p>Bảo đảm chất lượng</p>
                                            <span>Sản phẩm bảo đảm chất lượng.</span>
                                        </div>
                                    </div>
                                    <div className="item">
                                        <div className="item-img">
                                            <img src={image3} alt="" />
                                        </div>
                                        <div className="item-content">
                                            <p>Bảo đảm chất lượng</p>
                                            <span>Sản phẩm bảo đảm chất lượng.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="body">
                            <div className="title">
                                <h1>Mô tả</h1>
                            </div>
                            <div className="description">
                                <p>{accessory.decription}</p>
                                <div className="img">
                                    <img src={accessory.img ? accessory.img : ""} alt="details" />
                                </div>
                            </div>
                        </div>
                        <Rating id={id} />
                        <Comment id={id} />
                    </div>
                </div>
            }
        </>
    );
}
