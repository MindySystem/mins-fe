import axios from 'axios';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import numberWithCommas from 'utils/numberWithCommas';
import InputField from 'custom-field/InputField';
import RadioField from 'custom-field/RadioField';
import SelectField from 'custom-field/SelectField';
import CheckoutList from './CheckoutList';
import './checkout.scss';
import { removeFormCheckOut } from 'stateslice/CheckOutData';
import checkPromotion from 'utils/CheckPromotion';

const PopupCheckOut = (props) => {
  const { setcheckOutModal, setPayment, checkOutModal, setCheckoutFormData } = props;
  const [shipOptions, setShipOption] = useState('store');
  const [service, setService] = useState('');
  const { cartList, userInfo } = useSelector((state) => state);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalEstimate, setTotalEstimate] = useState(0);

  const [city, setCity] = useState([]);
  const [district, setDistrict] = useState([]);
  const [commune, setCommune] = useState([]);
  const [citySelect, setCitySelect] = useState({
    label: "--Chọn Thành Phố--",
    value: 0,
  });
  const [districtSelect, setDistrictSelect] = useState({
    label: "--Chọn Quận/Huyện--",
    value: 0,
  });
  const [communeSelect, setCommuneSelect] = useState({
    label: "--Chọn Xã/Phường--",
    value: 0,
  });
  const [shipFee, setShipFee] = useState(0);
  const dispatch = useDispatch();

  // Fetch city on Province page
  useEffect(() => {
    if (shipOptions === 'home') {
      const fetchCity = async () => {
        await axios.get("https://online-gateway.ghn.vn/shiip/public-api/master-data/province", {
          headers: {
            Token: '34192895-31d2-11ed-8636-7617f3863de9'
          }
        }).then(res => {
          if (res.data.message === 'Success') {
            const data = res.data.data || [];
            const cityOptions = data.map((ct) => ({
              label: ct.ProvinceName,
              value: ct.ProvinceID,
            }));
            setCity(cityOptions);
          }
        })
      };
      fetchCity();
    }
  }, [shipOptions]);
  // Fetch district when city change
  useEffect(() => {
    if (citySelect.value) {
      const fetchDistrict = async () => {
        setFormData(prev => ({ ...prev, city: citySelect.label }))
        await axios({
          url: "https://online-gateway.ghn.vn/shiip/public-api/master-data/district",
          method: 'post',
          headers: {
            Token: '34192895-31d2-11ed-8636-7617f3863de9'
          },
          data: { province_id: citySelect.value }
        }).then(res => {
          if (res.data.message === 'Success') {
            const data = res.data.data || [];
            const districtOptions = data.map((ct) => ({
              label: ct.DistrictName,
              value: ct.DistrictID,
            }));
            setDistrict(districtOptions)
          }
        }).catch(err => console.log(err));
      };
      fetchDistrict();
    }
  }, [citySelect]);

  // Fetch commune when district change
  useEffect(() => {
    if (districtSelect.value){
      const fetchCommune = async () => {
        setFormData(prev => ({ ...prev, district: districtSelect.label}))
        await axios({
          url: "https://online-gateway.ghn.vn/shiip/public-api/master-data/ward",
          method: 'post',
          headers: {
            Token: '34192895-31d2-11ed-8636-7617f3863de9'
          },
          data: { district_id: districtSelect.value }
        }).then(res => {
          if (res.data.message === 'Success') {
            const data = res.data.data || [];
            const communeOptions = data.map((ct) => ({
              label: ct.WardName,
              value: ct.WardCode,
            }));
            setCommune(communeOptions);
          }
        }).catch(err => console.log(err));
      };
      fetchCommune();
    }
  }, [districtSelect]);

  // Fetch service on Province page
  useEffect(() => {
    if (districtSelect.value){
      const fetchService = async () => {
        await axios({
          url: "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services",
          method: 'post',
          headers: {
            Token: '34192895-31d2-11ed-8636-7617f3863de9'
          },
          data: { "shop_id": 3248288, "from_district": 1572, "to_district": districtSelect.value }
        })
          .then(res => {
            if (res.data.message === 'Success') {
              setService(res.data.data[0].service_id);
            }
          }).catch(err => console.log(err));
      };
      fetchService();
    }
  }, [districtSelect]);

  useEffect(() => {
    if (communeSelect.value){
      setFormData(prev => ({ ...prev, ward: communeSelect.label}))
      const fetchFee = async () => {
        if (!districtSelect.value || !service) return;
        const raw = {
          "service_id": service,
          "insurance_value": 1000000,
          "coupon": null,
          "from_district_id": 1572,
          "to_district_id": districtSelect.value,
          "to_ward_code": communeSelect.value,
          "height": 15,
          "length": 15,
          "weight": 1000,
          "width": 15
        }
        const config = {
          url: "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee",
          method: 'post',
          headers: {
            shop_id: 3248288,
            Token: '34192895-31d2-11ed-8636-7617f3863de9'
          },
          data: raw
        }
        const fee = await axios(config);
    
        const data = fee.data.data || [];
        if (data) {
          setShipFee(data.total)
        }
      };
      fetchFee();
    }
  }, [districtSelect, communeSelect, service])

  const handleShipStore = () => {
    setShipFee(0)
    setFormData(prev => ({
      ...prev,
      city:'Cần Thơ',
      district: 'Ninh Kiều',
      ward: 'An Khánh',
      address: 'Moto Store'}))
    setShipOption('store');
  }

  const handleShipHome = () => {
    setFormData(prev => ({ ...prev, city: '', district: '', ward: ''}))
    setShipOption('home');
  }
  
  const [formData, setFormData] = useState({
    orderItems: cartList,
    user: userInfo?._id,
    name: userInfo?.name,
    phone: userInfo?.phone,
    email: userInfo?.email,
    payment: 1,
    totalPrice: 0,
    city: 'Cần Thơ',
    district: 'Ninh Kiều',
    ward: 'An Khánh',
    address: 'Moto Store'
  })

  function discount(cartList) {
    let discountMoTo = 0
    let discountAcc = 0

    if (cartList.cartMoto.length > 0) {
      discountMoTo = cartList.cartMoto.reduce(
        (sum, product) => {
          if (checkPromotion(product)) {
            const rate = product.promotion_id?.rate / 100 * product.listedPrice
            return sum + rate
          } else return sum
      }, 0)
    }
    if (cartList.cartAccessory.length > 0) {
        discountAcc = cartList.cartAccessory.reduce(
            (sum, product) => {
              if (checkPromotion(product)) {
                const rate = product.promotion_id?.rate / 100 * product.price * product.quantity
                return sum + rate
              } else return sum
            }, 0)
    }
    return discountAcc + discountMoTo
  }

  function total() {
    let totalMoTo = 0
    let totalAcc = 0

    if (cartList.cartMoto.length > 0) {
      totalMoTo = cartList.cartMoto.reduce(
        (sum, product) =>  sum + product.price, 0)
    }
    if (cartList.cartAccessory.length > 0) {
        totalAcc = cartList.cartAccessory.reduce(
            (sum, product) => sum + product.price, 0)
    }
    return totalAcc + totalMoTo
  }

  useEffect(() => {
    if (checkOutModal){
      let totalMoto = 0
      let totalAccessory = 0
      let totalMotoEstimate = 0
      let totalDiscount = discount(cartList)

      if (cartList.cartMoto.length > 0) {
        totalMotoEstimate = cartList.cartMoto.reduce(
          (sum, product) => {
            if (checkPromotion(product)) {
              const rate = product.promotion_id?.rate / 100 * product.listedPrice
              return sum + product.listedPrice - rate
            } else return sum + product.listedPrice 
        }, 0)
        totalMoto = cartList.cartMoto.reduce(sum=> sum + 10000000, 0)
      }
      if (cartList.cartAccessory.length > 0) {
        totalAccessory = cartList.cartAccessory.reduce(
          (sum, product) => {
            const price = product.price 
            if (checkPromotion(product)) {
              const rate = product.promotion_id?.rate / 100 * price
              return sum + price * product.quantity - rate
            } else return sum + price * product.quantity
          }, 0)
      }

      const total = totalAccessory + totalMoto + shipFee

      if(shipFee) {
        setFormData(prev => ({...prev, fee: shipFee}))
      }
      if(discount(cartList)) {
        setFormData(prev => ({...prev, discount: totalDiscount}))
      }
      const totalEstimate = totalAccessory + totalMotoEstimate + shipFee
      setFormData(prev => ({...prev, totalPrice: total, totalEstimate }))
      setTotalPrice(total)
      setTotalEstimate(totalEstimate)
    }
  }, [cartList, shipFee, checkOutModal])

  const handleSubmitFormCheckOut = (e) => {
    e.preventDefault();
    if (!userInfo) {
      return toast.warn('Vui lòng đăng nhập để thanh toán')
    }
    setFormData(prev => ({...prev, totalPrice: totalPrice}))
    for (let [key, val] of Object.entries(formData)) {
      if (!val) {
        return toast.warn(key + ' không được để trống!')
      }
      if (key === 'email') {
        const regexEmail = new RegExp(/^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/g)
        if (regexEmail.test(key)) {
          return toast.warn(key + ' không hợp lệ')
        }
      }
    }
    dispatch(removeFormCheckOut())
    setcheckOutModal(false)
    setTimeout(() => {
      setPayment(true)
      clearTimeout()
    }, 500)
    setCheckoutFormData(formData) 
  }
  return (
    <>
        <div className="modal__box">
            <div className="modal__card">
              <div className="card-title">
                Có {cartList.cartAccessory.length + cartList.cartMoto.length} sản phẩm trong giỏ hàng
              </div>
              {
                (cartList.cartAccessory.length > 0 || cartList.cartMoto.length > 0) && (
                  <div className="card-body">
                    <div className="checkout-notifications">
                      <p>
                        Đối với xe mô tô quý khách vui lòng đến cửa hàng để thanh toán và nhận xe
                        đồng thời cửa hàng có thể hướng dẫn rõ hơn về cách vận vận hành xe cũng như các dịch vụ đi kèm.
                      </p>
                    </div>
                    <div className="card-product">
                      <CheckoutList cartList={cartList}/>
                    </div>
                    <div className="card-center">
                      <div className="card-total">
                        <div className="cart-total-normal">
                          <p>Tạm tính:</p>
                          <p>{numberWithCommas(total())}₫</p>
                        </div>
                        <div className="cart-total-normal">
                          <p>Phí vận chuyển:</p>
                          <p>{shipOptions === 'home' ? numberWithCommas(shipFee) : 0}₫</p>
                        </div>
                        <div className="flex justify-between items-center font-bold text-rose-400">
                          <p>Giảm giá: </p>
                          <p className="">{numberWithCommas(discount(cartList))}₫</p>
                        </div>
                        <div className="flex justify-between items-center font-bold text-sky-500">
                          <p>Giá trị ước tính: </p>
                          <p>{numberWithCommas(totalEstimate)}₫</p>
                        </div>
                        <div className="flex justify-between items-center font-bold text-red-600 text-xl">
                          <p>Cần thanh toán: </p>
                          <p>{numberWithCommas(totalPrice)}₫</p>
                        </div>
                      </div>
                    </div>
                    <form className="form" onSubmit={handleSubmitFormCheckOut}>
                      <div className="card-form">
                        <div className="card-form-block">
                          <h1 className="text-2xl text-bold">Thông tin khách hàng</h1>
                          <div className="card-form-center">
                            <div className="card-form-info">
                              <div>
                                <InputField
                                  type="text"
                                  label="Họ và tên"
                                  name="name"
                                  required={true}
                                  placeholder="Nhập Họ và Tên*"
                                  defaultValue={userInfo?.name}
                                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                  className="mr-10"
                                />
                              </div>
                              <div>
                                <InputField
                                  type="text"
                                  label="Số điện thoại"
                                  required={true}
                                  defaultValue={userInfo?.phone}
                                  name="phone"
                                  placeholder="Nhập Số điện thoại"
                                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                              </div>
                            </div>
                            <div>
                              <InputField
                                type="email"
                                name="email"
                                label="Email"
                                defaultValue={userInfo?.email}
                                required={true}
                                placeholder="Nhập Email"
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              />
                            </div>
                          </div>
                          {cartList.cartAccessory.length > 0 &&
                            <div>
                              <h2 className="mt-4 font-bold">Chọn hình thức nhận hàng</h2>
                              <div className="card-form-ship">
                                <div className="form-box-radio">
                                  <RadioField
                                    id="shiphome"
                                    title="Giao hàng tận nơi"
                                    name="ship"
                                    type="radio"
                                    defaultChecked={shipOptions === 'home' ? true : false}
                                    onChange={handleShipHome}
                                  />
                                </div>
                                <div className="form-box-radio">
                                  <RadioField
                                    id="shipshop"
                                    title="Nhận tại cửa hàng"
                                    name="ship"
                                    type="radio"
                                    defaultChecked={shipOptions === 'store' ? true : false}
                                    onChange={handleShipStore}
                                  />
                                </div>
                              </div>
                            </div>
                          }
                          {shipOptions === 'home' && (
                            <div className="card-form-ship-address">
                              <div className="card-form-inner">
                                <div className="box__select ship-address-city">
                                  <SelectField
                                    label="Thành Phố" //lable name
                                    options={city}
                                    selected={citySelect}
                                    defaultOption={"--Chọn Thành Phố--"}
                                    onChange={setCitySelect}
                                  />
                                </div>
                                <div className=" box__select ship-address-district">
                                  <SelectField
                                    label="Quận/Huyện" //lable name
                                    options={district}
                                    selected={districtSelect}
                                    defaultOption="--Chọn Quận/Huyện--"
                                    onChange={setDistrictSelect}
                                  />
                                </div>
                              </div>
                              <div className="box__select ship-address-commune">
                                <SelectField
                                  label="Xã/Phường" //lable name
                                  options={commune}
                                  selected={communeSelect}
                                  defaultOption="--Chọn Xã/Phường--"
                                  onChange={setCommuneSelect}
                                />
                              </div>
                              <div className="ship-address-specific">
                                <InputField
                                  type="text"
                                  name="ship-address"
                                  placeholder="Nhập địa chỉ cụ thể*"
                                  required={true}
                                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                              </div>
                            </div>
                          )}
                          {shipOptions === 'store' &&
                            <div className="ship-address-specific">
                              <p>
                                <b>Địa chỉ cửa hàng: </b>
                                <i>Moto Store VIETNAM, đường 3 tháng 2, Hưng Lợi, Ninh Kiều, TP. Cần Thơ</i>
                              </p>
                            </div>
                          }
                        </div>
                      </div>
                      <div className="card-checkout">
                        <button type="submit">
                          <div className="btn btn-checkout">Thanh toán đơn hàng</div>
                        </button>
                        <p>Cảm ơn bạn đã đến với cửa hàng của chúng tôi</p>
                      </div>
                    </form>
                  </div>
                )}
            </div>
        </div>
      </>
  );
}
export default PopupCheckOut;
