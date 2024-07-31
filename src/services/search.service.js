import Http from "../helpers/http";

const http = new Http();

const fetchSearchFilterProducts = async (search) => {
  try {
    const response = await http.get(
      `/product/getAllSearchFilter?query=${search}`
    );
    return response;
  } catch (error) {
    console.error(error);
  }
};

const fetchPostHistorySearch = async (data) => {
  try {
    const response = await http.post(`/search/postHistorySearch`, {
      nameSearch: data,
    });
    return response;
  } catch (error) {
    console.error(error);
  }
};

const fetchHistorySearchByUserID = async () => {
  try {
    const response = await http.get(`/search/getHistorySearchByUserID`);
    return response;
  } catch (error) {
    console.error(error);
  }
};

const fetchDeleteAllHistorySearch = async () => {
  try {
    const response = await http.delete(`/search/deleteHistorySearchAll`);
    return response;
  } catch (error) {
    console.error(error);
  }
};

export const searchService = {
  fetchSearchFilterProducts,
  fetchPostHistorySearch,
  fetchHistorySearchByUserID,
  fetchDeleteAllHistorySearch,
};
