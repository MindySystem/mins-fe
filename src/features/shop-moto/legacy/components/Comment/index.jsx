import React, { useEffect } from 'react';
import moment from "moment/moment";
import { useState } from "react";
import { toast } from "react-toastify";
import avatar from '../../assets/logo/logo_moto.jpg';
import axios from 'axios';
import { useSelector } from 'react-redux';

const Comment = ({ id }) => {
    const { userInfo } = useSelector(state => state)
    const [commentValue, setCommentValue] = useState('')
    const [listComment, setListComment] = useState('')

    useEffect(() => {
        axios.get(`/api/product-comment/${id}`)
        .then(res => {
            if(res.data.success) {
                setListComment(res.data.data);
            }
        }).catch((e)=> {
            console.log(e.message)
        })
    }, [id])

    let debounceTimeout;
    const handleSentNewComment = (value) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            const dataComment = {
                productId: id,
                user: userInfo._id,
                noi_dung: value
            }
            if (value) {
                axios.post('/api/product-comment', dataComment)
                .then(res => {
                    if(res.data.success) {
                        setCommentValue('');
                        setListComment(prev => [dataComment, ...prev])
                        toast.success('Bình luận thành công')
                    }
                })
            } else {
                toast.warn('Bình luận rỗng!')
            }
        }, 500)
    }

    return (
        <div className="comment p-8">
            <h1 className="text-2xl pb-4">
                Bình luận
                <span className="text-sm text-white bg-sky-400 p-1 ml-2 rounded top-0" >{listComment.length}</span>
            </h1>
            <div className="comment__body">
                <div className="relative">
                    <input
                        className="border focus:ring-indigo-300 focus:border-indigo-300 block w-full pl-7 py-2 pr-12 border-gray-300 rounded-md"
                        type="text"
                        required
                        onChange={(e) => setCommentValue(e.target.value)}
                        value={commentValue}
                        placeholder="Nhập nội dung bình luận của bạn"
                    />
                    <div
                        className="absolute top-1.5 right-4 bg-sky-400 text-white p-1 cursor-pointer rounded"
                        onClick={() => handleSentNewComment(commentValue)}
                    >
                        Gửi bình luận
                    </div>
                </div>
                <div className="py-12">
                    {listComment && listComment !== [] && listComment.map((item, index) => (
                        <div key={index}>
                            <CommentSent user={userInfo} item={item} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
export default Comment;

function CommentSent({ user, item }) {
    const [isReplyComment, setIsReplyComment] = useState(false);
    const [commentRepValue, setCommentReptValue] = useState('')

    const handleReplyComment = (id, value) => {
        const data = {
            id: item._id,
            user: {
                name: user.name,
                avatar: user.image
            },
            noi_dung: value,
            dateTime: moment().format('L')
        }
        if (value) {
            axios.post('/api/product-comment/reply', data)
            .then(res => {
                if(res.data.success) {
                    item.rep_comment.push(data);
                    setIsReplyComment(false)
                    setCommentReptValue('')
                    toast.success('Bình luận thành công')
                }
            }).catch(e=> {
                console.log(e.message)
            })
        } else {
            toast.warning('Bình luận rỗng!')
        }
    }

    return (
        <div>
            {/* <Loading /> */}
            <div className="flex items-center mb-4">
                <div className="mr-4 w-14 rounded-full overflow-hidden">
                    <img src={avatar} className="rounded-full" alt="avatar" />
                </div>
                <div className="w-full">
                    <div className="">
                        <p className="text-gray-600 font-bold text-lg inline-block">{item?.user?.name}</p>
                        <span className="text-gray-400 pl-2">{moment(item.createdAt ? item.createdAt : 0).fromNow()}</span>
                    </div>
                    <div className="w-full">
                        {item.noi_dung}
                    </div>
                    <span className="text-sky-400 cursor-pointer hover:underline" onClick={() => setIsReplyComment(prev => !prev)}>
                        trả lời
                    </span>
                </div>
            </div>
            {item.rep_comment && item.rep_comment !== [] && item.rep_comment.map((item, index) => (
                <div key={index}>
                    <CommentReply isReplyComment={isReplyComment} setIsReplyComment={setIsReplyComment} item={item} />
                </div>
            ))}
            {isReplyComment &&
                <div className="relative pl-16 mb-10">
                    <input
                        type="text"
                        name="price"
                        id="price"
                        required
                        onChange={(e) => setCommentReptValue(e.target.value)}
                        value={commentRepValue}
                        className="border focus:ring-indigo-300 focus:border-indigo-300 block w-full pl-7 py-2 pr-12 border-gray-300 rounded-md"
                        placeholder="Nhập nội dung bình luận của bạn"
                    />
                    <div
                        className="absolute top-1.5 right-4 bg-sky-400 text-white p-1 cursor-pointer rounded"
                        onClick={() => handleReplyComment(item.id, commentRepValue)}
                    >
                        Gửi bình luận
                    </div>
                </div>
            }
        </div>
    )
}

function CommentReply({ item }) {
    return (
        <div className="ml-16">
            <div className="flex items-center border-l-4 mb-4">
                <div className="mr-4 w-14 rounded-full ml-4 overflow-hidden">
                    <img src={avatar} className="rounded-full" alt="avatar" />
                </div>
                <div className="w-full">
                    <div className="">
                        <p className="text-gray-600 font-bold text-lg inline-block">{item && item.user.name}</p>
                        <span className="text-gray-400 pl-2">{item && moment(item.dateTime).startOf('minute').fromNow()}</span>
                    </div>
                    <div className="w-full">
                        {item && item.noi_dung}
                    </div>
                </div>
            </div>
        </div>
    )
}

