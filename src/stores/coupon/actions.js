import { couponService } from "../../services/coupon.service";
import {
  APPLY_COUPON_FAILED,
  APPLY_COUPON_REQUEST,
  APPLY_COUPON_SUCCESS,
  GET_DISCOUNT_FAILED,
  GET_DISCOUNT_REQUEST,
  GET_DISCOUNT_SUCCESS,
  GET_FILTER_COUPON_PRODUCT_FAILED,
  GET_FILTER_COUPON_PRODUCT_REQUEST,
  GET_FILTER_COUPON_PRODUCT_SUCCESS,
  UNAPPLY_COUPON_FAILED,
  UNAPPLY_COUPON_REQUEST,
  UNAPPLY_COUPON_SUCCESS,
} from "./types";

export const getDiscount = () => {
  return async (dispatch) => {
    dispatch({
      type: GET_DISCOUNT_REQUEST,
    });
    try {
      const response = await couponService.fetchCouponByUserID();
      dispatch({
        type: GET_DISCOUNT_SUCCESS,
        payload: response, 
      });
      return response;
    } catch (error) {
      dispatch({
        type: GET_DISCOUNT_FAILED,
        payload: {
          status: false,
          message: error.message,
        },
      });
      console.log(error);
    }
  };
};

export const getFilterCoupon = (carts, coupon) => {
  return async (dispatch) => {
    dispatch({
      type: GET_FILTER_COUPON_PRODUCT_REQUEST,
    });
    try {
      dispatch({
        type: GET_FILTER_COUPON_PRODUCT_SUCCESS,
        payload: { carts, coupon },
      });
    } catch (error) {
      dispatch({
        type: GET_FILTER_COUPON_PRODUCT_FAILED,
        payload: {
          status: false,
          message: error.message,
        },
      });
    }
  };
};

export const applyCoupon = (data) => {
  return async (dispatch) => {
    dispatch({
      type: APPLY_COUPON_REQUEST,
    });
    try {
      const response = await couponService.fetchPostCoupon(data);
      if (response.status === true) {
        dispatch({
          type: APPLY_COUPON_SUCCESS,
          payload: response.result,
        });
        return {
          status: true,
          message: response.message,
        };
      } else {
        dispatch({
          type: APPLY_COUPON_FAILED,
        });
        return response;
      }
    } catch (error) {
      dispatch({
        type: APPLY_COUPON_FAILED,
        payload: {
          status: false,
          message: error.message,
        },
      });
    }
  };
};

export const uncheckedCoupon = (data) => {
  return async (dispatch) => {
    dispatch({
      type: UNAPPLY_COUPON_REQUEST,
    });
    try {
      const response = await couponService.fetchDeleteCoupon(data.couponID);
      if (response.status === true) {
        dispatch({
          type: UNAPPLY_COUPON_SUCCESS,
          payload: data.couponID,
        });
        return {
          status: true,
          message: response.message,
        };
      } else {
        dispatch({
          type: UNAPPLY_COUPON_FAILED,
        });
        return response;
      }
    } catch (error) {
      dispatch({
        type: UNAPPLY_COUPON_FAILED,
        payload: {
          status: false,
          message: error.message,
        },
      });
    }
  };
};
