import { verifyToken } from "../../helpers/verify";
import { userService } from "../../services/user.service";
import {
  LOAD_CURRENT_LOGIN_USER_FAILED,
  LOAD_CURRENT_LOGIN_USER_SUCCESS,
  LOGIN_FAILED,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT,
  REGISTER_FAILED,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
} from "./types";

export const login = (data) => {
  return async (dispatch) => {
    dispatch({
      type: LOGIN_REQUEST,
      payload: {
        email: data.email,
        password: data.password,
      },
    });

    try {
      const response = await userService.login(data.email, data.password);
      if (response.status === true) {
        dispatch({
          type: LOGIN_SUCCESS,
          payload: response.result,
        });
        await verifyToken(response.result.accessToken);
        const info = await userService.fetchUserByID();
        try {
          dispatch({
            type: LOAD_CURRENT_LOGIN_USER_SUCCESS,
            payload: info.result,
          });
          return {
            status: true,
            message: response.message,
          };
        } catch (userError) {
          dispatch({
            type: LOAD_CURRENT_LOGIN_USER_FAILED,
            payload: {
              status: false,
              message: userError.message,
            },
          });
        }
      } else {
        dispatch({
          type: LOGIN_FAILED,
          payload: response,
        });
        return {
          status: false,
          response,
        };
      }
    } catch (error) {
      dispatch({
        type: LOGIN_FAILED,
        payload: {
          status: false,
          message: error.message,
        },
      });
    }
  };
};

export const google = (data) => {
  if (data) {
    return async (dispatch) => {
      dispatch({
        type: LOGIN_REQUEST,
        payload: {
          accessToken: data.accessToken,
          accessToken: data.refeshToken,
        },
      });
      try {
        dispatch({
          type: LOGIN_SUCCESS,
          payload: {
            refeshToken: data.refeshToken,
            accessToken: data.accessToken,
          },
        });
        const info = await userService.fetchUserByID();
        try {
          dispatch({
            type: LOAD_CURRENT_LOGIN_USER_SUCCESS,
            payload: info.result,
          });
          return {
            status: true,
            message: response.message,
          };
        } catch (userError) {
          dispatch({
            type: LOAD_CURRENT_LOGIN_USER_FAILED,
            payload: {
              status: false,
              message: userError.message,
            },
          });
        }
      } catch (error) {
        dispatch({
          type: LOGIN_FAILED,
          payload: {
            status: false,
            message: error.message,
          },
        });
      }
    };
  }
};

export const register = (data) => {
  return async (dispatch) => {
    dispatch({
      type: REGISTER_REQUEST,
      payload: {
        fullname: data.fullname,
        username: data.username,
        email: data.email,
        password: data.password,
        confirm_password: data.confirm_password,
      },
    });

    try {
      const response = await userService.register(
        data.fullname,
        data.username,
        data.email,
        data.password,
        data.confirm_password
      );
      if (response.status === true) {
        dispatch({
          type: REGISTER_SUCCESS,
          payload: response.result,
        });
        return {
          status: true,
          message: response.message,
        };
      } else {
        dispatch({
          type: REGISTER_FAILED,
          payload: response,
        });
        return {
          status: false,
          response,
        };
      }
    } catch (error) {
      dispatch({
        type: REGISTER_FAILED,
        payload: {
          status: false,
          message: error.message,
        },
      });
      throw error; // Rethrow error để cho createAsyncThunk biết đã xảy ra lỗi
    }
  };
};

export const logout = (data) => {
  return async (dispatch) => {
    try {
      console.log(data);
      const response = await userService.logout(data);
      if (response.status === true) {
        dispatch({
          type: LOGOUT,
          payload: response.result,
        });
      } else {
        dispatch({
          type: LOGOUT,
          payload: response,
        });
        return {
          status: false,
          response,
        };
      }
    } catch (error) {
      dispatch({
        type: LOGOUT,
        payload: {
          status: false,
          message: error.message,
        },
      });
    }
  };
};
