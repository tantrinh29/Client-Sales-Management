import Http from "../helpers/http";

const http = new Http();
const login = async (email, password) => {
  const body = { email, password };
  return await http.post("/auth/login", body).then((response) => {
    return response;
  });
};

const register = async (
  fullname,
  username,
  email,
  password,
  confirm_password
) => {
  const body = { fullname, username, email, password, confirm_password };
  return await http.post("/auth/register", body).then((response) => {
    return response;
  });
};

const updateMe = async (data) => {
  return await http.patch("/auth/me", data).then((response) => {
    return response;
  });
};

const changePassword = async (data) => {
  return await http.update("/auth/change-password", data).then((response) => {
    return response;
  });
};

const forgotPassword = async (data) => {
  return await http.post("/auth/forgot-password", data).then((response) => {
    return response;
  });
};

const resetPassword = async (data) => {
  return await http.post("/auth/reset-password", data).then((response) => {
    return response;
  });
};

const fetchUserByID = async () => {
  try {
    const response = await http.get(`/auth/me`);
    return response;
  } catch (error) {
    console.error(error);
  }
};

const logout = async (refreshToken) => {
  const body = { refreshToken };
  return await http.post("/auth/logout", body).then((response) => {
    return response;
  });
};
export const userService = {
  login,
  register,
  updateMe,
  fetchUserByID,
  changePassword,
  forgotPassword,
  resetPassword,
  logout,
};
