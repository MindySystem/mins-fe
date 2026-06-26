import React from 'react';
import serviced from "../assets/images/serviced.jpg";
import ListProduct from "../components/ListProduct";
import Slides from "../components/Slide";
import TopSaling from "../components/TopSaling";

import { useEffect, useState } from "react";
import banner from "../assets/images/new_bike.jpg";
import axios from "axios";
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { addToCartMoto } from 'stateslice/CartSlice';
import Loading from 'components/Loading';

function Home() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  useEffect(() => {
    scrollToTop();
  }, []);
  console.log(123)
  const [listProducts, setListProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const getListProductsApi = async () => {
      const res = await axios.get('/api/products')
      if (res.data && res.status === 200) {
        setListProducts(Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [])
      }
    }
    getListProductsApi();
  }, [])

  const handleAddToCart = (id) => {
    setLoading(true)
    setTimeout(()=>{
      const product = {
          id,
          name: 'New bike 2022',
          brand: 'Ducati',
          color: '',
          image: 'images/products/new_bike.jpg',
          price: 10000000,
          listedPrice: 0,
          type: 1,
          quantity: 1,
      }
      dispatch(addToCartMoto({ id, product }))
      setLoading(false)
      toast.success('Thêm giỏ hàng thành công.')
    }, 500)
  }

  return (
    <>
      {loading && <Loading />}
      <Slides />
      <TopSaling />
      <div className="container">
        <div className="banner_home relative group">
          <img className='absolute inset-0 object-cover transition ease-in-out duration-300 w-full h-full group-hover:opacity-70' src={banner} alt="" />
          <div className="relative p-2">
            <div className="mt-40">
              <div className="transition-all transform translate-y-8 opacity-0 transition ease-in-out duration-300  group-hover:opacity-100 group-hover:translate-y-0">
                <div className="p-2 w-full text-center">
                  <button
                    className="px-4 py-2 text-xl text-white bg-orange-600 rounded-lg uppercase hover:bg-orange-400"
                    onClick={()=>handleAddToCart('630a2d20a69c5e920a6db0f0')}
                   >Đặt mua ngay</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ListProduct products={listProducts} />
      <div className="container">
        <div className="serviced">
          <div className="serviced_img">
            <img src={serviced} alt="" />
          </div>
          <div className="serviced_content">
            <h3>DỊCH VỤ</h3>
            <h1>HÃY ĐỂ MOTOR VIET NAM CHĂM SÓC XE CỦA BẠN</h1>
            <p>
              Việc chăm sóc và bảo dưỡng thường xuyên sẽ giúp xe vận hành an toàn và mang lại cảm giác lái tối ưu.
              Hãy trải nghiệm dịch vụ tại Revzone Yamaha Motor với quy trình chuyên nghiệp,
              đội ngũ được đào tạo trực tiếp từ các chuyên gia Nhật Bản và các trang thiết bị chuyên dụng.
            </p>
            {/* <div className="see_more">
              Xem thêm
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
