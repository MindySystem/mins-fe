import React from 'react';
import { useEffect, useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { BsSortDown, BsSortUp } from 'react-icons/bs';
import { MdOutlineDeleteSweep } from 'react-icons/md';
import './CatalogAccessory.scss';
import Sale from 'assets/images/sale.png'
 
import ImgNotFound from 'assets/images/product_notfound.png';
import dataCatalog from "assets/data/catalogAccessory.json";
import axios from 'axios';
import Loading from 'components/Loading';
import { Link } from "react-router-dom";
import numberWithCommas from 'utils/numberWithCommas';
import SelectField from 'custom-field/SelectField';
import checkPromotion from 'utils/CheckPromotion';

export default function CatalogAccessory() {
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    useEffect(() => {
        scrollToTop();
    }, []);
    const [listAccessory, setlistAccessory] = useState([])
    const [listFilter, setListFilter] = useState([])
    const [filterPrice, setFilterPrice] = useState('')
    const [loadingPage, setLoadingPage] = useState(false);
    const [productCate, setProductCate] = useState([]);
    const [loading, setLoading] = useState(false);
    const [priceSelect, setPriceSelect] = useState({
        value: 0,
        label: "-- Giá phụ tùng --",
        min: 0,
        max: 1000000000
      })
    // actions for comments    
    useEffect(() => {
        getDataApi();
    }, [])
    
    const [brandOption, setBrandOption] = useState([])
    useEffect(() => {
        axios.get('/api/brand/accessory')
        .then(res => {
            if (res.data.success) {
                const data = res.data.data
                const options = data.map((item) => ({
                    filter: 'brand',
                    key: item.name,
                    name: item.name
                }))
                setBrandOption(options)
            }
        }).catch()
    }, [])
    const [typeOption, setTypeOption] = useState([])
    
    useEffect(() => {
        axios.get('/api/accessory-type')
        .then(res => {
            if (res.data.success) {
                const data = res.data.data
                const options = data.map((item) => ({
                    filter: 'type',
                    key: item.name,
                    name: item.name
                }))
                setTypeOption(options)
            }
        }).catch()
    }, [])

    const getDataApi = async () => {
        setLoadingPage(true);
        await axios.get('/api/accessory')
            .then(res => {
                if (res.data.success) {
                    setlistAccessory(res.data.data)
                    setProductCate(res.data.data)
                    setLoadingPage(false);
                }
            })
    }
    const addFilterOption = (item) => {
        const index = listFilter.findIndex(prev => prev.name === item.name)
        if (index < 0) {
            setListFilter((prev) => [...prev, item])
        } else {
            removeFilterOption(item)
        }
    }
    const removeFilterOption = (item) => {
        const index = listFilter.findIndex(prev => prev.key === item.key);
        if (index < 0) return;
        else {
            const item = listFilter.splice(index, 1)
            const newList = listFilter.filter(prev => prev.key !== item.key)
            setListFilter(newList);
        }
    }
    const filterOptions = (opt) => {
        if (filterPrice === opt) {
            setFilterPrice('')
        } else {
            setFilterPrice(opt)
            if (opt === 'up') {
                const newProductSort = [].concat(productCate).sort((a, b) => a.price > b.price ? 1 : -1)
                setProductCate(newProductSort)
            }
            if (opt === 'down') {
                const newProductSort = [].concat(productCate).sort((a, b) => a.price < b.price ? 1 : -1)
                setProductCate(newProductSort)
            }
        }
    }
    useEffect(() => {
        let temp = listAccessory || []
        setLoading(true)
        setTimeout(() => {
            if (filterPrice) {
                setLoading(false)
            } else {
                const checkb = listFilter.findIndex(i => i.filter === 'brand') !== -1
                const checkt = listFilter.findIndex(i => i.filter === 'type') !== -1
                if (priceSelect.value > 0) {
                    temp = temp.filter(e => (priceSelect.min <= e.price && e.price <= priceSelect.max))
                }
                if (checkb) {
                    temp = temp.filter(e => listFilter.findIndex((f) => f.key === e.brand) !== -1)
                }
                if (checkt) {
                    temp = temp.filter(e => listFilter.findIndex((f) => f.key === e.type) !== -1)
                }
                setProductCate(temp);
            }
            setLoading(false)
            clearTimeout()
        }, 300)
    }, [listFilter, listAccessory, filterPrice, priceSelect])

    function checkActive(value) {
        const index = listFilter.findIndex(prev => prev.key === value);
        if (index < 0) {
            return false;
        } else return true
    }

    return (
        <>
            {loading && <Loading />}
            {loadingPage ?
                <div className="product-loading">
                    <Loading />
                </div> :
                <div className="container">
                    <div className="catalog__moto">
                        <div className="box-filter">
                            <div className="title">
                                <h3>BỘ LỌC</h3>
                                <div className="listFilter">
                                    {listFilter.map((item, index) => (
                                        <div className="filter-item flex items-center" key={item.name} onClick={() => removeFilterOption(item)}>
                                            {item.name}
                                            <AiOutlineClose className="icon p-0" />
                                        </div>
                                    ))}
                                </div>
                                {listFilter.length > 0 &&
                                    <span className="clear-filter" onClick={() => setListFilter([])}>
                                        <MdOutlineDeleteSweep className='icon' />Xóa
                                    </span>
                                }
                            </div>
                            <div className="options-filters">
                                <div className="option-item">
                                    <div className="item-name">{dataCatalog.brand.title}</div>
                                    <div className="item-options">
                                        {brandOption && brandOption.map((item) => (
                                            <div
                                                key={item.key}
                                                className={`item ${checkActive(item.key) ? 'active' : ''}`}
                                                onClick={() => addFilterOption(item)}>{item.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="option-item">
                                    <div className="item-name">{dataCatalog.type.title}</div>
                                    <div className="item-options">
                                        {typeOption && typeOption.map((item) => (
                                            <div
                                                key={item.key}
                                                className={`item ${checkActive(item.key) ? 'active' : ''}`}
                                                onClick={() => addFilterOption(item)}>{item.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="option-item-sort">
                                    <div className="item-name">Sắp xếp theo</div>
                                    <div className="item-sort">
                                        <div className="item">
                                            <SelectField
                                                className="w-48"    
                                                options={dataCatalog.priceSort}
                                                selected={priceSelect}
                                                onChange={setPriceSelect}
                                            />
                                        </div>
                                        <div className="item-options">
                                            <div className={`item ${filterPrice === 'up' ? 'active' : ''}`} onClick={() => filterOptions('up')}> Giá tăng dần <BsSortUp /> </div>
                                            <div className={`item ${filterPrice === 'down' ? 'active' : ''}`} onClick={() => filterOptions('down')}>Giá giảm dần <BsSortDown /></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="list-items">
                            <div className="list__product_wrap_catalog">
                                <div className="list__product_wrap_catalog_list">
                                    {productCate.length > 0 ? productCate.map((item) => (
                                        <Link to={`/shop-moto/accessory/${item._id || item.id}`} key={item._id || item.id} className="list__product_wrap_catalog_list_item">
                                            <img src={item.img ? item.img : ""} className="" alt="" />
                                            <div className="item_info">
                                                <div className="item_info_name item_info-accessory">
                                                    {item.name}
                                                </div>
                                                <div className="item_info_price">
                                                    Giá: {numberWithCommas(item.price)}đ
                                                </div>
                                            </div>
                                            {
                                                checkPromotion(item) &&
                                                <p style={{ backgroundImage: `url(${Sale})` }}
                                                    className="w-16 h-10 bg-contain bg-no-repeat flex items-center justify-center absolute top-0 left-0">
                                                </p>
                                            }
                                        </Link>
                                    )) : <div className='product-catalog-notfound'>
                                    <img src={ImgNotFound} alt="" />
                                </div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}
