import './index.css'
import 'react-toastify/dist/ReactToastify.css';
import './styles/sass/index.scss';
import "./styles/custom-field.scss";
import "./styles/global.css";
import "./styles/home.scss";
import "./styles/index.scss";
import "./styles/product.scss";

import { useState } from 'react';
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import ButtonChat from './components/ButtonChat';
import Footer from './components/Footer';
import Header from './components/Header';
import PopupChatBot from './components/PopupChatBot/PopupChatBot';

import Accessory from "pages/Accessary";
import Cart from "pages/Cart";
import MyMoto from "pages/MyMoto";
import MyOrder from "pages/MyOrder";
import NotFound from 'pages/NotFound';
import Profile from "pages/Profile";
import Home from './pages';
import CatalogAccessory from "./pages/CatalogAccessory";
import CatalogMoto from "./pages/CatalogMoto";
import Product from "./pages/Product";
import Maintenance from 'pages/Maintenance';
import MaintenanceHistory from 'pages/MaintenanceHistory';
import VehicleRegistration from 'pages/VehicleRegistration';
import Rescue from 'pages/Rescue';
import VehicleRegistrationHistory from 'pages/VehicleRegistrationHistory';

function App() {
  const [style, setStyle] = useState({ display: "none" })
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/shop-moto" element={<Home />} />
        <Route path="/shop-moto/product/:id" element={<Product />} />
        <Route path="/shop-moto/accessory/:id" element={<Accessory />} />
        <Route path="/shop-moto/profile" element={<Profile />} />
        <Route path="/shop-moto/maintenance" element={<Maintenance />} />
        <Route path="/shop-moto/rescue" element={<Rescue />} />
        <Route path="/shop-moto/vehicle-registration" element={<VehicleRegistration />} />
        <Route path="/shop-moto/vehicle-registration-history" element={<VehicleRegistrationHistory />} />
        <Route path="/shop-moto/maintenance-history" element={<MaintenanceHistory />} />
        <Route path="/shop-moto/cart" element={<Cart />} />
        <Route path="/shop-moto/my-order" element={<MyOrder />} />
        <Route path="/shop-moto/my-moto" element={<MyMoto />} />
        <Route path="/shop-moto/catalog-moto" element={<CatalogMoto />} />
        <Route path="/shop-moto/catalog-accessory" element={<CatalogAccessory />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ButtonChat setStyle={setStyle} />
      <div className="" style={style}>
        <PopupChatBot setStyle={setStyle} />
      </div>
      <Footer />
      <ToastContainer style={{ fontSize: 15 }} />
    </div>
  );
}

export default App;
