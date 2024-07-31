import { addressService } from "../../services/address.service";
import {
  ADD_ADDRESS_FAILED,
  ADD_ADDRESS_REQUEST,
  ADD_ADDRESS_SUCCESS,
  DELETE_ADDRESS_FAILED,
  DELETE_ADDRESS_REQUEST,
  DELETE_ADDRESS_SUCCESS,
  GET_ADDRESS_FAILED,
  GET_ADDRESS_REQUEST,
  GET_ADDRESS_SUCCESS,
  UPDATE_ADDRESS_FAILED,
  UPDATE_ADDRESS_REQUEST,
  UPDATE_ADDRESS_SUCCESS,
} from "./types";

export const getAddress = () => {
  return async (dispatch) => {
    dispatch({
      type: GET_ADDRESS_REQUEST,
    });
    try {
      const response = await addressService.fetchAddressByUserID();
      dispatch({
        type: GET_ADDRESS_SUCCESS,
        payload: response,
      });
      return response;
    } catch (error) {
      dispatch({
        type: GET_ADDRESS_FAILED,
        payload: {
          status: false,
          message: error.message,
        },
      });
      console.log(error);
    }
  };
};

export const addAddress = (data) => {
  return async (dispatch) => {
    dispatch({
      type: ADD_ADDRESS_REQUEST,
      payload: data,
    });
    try {
      const response = await addressService.fetchPostAddress(data);
      if (response.status === true) {
        dispatch({
          type: ADD_ADDRESS_SUCCESS,
          payload: response,
        });
        return {
          status: true,
          message: response.message,
        };
      } else {
        dispatch({
          type: ADD_ADDRESS_FAILED,
        });
        return response;
      }
    } catch (error) {
      dispatch({
        type: ADD_ADDRESS_FAILED,
        payload: {
          status: false,
          message: error.message,
        },
      });
    }
  };
};

export const updateAddress = (data) => {
  return async (dispatch) => {
    dispatch({
      type: UPDATE_ADDRESS_REQUEST,
      payload: data,
    });
    try {
      const { id, ...dataWithoutId } = data;
      const response = await addressService.fetchUpdateAddress(
        dataWithoutId,
        data.id
      );
      if (response.status === true) {
        dispatch({
          type: UPDATE_ADDRESS_SUCCESS,
          payload: response,
        });
        return {
          status: true,
          message: response.message,
        };
      } else {
        dispatch({
          type: UPDATE_ADDRESS_FAILED,
        });
        return response;
      }
    } catch (error) {
      dispatch({
        type: UPDATE_ADDRESS_FAILED,
        payload: {
          status: false,
          message: error.message,
        },
      });
    }
  };
};

export const deleteAddress = (data) => {
  return async (dispatch) => {
    dispatch({
      type: DELETE_ADDRESS_REQUEST,
    });
    try {
      const response = await addressService.fetchDeleteAddress(data);
      if (response.status === true) {
        dispatch({
          type: DELETE_ADDRESS_SUCCESS,
          payload: data,
        });
        return {
          status: true,
          message: response.message,
        };
      } else {
        dispatch({
          type: DELETE_ADDRESS_FAILED,
        });
        return response;
      }
    } catch (error) {
      dispatch({
        type: DELETE_ADDRESS_FAILED,
        payload: {
          status: false,
          message: error.message,
        },
      });
    }
  };
};
