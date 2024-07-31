import Http from "../helpers/http";

const http = new Http();

const fetchAllOrders = async () => {
  try {
    const response = await http.get(`/order/getAllOrders`);
    return response.result;
  } catch (error) {
    console.error(error);
  }
};

const fetchOrderByUserID = async () => {
  try {
    const response = await http.get(`/order/getOrderByUserID`);
    return response.result;
  } catch (error) {
    console.error(error);
  }
};

const fetchPostOrder = async (method, data) => {
  try {
    const response = await http.post(`/order/postOrder?method=${method}&source=web`, data);
    return response;
  } catch (error) {
    console.error(error);
  }
};

const fetchOrderByCode = async (code) => {
  try {
    const response = await http.get(`/order/getOrderByCode/${code}`);
    return response.result;
  } catch (error) {
    console.error(error);
  }
}

export const orderService = {
  fetchAllOrders,
  fetchOrderByUserID,
  fetchOrderByCode,
  fetchPostOrder,
};
