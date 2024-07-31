import Http from "../helpers/http";

const http = new Http();

const fetchAllBlogs = async () => {
  try {
    const response = await http.get(`/blog/getAllBlogs`);
    return response.result;
  } catch (error) {
    console.error(error);
  }
};

const fetchBlogBySlug = async (slug) => {
  try {
    const response = await http.get(`/blog/getBlogBySlug/${slug}`);
    return response.result;
  } catch (error) {
    console.error(error);
  }
};

export const blogService = {
  fetchAllBlogs,
  fetchBlogBySlug,
};
