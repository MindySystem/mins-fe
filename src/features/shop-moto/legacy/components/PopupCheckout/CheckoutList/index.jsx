import { AiOutlineMinusSquare, AiOutlinePlusSquare } from 'react-icons/ai';
import { BsRecordCircleFill } from 'react-icons/bs';
import { GiCandlebright } from 'react-icons/gi';
import { RiDeleteBinLine } from 'react-icons/ri';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { removeAccessory, removeProduct, selectQuantity } from 'stateslice/CartSlice';
import checkPromotion from 'utils/CheckPromotion';
import numberWithCommas from 'utils/numberWithCommas';

CheckoutList.propTypes = {};

function CheckoutList(props) {
    const { cartMoto, cartAccessory } = props.cartList;
    const dispatch = useDispatch();

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
        dispatch(selectQuantity({ id, quantity }));
    }
    return (
        <div className="cart px-4">
            {
                <div className="body">
                {cartMoto && cartMoto.length > 0 &&
                    <div className="list_moto">
                        <div className="title">
                            <h1><BsRecordCircleFill /> Xe mô tô</h1>
                        </div>
                        <div className="list_item">
                            {cartMoto.map((item, index) => (
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
                {cartAccessory.length > 0 && cartAccessory &&
                    <div className="list_accessory">
                        <div className="title">
                            <h1><BsRecordCircleFill /> Phụ kiện</h1>
                        </div>
                        <div className="list_item">
                            {cartAccessory.map((item, index) => (
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
            </div>
            }
        </div>
    );
}

export default CheckoutList;
