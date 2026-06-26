import React from 'react';
import Pagination from "components/Pagination";
import { useRef } from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import numberWithCommas from "utils/numberWithCommas";
import "./listproduct.scss";
import Sale from 'assets/images/sale.png'
import checkPromotion from 'utils/CheckPromotion';

function ListProduct(props) {
    const myRef = useRef(null)

    const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage] = useState(12);
    const paginate = pageNumber => setCurrentPage(pageNumber);
    const products = Array.isArray(props.products) ? props.products : [];

    // get current post
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = products.slice(indexOfFirstPost, indexOfLastPost);

    useEffect(() => {
        myRef.current.scrollIntoView()
    }, [currentPage])

    return (
        <div className="container">
            <div className="list__product_wrap">
                <div ref={myRef} className="list__product_wrap_title">
                    <p> DANH SÁCH SẢN PHẨM</p>
                    <Link to="/shop-moto/catalog-moto" className="see_all">Xem tất cả</Link>
                </div>

                <div className="list__product_wrap_list">
                    {currentPosts.map((item, index) => (
                        <Link to={`/shop-moto/product/${item._id || item.id}`} key={index} className="list__product_wrap_list_item relative">
                            <img src={item.img ? item.color[0].url : ''} className="" alt="" />
                            <div className="item_info">
                                <div className="item_info_name">
                                    {item.name}
                                </div>
                                <div className="item_info_price">
                                    Giá: {numberWithCommas(item.price)} đ
                                </div>
                            </div>
                            { checkPromotion(item) &&
                                <p style={{ backgroundImage: `url(${Sale})` }}
                                    className="w-16 h-10 bg-contain bg-no-repeat flex items-center justify-center absolute top-0 left-0">
                                </p>
                            }
                        </Link>
                    ))}
                </div>
                <Pagination products={products} paginate={paginate} postsPerPage={postsPerPage} currentPage={currentPage} />
            </div>
        </div>
    );
}

export default ListProduct;
