const checkPromotion = (product) =>  {
  if (product) {
    if (product.promotion_id) {
        const toDay = new Date()
        const dateStart = new Date(product.promotion_id.dateStart)
        const dateEnd = new Date(product.promotion_id.dateEnd)
        if (dateStart.getTime() <= toDay.getTime() && toDay.getTime() <= dateEnd.getTime()) return true
        else return false
    } else return false
  } else return false
}

export default checkPromotion
