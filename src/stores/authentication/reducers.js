import {
  LOAD_CURRENT_LOGIN_USER_FAILED,
  LOAD_CURRENT_LOGIN_USER_REQUEST,
  LOAD_CURRENT_LOGIN_USER_SUCCESS,
  LOGIN_FAILED,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT,
  REFRESH_TOKEN_FAILED,
  REFRESH_TOKEN_SUCCESS,
  REGISTER_FAILED,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
} from "./types";

const initialState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  accessToken: null,
  refreshToken: null,
  error: null,
};

const authenticationReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST: {
      return { ...state, loading: true };
    }
    case LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        error: null,
        accessToken: action.payload.accessToken || null,
        refreshToken: action.payload.refreshToken || null,
      };
    case LOGIN_FAILED:
      return {
        ...state,
        isAuthenticated: false,
        loading: false,
        accessToken: null,
        refreshToken: null,
        error: action.payload,
      };
    case REGISTER_REQUEST: {
      return { ...state, loading: true };
    }
    case REGISTER_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        error: null,
        accessToken: action.payload.accessToken || null,
        refreshToken: action.payload.refreshToken || null,
      };
    case REGISTER_FAILED:
      return {
        ...state,
        isAuthenticated: false,
        loading: false,
        accessToken: null,
        refreshToken: null,
        error: action.payload,
      };
    case LOAD_CURRENT_LOGIN_USER_REQUEST: {
      return { ...state, isAuthenticated: true, loading: true };
    }
    case LOAD_CURRENT_LOGIN_USER_SUCCESS: {
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload,
      };
    }
    case LOAD_CURRENT_LOGIN_USER_FAILED: {
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    }
    case REFRESH_TOKEN_SUCCESS: {
      return {
        ...state,
        loading: false,
        accessToken: action.payload.accessToken || null,
        refreshToken: action.payload.refreshToken || null,
        error: null,
      };
    }
    case REFRESH_TOKEN_FAILED: {
      return {
        ...state,
        loading: false,
        accessToken: null,
        refreshToken: null,
        error: action.payload,
      };
    }
    case LOGOUT:
      return initialState;
    default:
      return state;
  }
};

export default authenticationReducer;
