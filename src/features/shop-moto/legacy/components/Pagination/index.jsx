import React from 'react'

const Pagination = ({ products, paginate, postsPerPage, currentPage }) => {
  const totalPosts = products.length;
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
      pageNumbers.push(i);
  }


    return (
      <div className="pagination">
        {pageNumbers.map((number) => (
            <p key={number}
            className={`pagination_number btn ${currentPage === number && 'active'}`}
            onClick={() => paginate(number)}
            >{number}</p>
        ))}
      </div>
    )
}

export default Pagination
