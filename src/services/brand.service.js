import Http from "../helpers/http";

const http = new Http();

const fetchAllBrands = async () => {
  try {
    const response = await http.get(`/brand/getAllBrands`);
    return response.result;
  } catch (error) {
    console.error(error);
  }
};

const fetchBrandBySlug = async (slug) => {
  try {
    const response = await http.get(`/brand/getBrandBySlug/${slug}`);
    return response;
  } catch (error) {
    console.error(error);
  }
};

export const brandService = {
  fetchAllBrands,
  fetchBrandBySlug,
};
