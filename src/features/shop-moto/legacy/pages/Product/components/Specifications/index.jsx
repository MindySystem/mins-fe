import React from 'react';
import './specifications.scss';
import { ImMinus, ImPlus } from 'react-icons/im'
import { useState } from 'react';

export default function Specifications({ specifications }) {
    const [engine, setEngine] =useState(1);

    return (
        <>
            <h1 className="specifications__title">THÔNG SỐ KỸ THUẬT</h1>
            <div className="specifications">
                <div className="specifications__left">
                    <div className="specifications__left-engine">
                        <div className="specifications__left-item">
                            <h3 className="item__point">
                                <span>{specifications.dungtich}</span>
                                <sup>CC</sup>
                            </h3>
                            <div className="line"></div>
                            <div className="name">Động cơ</div>
                        </div>
                        <div className="specifications__left-item">
                            <h3 className="item__point">
                                <span>{specifications.maluc}</span>
                                <sup>mã lực</sup>
                            </h3>
                            <div className="line"></div>
                            <div className="name">Công suất cực đại</div>
                        </div>
                        <div className="specifications__left-item">
                            <h3 className="item__point">
                                <span>{specifications.momenxoan}</span>
                                <sup>Nm</sup>
                            </h3>
                            <div className="line"></div>
                            <div className="name">Mô men xoắn cực đại</div>
                        </div>
                        <div className="specifications__left-item">
                            <h3 className="item__point">
                                <span>{specifications.trongluong}</span>
                                <sup>kg</sup>
                            </h3>
                            <div className="line"></div>
                            <div className="name">Trọng lượng</div>
                        </div>
                    </div>
                </div>
                <div className="specifications__right">
                    <div className="specifications__right-item">
                        <h3 className="btn item__title" style={{ color: `${engine === 1 ? '#ff0000' : '#000000'}` }} onClick={()=>setEngine(engine === 1 ? 0 : 1)}>
                            Động cơ
                            <span>
                                { engine === 1 ? <ImMinus /> : <ImPlus style={{color: "#000000"}} />}
                            </span>
                        </h3>
                        {
                            engine === 1 && 
                            <div className="accordion-content">
                                <ul>
                                {specifications && specifications.specifications?.dong_co.map((item, index)=> (
                                    <li key={index}>
                                        <b>{item.name}</b>
                                        <span>{item.value}</span>
                                    </li>
                                ))}
                                </ul>
                            </div>
                        }
                    </div>
                    <div className="specifications__right-item">
                        <h3 className="btn item__title" style={{ color: `${engine === 2 ? '#ff0000' : '#000000'}` }} onClick={()=>setEngine(engine === 2 ? 0 : 2)}>
                            Kết cấu
                            <span>
                                { engine === 2 ? <ImMinus /> : <ImPlus style={{color: "#000000"}} />}
                            </span>
                        </h3>
                        {
                            engine === 2 && 
                            <div className="accordion-content">
                                <ul>
                                {specifications && specifications.specifications?.ket_cau.map((item, index)=> (
                                    <li key={index}>
                                        <b>{item.name}</b>
                                        <span>{item.value}</span>
                                    </li>
                                ))}
                                </ul>
                            </div>
                        }
                    </div>
                    <div className="specifications__right-item">
                        <h3 className="btn item__title" style={{ color: `${engine === 3 ? '#ff0000' : '#000000'}` }} onClick={()=>setEngine(engine === 3 ? 0 : 3)}>
                            Kích thước
                            <span>
                                { engine === 3 ? <ImMinus /> : <ImPlus style={{color: "#000000"}} />}
                            </span>
                        </h3>
                        {
                            engine === 3 && 
                            <div className="accordion-content">
                                <ul>
                                {specifications && specifications.specifications?.kich_thuoc.map((item, index)=> (
                                    <li key={index}>
                                        <b>{item.name}</b>
                                        <span>{item.value}</span>
                                    </li>
                                ))} 
                                </ul>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </>
    )
}
