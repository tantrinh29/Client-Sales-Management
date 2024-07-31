import Http from "../helpers/http";

const http = new Http();

const fetchAllComments = async () => {
  try {
    const response = await http.get(`/comment/getAllComments`);
    return response.result;
  } catch (error) {
    console.error(error);
  }
};

const fetchByProductComments = async (id) => {
  try {
    const response = await http.get(`/comment/getCommentByProductID/${id}`);
    return response.result;
  } catch (error) {
    console.error(error);
  }
};

const fetchPostComment = async (data) => {
  try {
    const response = await http.post(`/comment/postComment`, data);
    return response;
  } catch (error) {
    console.error(error);
  }
};

const fetchUpdateComment = async (data, id) => {
  try {
    const response = await http.post(`/comment/updateComment/${id}`, data);
    return response;
  } catch (error) {
    console.error(error);
  }
};

export const commentService = {
  fetchAllComments,
  fetchByProductComments,
  fetchPostComment,
  fetchUpdateComment,
};
