import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    cartMoto: [],
    cartAccessory: []
}

const CartSlice = createSlice({
    name: "cartList",
    initialState,
    reducers: {
        addToCartMoto: (state, action) => {
            const { id, product } = action.payload;
            const index = state.cartMoto.findIndex((item) => item.productId === id);
            if (index >= 0) return;
            if (index < 0) {
                const newItem = {
                    productId: id,
                    ...product
                }
                state.cartMoto.push(newItem);
            }
        },
        addToCartAccessory: (state, action) => {
            const { id, accessoryCart } = action.payload;
            const index = state.cartAccessory.findIndex((item) => item.productId === id);
            if (index >= 0) {
                if (state.cartAccessory[index].quantity + accessoryCart.quantity > 50) {
                    state.cartAccessory[index].quantity = 50
                } else if (state.cartAccessory[index].quantity > 50) {
                    return state
                } else {
                    state.cartAccessory[index].quantity = state.cartAccessory[index].quantity + accessoryCart.quantity;
                }
            }
            if (index < 0) {
                const newItem = {
                    productId: id,
                   ...accessoryCart
                }
                state.cartAccessory.push(newItem);
            }
        },
        selectQuantity: (state, action) => {
            const { id, quantity } = action.payload;
            const index = state.cartAccessory.findIndex((item) => item.id === id);
            if (index < 0) return;
            state.cartAccessory[index].quantity = quantity;
        },
        removeProduct: (state, action) => {
            const { id } = action.payload;
            const index = state.cartMoto.findIndex((item) => item.id === id);
            if (index < 0) return;
            state.cartMoto.splice(index, 1);
        },
        removeAccessory: (state, action) => {
            const { id } = action.payload;
            const index = state.cartAccessory.findIndex((item) => item.id === id);
            if (index < 0) return;
            state.cartAccessory.splice(index, 1);
        },
        cartEmpty: (state, action) => {
            return state = initialState;
        }
    }
})

const { reducer, actions } = CartSlice;
export const {
    selectQuantity,
    removeProduct,
    removeAccessory,
    addToCartMoto,
    addToCartAccessory,
    cartEmpty,
} = actions;

export default reducer;
