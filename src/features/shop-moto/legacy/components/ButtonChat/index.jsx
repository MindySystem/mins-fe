import React from 'react';
import "./buttonchat.scss";
import Messager from "../../assets/images/messager.png"

function ButtonChat({ setStyle }) {
  return (
    <div className="buttonchat btn" onClick={() => setStyle({ display: 'block' })} >
      <img src={Messager} alt="messager" />
    </div>
  );
}

export default ButtonChat;