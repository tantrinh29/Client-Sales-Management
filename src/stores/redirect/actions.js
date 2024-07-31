import { SET_REDIRECT_TO } from "./types";

export const setRedirectTo = (redirectTo) => ({
  type: SET_REDIRECT_TO,
  payload: redirectTo,
});
