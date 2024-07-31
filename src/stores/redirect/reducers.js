import { SET_REDIRECT_TO } from "./types";

const initialState = {
  redirectTo: null,
};

const redirectReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_REDIRECT_TO:
      return {
        ...state,
        redirectTo: action.payload,
      };
    default:
      return initialState;
  }
};

export default redirectReducer;
