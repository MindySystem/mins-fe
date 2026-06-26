import axios from 'axios';
import Loading from 'components/Loading';
import Modal from 'components/Modal';
import Payment from 'components/Payment';
import InputField from 'custom-field/InputField';
import SelectField from 'custom-field/SelectField';
import useQuery from 'hooks/useQuery';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { removeFormCheckOut } from 'stateslice/CheckOutData';
import numberWithCommas from 'utils/numberWithCommas';
import './vehicle-registration.scss';

const VehicleRegistration = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  useEffect(() => {
    scrollToTop();
  }, []);
  const { userInfo } = useSelector((state) => state);
  const [loadingPage, setLoadingPage] = useState(false);
  const [listMoTo, setListMoTo] = useState(null);
  const [checkoutFormData, setCheckoutFormData] = useState(null);
  const [payment, setPayment] = useState(false);
  
  const [priceLicense, setPriceLicense] = useState({
    rate: '',
    price: 0
  })
  const [motoSelected, setMoToSelected] = useState({
    label: 'Xe của bạn',
    value: 0,
  })
  const [errorMessage, setErrorMessage] = useState({
    name: "",
    phone: "",
    user: '',
    cccd: "",
    cccd_date: "",
    cccd_address: "",
    city: "",
    district: "",
    ward: "",
    address: "",
    product: "",
    totalPrice: 1
  })
  const [cityOption, setCityOption] = useState([]);
  const [districtOption, setDistrictOption] = useState([]);
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

  const _initForm = {
    name: '',
    phone: '',
    email: '',
    address: '',
    user: '',
    city: "",
    district: "",
    ward: "",
    product: 'id',
    staff: 'id',
    dateTime: ''
  }
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ _initForm }); 
  function FormError(props) {
    if (props.isHidden) { return null; }
    return (<div className="form-error text-red-600">{props.errorMessage}</div>)
  }
  useEffect(() => {
    if(userInfo) {
      axios.get(`/api/order-moto/user/register/${userInfo._id}`)
      .then(res => {
        setLoadingPage(true)
        if (res.data.success) {
          const data = res.data.data || []
          const motoOptions = data.map((val) => ({
            label: val.name,
            img: val.image,
            value: val._id,
            ...val
          }))
          if (motoOptions) {
            setListMoTo(motoOptions)
          }
          setLoadingPage(false)
        }
      }).catch ((e) => {
        toast.error('Không thể kết nối máy chủ')
      })
    }
  }, [userInfo]);

    // Fetch city on Province page
    useEffect(() => {
      axios.get("https://online-gateway.ghn.vn/shiip/public-api/master-data/province", {
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
          setCityOption(cityOptions);
        }
      })
    }, []);

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
            setDistrictOption(districtOptions)
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

  useEffect(() => {
    if (citySelect.value !== 0) {
      if (citySelect.value === 201 || citySelect.value === 202) {
        setPriceLicense({rate: 5, price: 4000000})
      }
      else {
        setPriceLicense({rate: 2, price: 800000})
      }
    }
  }, [citySelect])

  const checkPhone = (value) => {
    const regexPhone = new RegExp(/^[0-9\-\+]{9,11}$/)
    if (regexPhone.test(value)) {
        setErrorMessage({ ...errorMessage, phone: "" })
        setFormData({ ...formData, phone: value })
    } else {
        setErrorMessage({ ...errorMessage, phone: "Số điện thoại không hợp lệ" })
    }
  }

  const checkEmail = (value) => {
    const regexEmail = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g)
    if (regexEmail.test(value)) {
      setErrorMessage({ ...errorMessage, email: "" })
      setFormData({ ...formData, email: value })
    } else {
        setErrorMessage({ ...errorMessage, email: "Email không hợp lệ" })
    }
  }

  const checkCccd = (value) => {
    const regexPhone = new RegExp(/^[0-9\-\+]{9,12}$/)
    if (regexPhone.test(value)) {
        setErrorMessage({ ...errorMessage, cccd: "" })
        setFormData({ ...formData, cccd: value })
    } else {
        setErrorMessage({ ...errorMessage, cccd: "Số điện CMND/CCCD không hợp lệ" })
    }
  }

  const checkNull = (id, value) => {
    if(!value) setErrorMessage({ ...errorMessage, [id]: "Không được để trống." })
    else {
      setErrorMessage({ ...errorMessage, [id]: '' })
      setFormData({ ...formData, [id]: value })
    }
  }

  const handleSelectProduct = (e) => {
    setMoToSelected(e);
    setErrorMessage(prev => ({...prev, product: ''}))
  }
  const handleSelectCity = (e) => {
    setCitySelect(e);
    setErrorMessage(prev => ({...prev, city: ''}))
  }
  const handleSelectDistrict = (e) => {
    setDistrictSelect(e);
    setErrorMessage(prev => ({...prev, district: ''}))
  }
  const handleSelectWard = (e) => {
    setCommuneSelect(e);
    setErrorMessage(prev => ({...prev, ward: ''}))
  }

  const handleSubmitFormMaintence = (e) => {
    e.preventDefault();
    if(!userInfo) {
      toast.warn("Quý khách vui lòng đăng nhập để đăng ký!")
    } else {
      let count = 0;
      const form = {
        name: formData?.name || userInfo?.name,
        phone: formData?.phone || userInfo?.phone,
        email: formData?.email || userInfo?.email,
        address: formData?.address || userInfo?.address,
        cccd: formData?.cccd,
        cccd_date: formData?.cccd_date,
        cccd_address: formData?.cccd_address,
        city: citySelect.label,
        district: districtSelect.label,
        ward: communeSelect.label,
        user: userInfo?._id,
        product: motoSelected._id ?? '',
        totalPrice: ((priceLicense.rate ?? 0) * (motoSelected.listedPrice ?? 0) / 100) ?? 0
      }
      
      Object.entries(form).map(([key, val]) => {
        if (val && !errorMessage[key] && val !== '--Chọn Thành Phố--'  && val !== '--Chọn Quận/Huyện--' && val !== '--Chọn Xã/Phường--') {
          setErrorMessage(prev => ({ ...prev, [key]: ''}))
          count += 1
        } else {
          setErrorMessage(prev => ({ ...prev, [key]: 'không được để trống'}))
        }
        return count
      })
      if (count === 12) {
        setCheckoutFormData(form)
        setPayment(true)
      }
    }
  }
  const query = useQuery();
  const dispatch = useDispatch();
  const orderData = useSelector(state => state.formData)

  useEffect(() => {
    if(query.get("vnp_TransactionStatus")){
        if (query.get("vnp_TransactionStatus") === '00' && orderData) {
          setLoadingPage(true)
            const createOrder = async () => {
              axios.post("api/vehicle-registration/create", orderData)
              .then(res => {
                if (res.data.success) {
                  dispatch(removeFormCheckOut())
                  toast.success('Thanh toán thành công')
                }
                setLoadingPage(false)
              }).catch((e) => {
                toast.error('Thanh toán thất bại')
              })
            }
            createOrder();
            return navigate('/shop-moto/vehicle-registration-history')
        }
    }
}, [dispatch, query])

