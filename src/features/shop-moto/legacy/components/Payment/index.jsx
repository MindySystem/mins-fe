import vnPay from 'assets/images/vn-pay.png';
import axios from 'axios';
import SelectField from 'custom-field/SelectField';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { addFormCheckOut } from 'stateslice/CheckOutData';
import numberWithCommas from 'utils/numberWithCommas';

export default function Payment(props) {
  const {back, formData, type} = props;
  const dispatch = useDispatch()
  
  const [bankCode, setBankCode] = useState({
    label: "--Không chọn--",
    value: null,
  })
  const bankList = [
    { value: 'NCB', label: ' Ngan hang NCB'},
    { value: 'NCB', label: ' Ngan hang Agribank'},
    { value: 'NCB', label: ' Ngan hang SCB'},
    { value: 'SACOMBANK', label: 'Ngan hang SacomBank'},
    { value: 'NCB', label: ' Ngan hang EximBank'},
    { value: 'NCB', label: ' Ngan hang MSBANK'},
    { value: 'NCB', label: ' Ngan hang NamABank'},
    { value: 'NCB', label: ' Vi dien tu VnMart'},
    { value: 'NCB', label: 'Ngan hang Vietinbank'},
    { value: 'NCB', label: ' Ngan hang VCB'},
    { value: 'NCB', label: 'Ngan hang HDBank'},
    { value: 'NCB', label: ' Ngan hang Dong A'},
    { value: 'NCB', label: ' Ngân hàng TPBank'},
    { value: 'NCB', label: ' Ngân hàng OceanBank'},
    { value: 'NCB', label: ' Ngân hàng BIDV'},
    { value: 'NCB', label: ' Ngân hàng Techcombank'},
    { value: 'NCB', label: ' Ngan hang VPBank'},
    { value: 'NCB', label: ' Ngan hang MBBank'},
    { value: 'NCB', label: ' Ngan hang ACB'},
    { value: 'NCB', label: ' Ngan hang OCB'}, 
    { value: 'NCB', label: ' Ngan hang IVB'},
    { value: 'NCB', label: ' Thanh toan qua VISA/MASTER'},
  ]
  const paymentMethods = [
    { id: 'vn-pay', title: 'VNPay', img: vnPay }
  ]
  
  const handleSubmitOrder = () => {
    if(!bankCode.value) {
      toast.warn('Vui lòng chọn ngân hàng thanh toán.')
    } else {
      axios.post('/api/payment/create_payment_url', {
        total: Number(formData.totalPrice),
        bankCode: bankCode.value || 'NCB',
        orderDescription: 'Thanh toan hoa don tai MoTo Store.',
        type
      })
      .then(res=> {
        if (res.data.success) {
          dispatch(addFormCheckOut({ formData }))
          window.location = res.data.data
        } else {
          toast.danger('Có gì đó không ổn.')
        }
      }).catch(err=> {console.log(err)});
    }
  }

  return (
    <div className="payment-warp">
      <div className="payment__types">
        <h2 className="payment__types-title">Hình thức thanh toán</h2>
        <div className="payment__types-list-radio">
          {paymentMethods.map((paymentMethod, paymentMethodIdx) => (
            <div key={paymentMethod.id} className="w-16 h-16 inline-block">
              {paymentMethodIdx === 0 ? (
                <input
                  id={paymentMethod.id}
                  name="payment-type"
                  type="radio"
                  hidden
                  defaultChecked
                />
              ) : (
                <input
                  id={paymentMethod.id}
                  name="payment-type"
                  hidden
                  type="radio"
                />
              )}
              <label htmlFor={paymentMethod.id} className="ml-3 block text-sm font-medium text-gray-700">
              <img src={paymentMethod.img} alt="payment-type" className='rounded'/>
                {paymentMethod.title}
              </label>
            </div>
          ))}
        </div>
      </div>
      <div className="bank-select-options">
        <SelectField
          label="Ngân hàng thanh toán"
          className="w-full"
          options={bankList}
          selected={bankCode}
          onChange={setBankCode}
        />
        <div className="bank_description">
          <h2>Nội dung thanh toán</h2>
          <p>Thanh toan hoa don mua hang tai cua hang MoTo Store.</p>
        </div>
      </div>
      <fieldset>
        <legend>Thông tin cá nhân</legend>
        <div className="payment-content">
          <div className="col-12">
            <b>Họ và tên : </b>
            <span>{formData.name}</span>
          </div>
          <div className="col-12">
            <b>Số điện thoại : </b>
            <span>{formData.phone}</span>
          </div>
          <div className="col-12">
            <b>Địa chỉ Email: </b>
            <span>{formData.email}</span>
          </div>
          <div className="col-span-2">
            <b>Địa chỉ nhận Hàng: </b>
            <span>{formData.address + ', ' + formData.ward + ', ' + formData.district + ', ' + formData.city}</span>
          </div>
        </div>
      </fieldset>
      <div className="total-payment">
        <b>Tổng giá trị đơn hàng cần thanh toán: </b>
        <span>{numberWithCommas(formData.totalPrice ? formData.totalPrice : 0 )}đ</span>
      </div>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          className="btn-payment"
          onClick={handleSubmitOrder}
        >
          Xác nhận
        </button>
        <button
          type="button"
          className="btn-come-back"
          onClick={() => back()}
        >
          Quay lại
        </button>
      </div>
    </div>
  )
}
