import Http from "../helpers/http";

const http = new Http();

const fetchAllBanners = async () => {
  try {
    const response = await http.get(`/banner/getAllBanners`);
    return response.result;
  } catch (error) {
    console.error(error);
  }
};



export const bannerService = {
    fetchAllBanners,

};
