import {
  ADD_CART_FAILED,
  ADD_CART_REQUEST,
  ADD_CART_SUCCESS,
  GET_CART_FAILED,
  GET_CART_REQUEST,
  GET_CART_SUCCESS,
  REMOVE_ALL_CART_FAILED,
  REMOVE_ALL_CART_REQUEST,
  REMOVE_ALL_CART_SUCCESS,
  REMOVE_CART_FAILED,
  REMOVE_CART_REQUEST,
  REMOVE_CART_SUCCESS,
  UPDATE_CART_FAILED,
  UPDATE_CART_REQUEST,
  UPDATE_CART_SUCCESS,
} from "./types";

const initialState = {
  carts: [],
  loading: false,
  error: null,
};



const handleError = (state, actionType, error) => {
  return {
    ...state,
    loading: false,
    error: error,
  };
};

const updateCartItem = (state, action, condition) => {
  const { productID } = action.payload;
  const existingItemIndex = state.carts.findIndex(condition);

  if (existingItemIndex !== -1) {
    const updatedCarts = [...state.carts];
    updatedCarts[existingItemIndex] = action.payload;
    return {
      ...state,
      carts: updatedCarts,
    };
  } else {
    return {
      ...state,
      carts: [...state.carts, action.payload],
    };
  }
};

const removeCartItem = (state, action) => {
  const { productID } = action.payload;
  const updatedCarts = state.carts.filter((item) => item._id !== productID);
  return {
    ...state,
    carts: updatedCarts,
  };
};

const cartReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_CART_REQUEST:
    case ADD_CART_REQUEST:
    case REMOVE_CART_REQUEST:
    case UPDATE_CART_REQUEST:
    case REMOVE_ALL_CART_REQUEST:
      return { ...state, loading: true, error: null };

    case GET_CART_SUCCESS:
      return {
        ...state,
        carts: action.payload,
      };

    case ADD_CART_SUCCESS:
      return updateCartItem(
        state,
        action,
        (item) => item.productID === action.payload.productID
      );

    case UPDATE_CART_SUCCESS:
      return updateCartItem(
        state,
        action,
        (item) => item.productID === action.payload.productID
      );

    case REMOVE_CART_SUCCESS:
      return removeCartItem(state, action);

    case REMOVE_ALL_CART_SUCCESS:
      return {
        ...state,
        carts: [],
      };
    case GET_CART_FAILED:
    case ADD_CART_FAILED:
    case REMOVE_CART_FAILED:
    case UPDATE_CART_FAILED:
    case REMOVE_ALL_CART_FAILED:
      return handleError(state, action.type, action.payload);

    default:
      return state;
  }
};
export default cartReducer;
