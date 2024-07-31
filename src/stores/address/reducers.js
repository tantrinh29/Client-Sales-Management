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
  SET_EDIT_MODE,
  UPDATE_ADDRESS_FAILED,
  UPDATE_ADDRESS_REQUEST,
  UPDATE_ADDRESS_SUCCESS,
} from "./types";

const initialState = {
  address: [],
  loading: false,
  error: null,
  isEditAddress: false,
};

const handleError = (state, actionType, error) => {
  return {
    ...state,
    loading: false,
    error: error,
  };
};

const addressReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_ADDRESS_REQUEST:
    case ADD_ADDRESS_REQUEST:
    case UPDATE_ADDRESS_REQUEST:
    case DELETE_ADDRESS_REQUEST:
      return { ...state, loading: true };

    case SET_EDIT_MODE:
      return { ...state, isEditAddress: action.payload };
    case GET_ADDRESS_SUCCESS:
      const { address } = state;
      const newAddresses = action.payload;

      newAddresses.forEach((newAddress) => {
        const existingIndex = address.findIndex(
          (existing) => existing._id === newAddress._id
        );

        if (existingIndex !== -1) {
          address[existingIndex] = newAddress;
        } else {
          address.push(newAddress);
        }
      });

      return {
        ...state,
        address: action.payload,
      };

    case ADD_ADDRESS_SUCCESS:
      const { result } = action.payload;
      return {
        ...state,
        loading: false,
        address: [...state.address, result],
      };

    case UPDATE_ADDRESS_SUCCESS:
      const { result: updatedAddress } = action.payload;
      const updatedAddressIndex = state.address.findIndex(
        (item) => item._id === updatedAddress._id
      );

      if (updatedAddressIndex !== -1) {
        const updatedAddressArray = [...state.address];
        updatedAddressArray[updatedAddressIndex] = updatedAddress;

        return {
          ...state,
          loading: false,
          address: updatedAddressArray,
        };
      } else {
        return state;
      }

    case DELETE_ADDRESS_SUCCESS:
      return {
        ...state,
        loading: false,
        address: state.address.filter(
          (huydev) => huydev._id !== action.payload
        ),
      };
    case GET_ADDRESS_FAILED:
    case ADD_ADDRESS_FAILED:
    case UPDATE_ADDRESS_FAILED:
    case DELETE_ADDRESS_FAILED:
      return handleError(state, action.type, action.payload);

    default:
      return initialState;
  }
};

export default addressReducer;
