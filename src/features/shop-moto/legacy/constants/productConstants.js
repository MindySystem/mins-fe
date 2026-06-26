import { Bounce } from "react-toastify";

export const PRODUCT_LIST_REQUEST = 'PRODUCT_LIST_REQUEST';
export const PRODUCT_LIST_SUCCESS = 'PRODUCT_LIST_SUCCESS';
export const PRODUCT_LIST_FAIL = 'PRODUCT_LIST_FAIL';

export const PRODUCT_DETAIL_REQUEST = 'PRODUCT_DETAIL_REQUEST';
export const PRODUCT_DETAIL_SUCCESS = 'PRODUCT_DETAIL_SUCCESS';
export const PRODUCT_DETAIL_FAIL = 'PRODUCT_DETAIL_FAIL';

export const CATEGORY_REQUEST = 'CATEGORY_REQUEST';
export const CATEGORY_SUCCESS = 'CATEGORY_SUCCESS';
export const CATEGORY_FAIL = 'CATEGORY_FAIL';

export const PRICE_REQUEST = 'PRICE_REQUEST';
export const PRICE_SUCCESS = 'PRICE_SUCCESS';
export const PRICE_FAIL = 'PRICE_FAIL';

export const TOAST_OPTIONS = {
    autoClose: 3000,
    hideProgressBar: true,
    transition: Bounce,
}