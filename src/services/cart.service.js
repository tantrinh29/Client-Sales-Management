import Http from "../helpers/http";

const http = new Http();

const fetchCartByUserID = async () => {
  try {
    const response = await http.get(`/cart/getCartByUserId`);
    return response;
  } catch (error) {
    console.error(error);
  }
};

const fetchPostCart = async (data) => {
  try {
    const response = await http.post(`/cart/addCart`, data);
    return response;
  } catch (error) {
    console.error(error);
  }
};

const fetchUpdateCart = async (data) => {
  try {
    const response = await http.update(`/cart/updateCart`, data);
    return response;
  } catch (error) {
    console.error(error);
  }
};

const fetchDeleteCartByID = async (id) => {
  try {
    const response = await http.delete(`/cart/deleteCartById/${id}`);
    return response;
  } catch (error) {
    console.error(error);
  }
};

const fetchDeleteCartAllByUserID = async () => {
  try {
    const response = await http.delete(`/cart/deleteCartAllByUserId`);
    return response;
  } catch (error) {
    console.error(error);
  }
};

export const cartService = {
  fetchCartByUserID,
  fetchPostCart,
  fetchUpdateCart,
  fetchDeleteCartByID,
  fetchDeleteCartAllByUserID,
};
