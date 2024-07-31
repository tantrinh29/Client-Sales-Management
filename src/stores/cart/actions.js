import {
  ADD_CART_REQUEST,
  UPDATE_CART_REQUEST,
  REMOVE_CART_REQUEST,
  REMOVE_ALL_CART_REQUEST,
  GET_CART_REQUEST,
  ADD_CART_SUCCESS,
  ADD_CART_FAILED,
  UPDATE_CART_SUCCESS,
  UPDATE_CART_FAILED,
  GET_CART_SUCCESS,
  GET_CART_FAILED,
  REMOVE_CART_SUCCESS,
  REMOVE_CART_FAILED,
  REMOVE_ALL_CART_SUCCESS,
  REMOVE_ALL_CART_FAILED,
} from "./types";
import { cartService } from "../../services/cart.service";

export const getCart = (data) => {
  return async (dispatch) => {
    dispatch({
      type: GET_CART_REQUEST,
      payload: data,
    });

    try {
      const response = await cartService.fetchCartByUserID();
      if (response.status === true) {
        dispatch({
          type: GET_CART_SUCCESS,
          payload: response.result,
        });
        return {
          status: true,
          message: response.message,
        };
      } else {
        dispatch({
          type: GET_CART_FAILED,
          payload: response,
        });
        return response;
      }
    } catch (error) {
      dispatch({
        type: GET_CART_FAILED,
        payload: {
          status: false,
          message: error.message,
        },
      });
    }
  };
};

export const addToCart = (data) => {
  return async (dispatch) => {
    dispatch({
      type: ADD_CART_REQUEST,
      payload: data,
    });

    try {
      const response = await cartService.fetchPostCart(data);
      if (response.status === true) {
        dispatch({
          type: ADD_CART_SUCCESS,
          payload: response.result,
        });
        return {
          status: true,
          message: response.message,
        };
      } else {
        dispatch({
          type: ADD_CART_FAILED,
          payload: response,
        });
        return response;
      }
    } catch (error) {
      dispatch({
        type: ADD_CART_FAILED,
        payload: {
          status: false,
          message: error.message,
        },
      });
    }
  };
};

export const updateToCart = (data) => {
  return async (dispatch) => {
    dispatch({
      type: UPDATE_CART_REQUEST,
      payload: data,
    });

    try {
      const response = await cartService.fetchUpdateCart(data);
      if (response.status === true) {
        dispatch({
          type: UPDATE_CART_SUCCESS,
          payload: response.result,
        });
        return {
          status: true,
          message: response.message,
        };
      } else {
        dispatch({
          type: UPDATE_CART_FAILED,
          payload: response,
        });
        return response;
      }
    } catch (error) {
      dispatch({
        type: UPDATE_CART_FAILED,
        payload: {
          status: false,
          message: error.message,
        },
      });
    }
  };
};

export const deleteToCartItem = (data) => {
  return async (dispatch) => {
    dispatch({
      type: REMOVE_CART_REQUEST,
      payload: data,
    });

    try {
      const response = await cartService.fetchDeleteCartByID(data);
      if (response.status === true) {
        dispatch({
          type: REMOVE_CART_SUCCESS,
          payload: response.result,
        });
        return {
          status: true,
          message: response.message,
        };
      } else {
        dispatch({
          type: REMOVE_CART_FAILED,
          payload: response,
        });
        return response;
      }
    } catch (error) {
      dispatch({
        type: REMOVE_CART_FAILED,
        payload: {
          status: false,
          message: error.message,
        },
      });
    }
  };
};

export const deleteToCartAll = () => {
  return async (dispatch) => {
    dispatch({
      type: REMOVE_ALL_CART_REQUEST,
    });

    try {
      const response = await cartService.fetchDeleteCartAllByUserID();
      if (response.status === true) {
        dispatch({
          type: REMOVE_ALL_CART_SUCCESS,
          payload: response.result,
        });
        return {
          status: true,
          message: response.message,
        };
      } else {
        dispatch({
          type: REMOVE_ALL_CART_FAILED,
          payload: response,
        });
        return response;
      }
    } catch (error) {
      dispatch({
        type: REMOVE_ALL_CART_FAILED,
        payload: {
          status: false,
          message: error.message,
        },
      });
    }
  };
};
