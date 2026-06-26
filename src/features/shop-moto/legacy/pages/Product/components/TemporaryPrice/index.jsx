import React from 'react';
import { useEffect, useState } from 'react'
import './temporary-price.scss'
import axios from 'axios'
import SelectField from 'custom-field/SelectField';
import numberWithCommas from 'utils/numberWithCommas';

export default function TemporaryPrice(props) {
  const { productDetail } = props
  const [priceLicense, setPriceLicense] = useState(0)
  const [priceInsurance, setPriceInsurance] = useState(0)
  const [cityOptions, setCityOptions] = useState()
  const [citySelected, setCitySelected] = useState({
    label: 'Thành Phố',
    value: 0,
  })
  const [insuranceSelected, setInsuranceSelected] = useState({
    label: 'Bảo hiểm',
    value: 0,
  })

  const insurance = [
    {
      label: 'Bảo hiểm trách nhiệm dân sự 66,000 đồng/1 năm',
      value: 66000
    },
    {
      label: 'Bảo hiểm trách nhiệm dân sự + Bảo hiểm tai nạn cho 2 người ngồi trên xe (mức 10 triệu /người) 86,000 đồng/1 năm',
      value: 86000
    },
    {
      label: 'Bảo hiểm trách nhiệm dân sự + Bảo hiểm tai nạn cho 2 người ngồi trên xe (mức 20 triệu /người) 106,000 đồng/1 năm',
      value: 106000
    },
  ]

  useEffect(() => {
    if (citySelected.value === 201 || citySelected.value === 202) {
      setPriceLicense(4000000)
    }
    else {
      setPriceLicense(800000)
    }
  }, [citySelected])

  useEffect(() => {
    setPriceInsurance(insuranceSelected.value)
  }, [insuranceSelected])

  // Fetch city on Province page
  useEffect(() => {
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
          setCityOptions(cityOptions);
        }
      })
    };
    fetchCity();
  }, []);

  return (
    <div className="temporary-price">
      <div className='register-insurance'>
        <div className='register-insurance-item'>
          <SelectField
            label="KHU VỰC" //lable name
            options={cityOptions}
            selected={citySelected}
            defaultOption={"--Chọn Thành Phố--"}
            onChange={setCitySelected}
          />
        </div>
        <div className="register-insurance-item">
          <SelectField
            label="BẢO HIỂM TRÁCH NHIỆM DÂN SỰ" //lable name
            options={insurance}
            selected={insuranceSelected}
            onChange={setInsuranceSelected}
            defaultOption={"--Chọn Loại Bảo Hiểm--"}
          />
        </div>
      </div>
      <div className='price-item'>
        <span className='name'>Giá niêm yết:</span>
        <span className='price'>{numberWithCommas(productDetail.price)}₫</span>
      </div>
      <div className='price-item'>
        <span className='name'>Phí trước bạ <b>(5%)</b>:</span>
        <span className='price'>{numberWithCommas(productDetail ? (5 * productDetail.price / 100) : 0)}₫</span>
      </div>
      <div className='price-item'>
        <span className='name'>Phí biển số xe <b>({citySelected.label})</b>:</span>
        <span className='price'>{priceLicense ? numberWithCommas(priceLicense) + '₫': ''}</span>
      </div>
      <div className='price-item'>
        <span className='name'>Phí bảo hiểm nhân sự:</span>
        <span className='price'>{priceInsurance ? numberWithCommas(priceInsurance) + '₫' : ''}</span>
      </div>
      <div className='price-total'>
        <span className='name'>Tổng Cộng: </span>
        <span className='price'>
          {numberWithCommas(productDetail.price + (5 * productDetail.price / 100) + priceInsurance + priceLicense)}₫
        </span>
      </div>
    </div>
  )
}
