import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { AiOutlineLoading } from 'react-icons/ai';

import Loading from "components/Loading";
import { toast } from "react-toastify";
import './maintenance.scss';
import SelectField from "custom-field/SelectField";
import InputField from "custom-field/InputField";
import { useNavigate } from "react-router-dom";
import moment from "moment";

export default function Maintenance(props) {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  useEffect(() => {
    scrollToTop();
  }, []);
  const { userInfo } = useSelector((state) => state);
  const [loadingPage, setLoadingPage] = useState(false);
  const [loadingTime, setLoadingTime] = useState(false);
  const [listMoTo, setListMoTo] = useState(null);
  const [timeService, setTimeService] = useState([])
  const [timeServiceId, setTimeServiceId] = useState({})
  const [motoSelected, setMoToSelected] = useState({
    label: 'Xe của bạn',
    value: 0,
  })
  const [date, setDate] = useState(new Date())
  const toDay = new Date();
  const [listStaff, setListStaff] = useState(null);
  const [staffSelected, setStaffSelected] = useState({
    label: 'Ngẫu nhiên',
    value: 'NV000',
  })
  const [errorMessage, setErrorMessage] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    product: '',
    staff: '',
    staff_name: '',
    user: '',
    time: '',
    dateTime: '',
  })
  const _initForm = {
    name: '',
    phone: '',
    email: '',
    address: '',
    product: '',
    staff: '',
    staff_name: '',
    user: '',
    time: '',
    dateTime: date,
  }
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ _initForm }); 

  useEffect(() => {
    if(userInfo) {
      axios.get(`api/my-mo-to/user/${userInfo._id}`)
      .then(res => {
        setLoadingPage(true)
        if (res.data.success) {
          const data = res.data.data
          const motoOptions = data.map((val) => ({
            label: val.orderMoTo.name,
            img: val.orderMoTo.image,
            value: val._id
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
  }, [userInfo])

  useEffect(() => {
    axios.get("api/staff/list")
    .then(res => {
      setLoadingPage(true)
      if (res.data.success) {
        const data = res.data.data
        const motoOptions = data.map((val) => ({
          label: val.name,
          img: val.image,
          value: val._id
        }))
        setListStaff(motoOptions)
        setLoadingPage(false)
      }
    }).catch ((e) => {
      toast.error('Không thể kết nối máy chủ')
    })
  }, [])
  function FormError(props) {
    if (props.isHidden) { return null; }
    return (<div className="form-error text-red-600">{props.errorMessage}</div>)
  }
  const handleSubmitFormMaintence = (e) => {
    e.preventDefault();
    setLoadingPage(true)
    let count = 0
    if(!userInfo) {
      toast.warn("Quý khách vui lòng đăng nhập để đăng ký!")
      setLoadingPage(false)
    } else {
      if (motoSelected.value === 0) {
        toast.warn('Vui lòng chọn xe!!!')
        setLoadingPage(false)
      } else {
        const form = {
          name: formData?.name || userInfo?.name,
          phone: formData?.phone || userInfo?.phone,
          email: formData?.email || userInfo?.email,
          address: formData?.address || userInfo?.address,
          product: motoSelected ? motoSelected.value : null,
          staff: staffSelected ? staffSelected.value : null,
          staff_name: staffSelected ? staffSelected.label : null,
          user: userInfo?._id,
          timeServiceId: timeServiceId.id,
          time: timeServiceId.time,
          dateTime: date,
        }

        Object.entries(form).map(([key, val]) => {
          if (val && !errorMessage[key]) {
            setErrorMessage(prev => ({ ...prev, [key]: ''}))
            count += 1
          } else {
            setErrorMessage(prev => ({ ...prev, [key]: 'không được để trống'}))
          }
          return count
        })

        if (count === 11) {
          axios.post("api/maintenance-service/create", form)
          .then(res => {
            if (res.data.success) {
              toast.success(res.data.data)
            }
            setLoadingPage(false)
            toast.error(res.data.message)
            return navigate('/shop-moto/maintenance-history')
          }).catch((e) => {
            toast.error(e.message)
          })
        } else {
          toast.error('Something error!!!')
          setLoadingPage(false)
        }
      } 
    }
  }

  function fetchData() {
    axios.get('/api/time-service/')
    .then(res=> {
      if(res.data.success) {
        setTimeService(res.data.data)
      }
    }).catch((e) => {
      toast.error('Không thể kết nối máy chủ')
    })  
  }
  useEffect(()=> {
    fetchData()
  }, [])
  const handleChangeDate = (date) => {
    setLoadingTime(true);
    setDate(date);
    setTimeout(()=> {
      setLoadingTime(false)
      clearTimeout();
    }, 500)
  }
  const handleStaffChange = (staff) => {
    setLoadingTime(true);
    setStaffSelected(staff);
    setTimeout(()=> {
      setLoadingTime(false)
      clearTimeout();
    }, 500)
  }

  function handleCheckOverService (item) {
    const timeStap = item.time.split('h')
    if (moment(toDay).format('YYYY-MM-DD') === moment(date).format('YYYY-MM-DD')) {
      if (Number(timeStap[0]) < toDay.getHours()) {
        return 3
      } else if (toDay.getHours() === Number(timeStap[0])) {
        if (toDay.getMinutes() > Number(timeStap[1])) {
          return 3
        } else {
          return 0
        }
      } else {
        if (item.staff.length === 0) {
          return 0
        }
        if (item.staff.length > 0) {
          const countStaff = item.staff.filter(prev => (prev.time === moment(date).format('YYYY-MM-DD')))
          if (countStaff.length === timeService.totalStaff) {
            return 3
          } else if (countStaff.findIndex(prev => prev.staff === staffSelected.value) === -1) {
            return 0
          } else {
            return 3
          }
        }
      }
    } else {      
      if (item.staff.length === 0) {
        return 0
      }
      if (item.staff.length > 0) {
        const countStaff = item.staff.filter(prev => (prev.time === moment(date).format('YYYY-MM-DD')))
        if (countStaff.length === timeService.totalStaff) {
          return 3
        } else if (countStaff.findIndex(prev => prev.staff === staffSelected.value) === -1) {
          return 0
        } else {
          return 3
        }
      }
    }
  }
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
  
  return (
    <div className="my-moto">
      {loadingPage && <Loading /> }
      <div className="container">
        <div className="my-moto-title">
            <h1>Đặt lịch bảo dưỡng</h1>
        </div>
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
              <div className="mt-5 md:col-span-2 md:mt-0">
                  <div className="overflow-hidden shadow sm:rounded-md">
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
                          <FormError isHidden={errorMessage.name === ''} errorMessage={errorMessage.name} />
                        </div>

                        <div className="col-span-6 sm:col-span-3">
                          <InputField
                            label="Số điện thoại"
                            name="phone"
                            type="number"
                            // required
                            defaultValue={userInfo?.phone}
                            onChange={(e) => checkPhone(e.target.value)}
                          />
                          <FormError isHidden={errorMessage.phone === ''} errorMessage={errorMessage.phone} />
                        </div>
                        <div className="col-span-6 sm:col-span-4">
                          <InputField
                            label="Email"
                            name="email"
                            type="text"
                            // required
                            defaultValue={userInfo?.email}
                            onChange={(e) => checkEmail(e.target.value)}
                            />
                          <FormError isHidden={errorMessage.email === ''} errorMessage={errorMessage.email} />
                        </div>
                        <div className="col-span-6 sm:col-span-4">
                        <InputField
                            label="Địa chỉ"
                            name="address"
                            type="text"
                            // required
                            defaultValue={userInfo?.address}
                            onChange={(e) => setFormData(prev => ({...prev, address: e.target.value }))}
                            />
                          <FormError isHidden={errorMessage.address === ''} errorMessage={errorMessage.address} />
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
                    <h3 className="content__title">Lựa chọn xe bảo dưỡng</h3>
                    <p className="mt-1 text-sm text-gray-600"></p>
                  </div>
                </div>
                <div className="mt-5 md:col-span-2 md:mt-0">
                  <SelectField
                    label="Xe của bạn"
                    options={listMoTo}
                    selected={motoSelected}
                    onChange={setMoToSelected}
                  />
                </div>
              </div>
            </div>
            <div className="mt-10 mb-32 sm:mt-0">
              <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                  <div className="px-4 sm:px-0">
                    <h3 className="content__title">Nhân viên bảo dưỡng</h3>
                    <p className="mt-1 text-sm text-gray-600">Bạn có thể chọn nhân viên mà bạn muốn họ bảo dưỡng cho xe của bạn.</p>
                  </div>
                </div>
                <div className="mt-5 md:col-span-2 md:mt-0">
                  <SelectField
                    label="Nhân viên"
                    options={listStaff}
                    selected={staffSelected}
                    onChange={handleStaffChange}
                  />
                </div>
              </div>
            </div>
            <div className="my-10 sm:mt-0">
              <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                  <div className="px-4 sm:px-0">
                    <h3 className="content__title">Thời gian đến bảo dưỡng <span className="text-red-500">*</span></h3>
                    <p className="mt-2">
                      Thời gian quý khách có thể đặt lịch là từ: <b className="mt-1 text-red-500">8h00 - 18h00</b>.
                      Quý khách vui lòng chọn trong khoảng thời gian này.
                    </p>
                    <p>Cảm ơn quý khách</p>
                  </div>
                </div>
                <div className="mt-5 md:col-span-2 md:mt-0">
                  <div className="w-[300px]">
                    <InputField
                        label="Ngày"
                        name="date"
                        type="date"
                        min={moment(toDay).format('YYYY-MM-DD')}
                        required
                        defaultValue={moment(toDay).format('YYYY-MM-DD')}
                        onChange={(e) => handleChangeDate(e.target.value)}
                    />
                  </div>
                  <div className="p-4">
                    { loadingTime ?
                    <div className="rounded-md py-4 max-w-sm w-full">
                        <div className="animate-pulse space-x-2 flex justify-start">
                            <div className="rounded-full bg-red-500 h-6 w-6"></div>
                            <div className="rounded-full bg-green-500 h-6 w-6"></div>
                            <div className="rounded-full bg-yellow-500 h-6 w-6"></div>
                        </div>
                    </div> : 
                    <div className="flex flex-wrap">
                      { timeService.timeService && timeService.timeService.map((item, index) => 
                        {
                          if (handleCheckOverService(item) === 3) {
                            return (
                              <span key={index} className="btn-time bg-gray-300 opacity-70">
                                {item.time}
                              </span>
                            )
                          } else {
                            return <span key={index}
                              className={`btn-time ${timeServiceId.id === item._id ? 'bg-sky-500 text-white' : ''}`}
                              onClick={()=> setTimeServiceId({ id: item._id, time: item.time })}
                              >
                              {item.time}
                            </span>
                          }
                        }
                      )}
                    </div>
                    }
                  </div>
                </div>
              </div>
            </div>
            <div className="py-5 mb-32">
            <div className="flex justify-end">
              <button type="submit" className="btn btn-deposit">
                Đăng ký bảo dưỡng
              </button>
            </div>
          </div>
        </form>
        </div>
      </div>
  );
}