return (
  <div className="vehicle-registration">
    {loadingPage && <Loading /> }
    <Modal show={payment} setShow={setPayment} size='max-w-2xl' title="Thanh Toán">
        <Payment
            type='vehicle-registration'
            back={()=>setPayment(false)}
            formData={checkoutFormData}
        />
    </Modal>
        <div className="container">
          <div className="vehicle-registration-title">
              <h1>Đăng ký xe</h1>
            </div>
          {
            listMoTo && listMoTo?.length ?

            <form onSubmit={handleSubmitFormMaintence}>
            <div className="my-10 sm:mt-0">
              <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                  <div className="px-4 sm:px-0">
                    <h3 className="content__title">
                      Thông tin cá nhân của bạn
                    </h3>
                    <p className="mt-1 text-sm text-gray-600"></p>
                  </div>
                </div>
                <div className="my-5 md:col-span-2 md:mt-0">
                    <div className="shadow sm:rounded-md">
                      <div className="bg-white px-4 py-5 sm:p-6">
                        <div className="grid grid-cols-6 gap-6">
                          <div className="col-span-6 sm:col-span-3">
                            <InputField
                              label="Họ và tên của bạn"
                              name="first-name"
                              type="text"
                              // required
                              defaultValue={userInfo?.name}
                              onChange={(e) => setFormData(prev => ({...prev, name: e.target.value }))}
                            />
                            <FormError isHiden={errorMessage.name} errorMessage={errorMessage.name} />
                          </div>
                          <div className="col-span-6 sm:col-span-3">
                            <InputField
                              label="Số điện thoại"
                              name="phone"
                              type="text"
                              // required
                              defaultValue={userInfo?.phone}
                              onChange={(e) => checkPhone(e.target.value)}
                            />
                            <FormError isHiden={errorMessage.phone} errorMessage={errorMessage.phone} />
                          </div>
                          <div className="col-span-6 sm:col-span-3">
                            <InputField
                              label="Email"
                              name="email"
                              type="text"
                              // required
                              defaultValue={userInfo?.email}
                              onChange={(e) => checkEmail(prev => ({...prev, email: e.target.value }))}
                              />
                            <FormError isHiden={errorMessage.email} errorMessage={errorMessage.email} />
                          </div>
                          <div className="col-span-6 sm:col-span-4">
                            <InputField
                              label="Số CMCD/CCCD"
                              name="cccd"
                              type="text"
                              // required
                              defaultValue={userInfo?.cccd}
                              onChange={(e) => checkCccd(e.target.value)}
                              />
                            <FormError isHiden={errorMessage.cccd} errorMessage={errorMessage.cccd} />
                          </div>
                          <div className="col-span-6 sm:col-span-3">
                            <InputField
                              label="Ngày cấp"
                              name="cccd_date"
                              type="text"
                              // required
                              defaultValue={formData?.cccd_date}
                              onChange={(e) => checkNull('cccd_date', e.target.value)}
                              />
                            <FormError isHiden={errorMessage.cccd_date} errorMessage={errorMessage.cccd_date} />
                          </div>
                          <div className="col-span-6 sm:col-span-3">
                            <InputField
                              label="Nơi cấp"
                              name="cccd_address"
                              type="text"
                              // required
                              defaultValue={formData?.cccd_address}
                              onChange={(e) => checkNull('cccd_address', e.target.value)}
                              />
                            <FormError isHiden={errorMessage.cccd_address} errorMessage={errorMessage.cccd_address} />
                          </div>
                        <div className="col-span-6 sm:col-span-3">
                            <SelectField
                              label="Thành Phố" //lable name
                              options={cityOption}
                              selected={citySelect}
                              defaultOption={"--Chọn Thành Phố--"}
                              onChange={handleSelectCity}
                            />
                            <FormError isHiden={errorMessage.city} errorMessage={errorMessage.city} />
                          </div>
                          <div className="col-span-6 sm:col-span-3">
                            <SelectField
                              label="Quận/Huyện" //lable name
                              options={districtOption}
                              selected={districtSelect}
                              defaultOption="--Chọn Quận/Huyện--"
                              onChange={handleSelectDistrict}
                            />
                            <FormError isHiden={errorMessage.district} errorMessage={errorMessage.district} />
                          </div>
                          <div className="col-span-6 sm:col-span-3">
                            <SelectField
                              label="Xã/Phường" //lable name
                              options={commune}
                              selected={communeSelect}
                              defaultOption="--Chọn Xã/Phường--"
                              onChange={handleSelectWard}
                            />
                            <FormError isHiden={errorMessage.ward} errorMessage={errorMessage.ward} />
                          </div>
                          <div className="col-span-3 sm:col-span-6">
                            <InputField
                              label="Địa chỉ"
                              name="address"
                              type="text"
                              // required
                              defaultValue={userInfo?.address}
                              onChange={(e) => setFormData(prev => ({...prev, address: e.target.value }))}
                              />
                            <FormError isHiden={errorMessage.address} errorMessage={errorMessage.address} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-10 mb-32 sm:mt-0">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                  <div className="md:col-span-1">
                    <div className="px-4 sm:px-0">
                      <h3 className="content__title">Đăng ký cho xe</h3>
                      <p className="mt-1 text-sm text-gray-600"></p>
                    </div>
                  </div>
                  <div className="mt-5 md:col-span-2 md:mt-0">
                    <SelectField
                      label="Xe của bạn" //lable name
                      options={listMoTo}
                      selected={motoSelected}
                      onChange={handleSelectProduct}
                    />
                    <FormError isHiden={errorMessage.product} errorMessage={errorMessage.product} />
                  </div>
                </div>
                <div className="w-[400px] float-right mt-6">
                  <div className="flex justify-between items-center font-bold text-sky-500">
                    <p>Giá xe:</p>
                    <p>{ numberWithCommas(motoSelected.listedPrice ?? 0) }₫</p>
                  </div>
                  <div className="flex justify-between items-center font-bold text-sky-500">
                    <p>Phí trước bạ ({priceLicense.rate}%): </p>
                    <p>{numberWithCommas(priceLicense.price ?? 0)}₫</p>
                  </div>
                  <div className="flex justify-between items-center font-bold text-red-600 text-xl">
                    <p>Cần thanh toán: </p>
                    <p>{numberWithCommas(((priceLicense.rate ?? 0) * (motoSelected.listedPrice ?? 0) / 100) ?? 0)}₫</p>
                  </div>
                </div>
              </div>
              <div className="py-5 mb-32">
                  <div className="flex justify-end">
                    <button type="submit" className="btn btn-deposit">
                        Đăng ký xe
                    </button>
                  </div>
              </div>
            </form>
          : <p className="font-bold text-xl text-center">
            Bạn chưa có đơn hàng nào mua xe
          </p>
          }
        </div>
    </div>
  );
}

export default VehicleRegistration
