import axios from "axios";
import { useState } from "react";
import { AiOutlineStar } from "react-icons/ai";
import { toast } from "react-toastify";

export default function Review (props) {
  const { setModal, formReview, reload } = props
  const [rating, setRating] = useState(null);
  const [hover, setHover] = useState(null);
  const [cmtRating, setcmtRating] = useState('');
  const handleRating = () => {
      const dataReview = {
          ...formReview,
          noi_dung: cmtRating,
          point: rating,
      }
      if (cmtRating && rating) {
        axios.post('/api/product-review/add', dataReview)
        .then(res => {
          if(res.data.success) {
            reload(formReview.user)
            setModal(false)
            toast.success('Đánh giá thành công.')
          }
        });
      } else {
          toast.warn('Đánh giá rỗng.')
      }
  }
  return (
      <div className="star-rating-box">
          <div className="rating__body flex items-center">
              <div className="star-rating w-2/5">
                  <div className="text-center w-full">
                      {[...Array(5)].map((star, index) => {
                          const ratingValue = index + 1;
                          const style = {
                              color: ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9",
                          }

                          return (
                              <label key={index}>
                                  <input
                                      type="radio"
                                      name="rating"
                                      id="rating"
                                      value={ratingValue}
                                  />
                                  <AiOutlineStar
                                      className="text-3xl"
                                      style={style}
                                      onClick={() => setRating(ratingValue)}
                                      onMouseEnter={() => (setHover(ratingValue))}
                                      onMouseLeave={() => setHover(null)}
                                  />
                              </label>
                          )
                      })}
                  </div>
                  <div className="level-rating">
                      {
                          (hover || rating) === 1 ? "Không thích"
                              : (hover || rating) === 2 ? "Tạm được"
                                  : (hover || rating) === 3 ? "Bình thường"
                                      : (hover || rating) === 4 ? "Hài lòng"
                                          : (hover || rating) === 5 ? "Tuyệt vời"
                                              : ""
                      }
                  </div>
              </div>
              <div className="py-2 w-full">
                  <div className="relative">
                    <label className="py-4 text-lg mb-2 font-bold">Nội dung đánh giá: </label>
                    <textarea
                      id="content"
                      className="w-full border rounded-lg p-2 h-32 resize-none border-blue-700 outline-none"
                      type="text"
                      value={cmtRating}
                      onChange={(e) => setcmtRating(e.target.value)}
                      />
                      <div className="w-full text-right mt-4">
                        <button
                          className="bg-sky-400 w-fit text-white p-1 cursor-pointer rounded"
                          onClick={handleRating}
                        >
                          Gửi đánh giá
                        </button>
                      </div>
                  </div>
              </div>
          </div>
      </div>

  )
}
