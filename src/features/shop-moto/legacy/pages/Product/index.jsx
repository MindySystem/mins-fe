import noVideo from 'assets/images/no_video.jpg';
import axios from 'axios';
import Loading from 'components/Loading';
import Modal from 'components/Modal';
import { useEffect, useState } from 'react';
import { BsCalculator } from 'react-icons/bs';
import { GiCandlebright } from 'react-icons/gi';
import { ImLocation } from 'react-icons/im';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import Sale from 'assets/images/sale.png'

import { toast } from 'react-toastify';
import { addToCartMoto } from 'stateslice/CartSlice';
import numberWithCommas from 'utils/numberWithCommas';
import Product2 from '../../assets/images/promotion-bg.png';
import Comment from '../../components/Comment';
import Rating from '../../components/Rating';
import Specifications from './components/Specifications';
import TemporaryPrice from './components/TemporaryPrice';
import checkPromotion from 'utils/CheckPromotion';

export default function Product() {
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    const [productDetail, setProductDetail] = useState(null)
    const { id } = useParams()
    useEffect(() => {
        scrollToTop();
    }, []);
    const [loading, setLoading] = useState(false);
    const [loadingPage, setLoadingPage] = useState(true);
    // const [store, setStore] = useState({})
    const store = {
        id: 1,
        name: 'MOTOR Việt Nam',
        address: 'số 30-34, đường 3/2, Ninh Kiều, TP Cần Thơ'
    };
    // const [listStore, setListStore] = useState(false);
    const [colorIndex, setColorIndex] = useState(0);
    const dispatch = useDispatch();
    const [temporaryPrice, setTemporaryPrice] = useState(false);
    
    useEffect(() => {
        const getProductDetail = async () => {
            await axios.get(`/api/products/${id}`)
                .then(res => {
                    if (res.data.success) {
                        setLoadingPage(false)
                        setProductDetail(res.data.data)
                    }
                }).catch(function (err) {console.log(err)});
        }
        getProductDetail()
    }, [id])

    // const chooseStore = ({ id, name, address }) => {
    //     if (store && store.id === id) return setListStore(false);
    //     else {
    //         const newStore = { id, name, address };
    //         setStore(newStore);
    //         setListStore(false);
    //     }
    // }

    const handleAddToCart = (id) => {
        setLoading(true)
        setTimeout(() => {
            const product = {
                id,
                name: productDetail.name,
                brand: productDetail.brand,
                color: productDetail.color[colorIndex].name_color,
                image: productDetail.color[colorIndex].url,
                price: 10000000,
                listedPrice: productDetail.price,
                promotion_id: productDetail.promotion_id || null,
                promotion_code: productDetail.promotion_code,
                type: productDetail.type,
                quantity: 1,
            }
            setLoading(false)
            if (store) {
                dispatch(addToCartMoto({ id, product }))
                toast.success('Thêm giỏ hàng thành công.')
            } else {
                toast.warn('Vui lòng chọn địa chỉ cửa hàng.')
            }
            clearTimeout();
        }, 500)
    }
    const handleColor = (index, name) => {
        setColorIndex(index)
    }
    function checkLink (val) {
        // eslint-disable-next-line no-useless-escape, no-invalid-regexp
        const link = new RegExp("^(https?\:\/\/)?(www\.youtube\.com|youtu\.be)\/.+$")
        if(link.test(val)) {
            return true
        }
        return false
    }

    return (
        <div>
            { loadingPage && <div className="product-loading"><Loading /></div> }
            <Modal show={temporaryPrice} setShow={setTemporaryPrice} title={'Giá xe lăn bánh'}>
                <TemporaryPrice productDetail={productDetail} />
            </Modal>
                { productDetail && (
                    <div className="product">
                        <div className="product__title" style={{ backgroundImage: `url(${productDetail?.background_img})` }}>
                            <div className="container">
                                <div className="product__info">
                                    <span>{productDetail.content}</span>
                                    <p className="product__name">{productDetail.name}</p>
                                </div>
                            </div>
                        </div>
                        {loading && <Loading />}
                        <div className="container">
                            <div className="product__body">
                                <div className="product__body-right">
                                    <h1>TỔNG QUAN</h1>
                                    <div className="product__body-right-type">
                                        Dòng xe: <span>{productDetail.type}</span>
                                    </div>
                                    <div className="product__body-right-description">
                                        <p>
                                            {productDetail.description}
                                        </p>
                                    </div>
                                    <p>Giá</p>
                                    <div className="product__body-right-money mb-4">
                                        { checkPromotion(productDetail) ?
                                            <div className="">
                                                <span className="line-through text-lg text-gray-500">{numberWithCommas(productDetail?.price)}₫</span>
                                                <h2 className="flex items-center">
                                                    {numberWithCommas(productDetail?.price - (productDetail?.promotion_id?.rate / 100 * productDetail?.price))}₫
                                                    <p style={{ backgroundImage: `url(${Sale})` }}
                                                        className="w-16 h-10 bg-contain bg-no-repeat flex items-center justify-center">
                                                    </p>
                                                </h2>
                                            </div>
                                            : <h2>{numberWithCommas(productDetail?.price)}₫</h2>
                                        }
                                    </div>

                                    { checkPromotion(productDetail) && 
                                        <div className="promotion">
                                            <p style={{ backgroundImage: `url(${Product2})` }}>Khuyến Mãi</p>
                                            <ol className="">
                                                { productDetail.promotion_id?.rate && 
                                                    <li><GiCandlebright /> Giảm giá {productDetail.promotion_id?.rate}%</li>
                                                }
                                                { productDetail.promotion_id?.items.map((item, index)=> (
                                                    <li key={index}><GiCandlebright /> {item}</li>
                                                ))}
                                            </ol>
                                        </div> 
                                    }
                                    <div className="product__body-right-store">
                                        <div className="btn select"
                                            // onClick={() => setListStore(prev => !prev)}
                                        >
                                            <p>ĐẠI LÝ</p>
                                            {/* <BsCaretDown /> */}
                                        </div>
                                        {/* {
                                            store.name && */}
                                            <div className="product__body-right-store-item">
                                                <p>{store.name}</p>
                                                <span>
                                                    <ImLocation className="icon" />
                                                    {store.address}
                                                </span>
                                            </div>
                                        {/* } */}
                                        {/* {
                                            listStore &&
                                            <div className="product__body-right-store-list">
                                                <div
                                                    className="btn"
                                                    onClick={() => chooseStore({
                                                        id: 1,
                                                        name: 'MOTOR Việt Nam',
                                                        address: 'số 30-34, đường 3/2, Ninh Kiều, TP Cần Thơ'
                                                    })}>
                                                    <p>MOTOR Việt Nam</p>
                                                    <span>
                                                        <ImLocation className="icon" />
                                                        số 30-34, đường 3/2, Ninh Kiều, TP Cần Thơ
                                                    </span>
                                                </div>
                                            </div>
                                        } */}
                                    </div>
                                    <div className="product__body-right-deposit">
                                        <div className="btn btn-deposit" onClick={() => handleAddToCart(productDetail._id)}>
                                            ĐẶT CỌC
                                        </div>
                                        <div className="btn btn-compare                                                                                                                                                                 " onClick={() => setTemporaryPrice(true)}>
                                            <span><BsCalculator className="icon" /></span>
                                            Giá tạm tính
                                        </div>
                                        {/* <div className="btn btn-compare">
                                            SO SÁNH XE
                                        </div> */}
                                    </div>
                                    <p className="deposit-money">Đặt cọc trị giá 10,000,000 đồng.</p>
                                </div>
                                <div className="product__body-left">
                                    <div className="product__body-left-img">
                                    <img src={` ${productDetail?.color[colorIndex].url}`} alt='' />
                                    </div>
                                    <div className="product__body-left-color">
                                        {
                                            productDetail.color?.map((item, index) => (
                                                <div key={index} className={`btn ${colorIndex === index ? 'active' : ''}`} onClick={() => handleColor(index)}>
                                                    <img src={item.url ? ` ${item.url}` : ''} alt='' />
                                                    <p>{item.name_color}</p>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>
                            <Specifications specifications={productDetail} />
                            <div className="product_iframe_youtube">
                                {
                                    checkLink(productDetail?.link_youtube) ?
                                    <iframe
                                        className="inline-block"
                                        src={productDetail?.link_youtube}
                                        title="YouTube video player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen>
                                    </iframe> :
                                    <img src={noVideo} alt="no video"/>
                                }
                            </div>
                            <Rating id={id} />
                            <Comment id={id} />
                        </div>
                    </div>
                )
            }
        </div>
    )
}