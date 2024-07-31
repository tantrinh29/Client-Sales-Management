import Http from "../helpers/http";

const http = new Http();

const fetchAllProducts = async () => {
  try {
    const response = await http.get(`/product/getAllProducts`);
    return response.result;
  } catch (error) {
    console.error(error);
  }
};

const getProductOfBrand = async (brandID) => {
  try {
    const response = await http.get(`/product/getProductOfBrand/${brandID}`);
    return response.result;
  } catch (error) {
    console.error(error);
  }
};

const fetchProductBySlug = async (slug) => {
  try {
    const response = await http.get(`/product/getProductBySlug/${slug}`);
    return response.result;
  } catch (error) {
    console.error(error);
  }
};

const fetchProductsByCategory = async (category) => {
  try {
    const response = await http.get(
      `/product/getProductsOfCategory/${category}`
    );
    return response.result;
  } catch (error) {
    console.error(error);
  }
};

export const productService = {
  fetchAllProducts,
  fetchProductBySlug,
  getProductOfBrand,
  fetchProductsByCategory,
};
