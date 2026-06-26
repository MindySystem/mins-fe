import React from 'react';
import "./footer.scss";
import { Link } from "react-router-dom";
import logo from "../../assets/logo/logo_moto.jpg";
// import visa from "../../assets/images/Visa_Inc_logo.png";
// import napas from "../../assets/images/napas-logo.png";
// import MasterCard from "../../assets/images/MasterCard_logo.png";
import vnPay from 'assets/images/vn-pay.png';


function Footer() {
  return (
    <div className="footer">
      <div className="container">
        <div className="footer_wrap">
          <div className="footer_item">
            <span>Revzone Yamaha Motor được tổ chức và vận hành chính thức bởi</span>
            <div className="logo">
              <Link to="/shop-moto/">
                <img src={logo} alt="logo" />
              </Link>
            </div>
            <span>
              CÔNG TY TNHH MOTOR VIỆT NAM <br />
              Số GCNĐKDN: 0668889999<br />
              Cấp lần đầu: Ngày 01/07/2022<br />
              Đăng ký thay đổi lần thứ 10: Ngày 27/03/2020<br />
              Cơ quan cấp: Sở kế hoạch và đầu tư TP Cần Thơ<br />
              Trụ sở chính: An Khánh, Ninh Kiều, TP. Cần Thơ
            </span>
            <h3>© 2022 Motor Viet Nam</h3>
          </div>
          <div className="footer_item">
            <div className="footer_title">
              VỀ CHÚNG TÔI
            </div>
            <p>Motor Việt Nam</p>
            <p>Liên hệ</p>

          </div>
          <div className="footer_item">
            <div className="footer_title">
              CHÍNH SÁCH VÀ ĐIỀU KHOẢN
            </div>
            <p>Chính sách bảo mật</p>
            <p>Chính sách bảo hành</p>
            <p>Chính sách giao hàng</p>
            <p>Chính sách đổi trả</p>
            <b>KẾT NỐI VỚI CHÚNG TÔI</b>

          </div>
          <div className="footer_item">
            <div className="footer_title">
              KÊNH THANH TOÁN
            </div>
            <div className="footer_pay">
              <img src={vnPay} alt="vnpay" />
              {/* <img src={napas} alt="napas" />
              <img src={MasterCard} alt="master card" /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;