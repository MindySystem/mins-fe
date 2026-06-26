import React from 'react';
import {BsStarFill, BsStarHalf} from 'react-icons/bs'
function StarRating (props) {
    const { rating } = props;

    return (
        <div className="star">
            { rating >= 1 ?
                <BsStarFill color={ rating >= 1 ? '#ECCF0E' : rating >= 0.5? '#ECCF0E' : '#CCCCCC' }/>
                : rating >= 0.5 ?
                <BsStarHalf color={ rating >= 1 ? '#ECCF0E' : rating >= 0.5? '#ECCF0E' : '#CCCCCC' }/> : 
                <BsStarFill color={ rating >= 1 ? '#ECCF0E' : rating >= 0.5? '#ECCF0E' : '#CCCCCC' }/> 
            }

            { rating >= 2 ?
                <BsStarFill color={ rating >= 2 ? '#ECCF0E' : rating >= 1.5? '#ECCF0E' : '#CCCCCC' }/>
                : rating >= 1.5 ?
                <BsStarHalf color={ rating >= 2 ? '#ECCF0E' : rating >= 1.5? '#ECCF0E' : '#CCCCCC' }/> : 
                <BsStarFill color={ rating >= 2 ? '#ECCF0E' : rating >= 1.5? '#ECCF0E' : '#CCCCCC' }/> 
            }

            { rating >= 3 ?
                <BsStarFill color={ rating >= 3 ? '#ECCF0E' : rating >= 2.5? '#ECCF0E' : '#CCCCCC' }/>
                : rating >= 2.5 ?
                <BsStarHalf color={ rating >= 3 ? '#ECCF0E' : rating >= 2.5? '#ECCF0E' : '#CCCCCC' }/> : 
                <BsStarFill color={ rating >= 3 ? '#ECCF0E' : rating >= 2.5? '#ECCF0E' : '#CCCCCC' }/> 
            }

            { rating >= 4 ?
                <BsStarFill color={ rating >= 4 ? '#ECCF0E' : rating >= 3.5? '#ECCF0E' : '#CCCCCC' }/>
                : rating >= 3.5 ?
                <BsStarHalf color={ rating >= 4 ? '#ECCF0E' : rating >= 3.5? '#ECCF0E' : '#CCCCCC' }/> : 
                <BsStarFill color={ rating >= 4 ? '#ECCF0E' : rating >= 3.5? '#ECCF0E' : '#CCCCCC' }/> 
            }

            { rating >= 5 ?
                <BsStarFill color={ rating >= 5 ? '#ECCF0E' : rating >= 4.5? '#ECCF0E' : '#CCCCCC' }/>
                : rating >= 4.5 ?
                <BsStarHalf color={ rating >= 5 ? '#ECCF0E' : rating >= 4.5? '#ECCF0E' : '#CCCCCC' }/> : 
                <BsStarFill color={ rating >= 5 ? '#ECCF0E' : rating >= 4.5? '#ECCF0E' : '#CCCCCC' }/> 
            }
        </div>
    );
}

export default StarRating;
