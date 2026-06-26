import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './notfound.scss';

export default function NotFound () {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  useEffect(() => {
    scrollToTop();
  }, []);
  return (
    <main>
      <div className="main-container">
        <p className="title-error">404 error</p>
        <h1 className="content">
          Ôi không! Tôi nghĩ bạn đã đi lạc.
        </h1>
        <p className="sub-content">
          Có vẻ trang bạn tìm kiếm không tồn tại!.
        </p>
        <div className="mt-6">
          <Link to="/shop-moto/" className="btn-back-home">
            Quay về trang chủ
          </Link>
        </div>
      </div>
    </main>
  )
}
