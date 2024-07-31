import Http from "../helpers/http";

const http = new Http();

const fetchAllCategories = async () => {
  try {
    const response = await http.get(`/category/getAllCategories`);
    return response.result;
  } catch (error) {
    console.error(error);
  }
};

const fetchCategoryBySlug = async (slug) => {
  try {
    const response = await http.get(`/category/getCategoryBySlug/${slug}`);
    return response.result;
  } catch (error) {
    console.error(error);
  }
};

export const categoryService = {
  fetchAllCategories,
  fetchCategoryBySlug,
};
