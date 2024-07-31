import { useState } from "react";
import { userService } from "../../services/user.service";
import createNotification from "../../utils/notification";
import { LOAD_CURRENT_LOGIN_USER_SUCCESS } from "../../stores/authentication/types";
import { COLOR } from "../../constants/style.constants";
import { useDispatch } from "react-redux";

const initialValues = (user) => ({
  fullname: user?.fullname || "",
  username: user?.username || "",
  phone: user?.phone || "",
});

const UpdateProfile = ({ user }) => {
  const dispatch = useDispatch();
  const [inputs, setInputs] = useState(initialValues(user));
  const handleChangeInput = (e) => {
    const { name, value } = e.target;
    setInputs((prevInputs) => ({
      ...prevInputs,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await userService.updateMe(inputs);
      dispatch({
        type: LOAD_CURRENT_LOGIN_USER_SUCCESS,
        payload: response.user,
      });
      if (response.status === true) {
        createNotification("success", "topRight", response.message);
      } else {
        createNotification("error", "topRight", response.message);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex space-x-8">
        <div className="w-[570px] ">
          <div className="input-item flex space-x-2.5 mb-8">
            <div className="w-1/2 h-full">
              <div className="input-com w-full h-full">
                <label className="input-label capitalize block  mb-2 text-qgray text-[13px] font-normal">
                  Họ và tên *
                </label>
                <div className="input-wrapper border border-qgray-border w-full h-full overflow-hidden relative rounded-md">
                  <input
                    placeholder="Nguyen Van A"
                    className="input-field placeholder:text-sm text-sm px-6 text-dark-gray w-full font-normal bg-white focus:ring-0 focus:outline-none h-[40px] "
                    type="text"
                    name="fullname"
                    onChange={handleChangeInput}
                    value={inputs.fullname}
                  />
                </div>
              </div>
            </div>
            <div className="w-1/2 h-full">
              <div className="input-com w-full h-full">
                <label className="input-label capitalize block  mb-2 text-qgray text-[13px] font-normal">
                  Tên tài khoản *
                </label>
                <div className="input-wrapper border border-qgray-border w-full h-full overflow-hidden relative rounded-md ">
                  <input
                    placeholder="Username"
                    className="input-field placeholder:text-sm text-sm px-6 text-dark-gray w-full font-normal bg-white focus:ring-0 focus:outline-none h-[40px]"
                    type="text"
                    name="username"
                    onChange={handleChangeInput}
                    value={inputs.username}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="input-item flex space-x-2.5 mb-8">
            <div className="w-1/2 h-full">
              <div className="input-com w-full h-full">
                <label className="input-label capitalize block  mb-2 text-qgray text-[13px] font-normal">
                  Email *
                </label>
                <div className="input-wrapper border border-qgray-border w-full h-full overflow-hidden relative rounded-md ">
                  <input
                    className="input-field placeholder:text-sm text-sm px-6 text-dark-gray w-full font-normal bg-white focus:ring-0 focus:outline-none h-[40px]"
                    type="email"
                    name="email"
                    disabled
                    onChange={handleChangeInput}
                    value={user?.email}
                  />
                </div>
              </div>
            </div>
            <div className="w-1/2 h-full">
              <div className="input-com w-full h-full">
                <label className="input-label capitalize block  mb-2 text-qgray text-[13px] font-normal">
                  Số điện thoại *
                </label>
                <div className="input-wrapper border border-qgray-border w-full h-full overflow-hidden relative rounded-md ">
                  <input
                    placeholder="012 3 *******"
                    className="input-field placeholder:text-sm text-sm px-6 text-dark-gray w-full font-normal bg-white focus:ring-0 focus:outline-none h-[40px]"
                    type="number"
                    min={9}
                    name="phone"
                    onChange={handleChangeInput}
                    value={inputs.phone}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <div className="update-logo w-full mb-9">
            <div className="flex xl:justify-center justify-start">
              <div className="relative">
                <div className="sm:w-[188px] sm:h-[188px] w-[189px] h-[189px] rounded-full overflow-hidden relative">
                  <img
                    src={`https://ui-avatars.com/api/name=${user?.fullname}`}
                    alt
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="action-area flex space-x-4 items-center">
        <button
          type="submit"
          className="w-[164px] h-[50px] bg-black text-white text-sm rounded-lg"
          style={{
            background: COLOR.BLUE,
            color: "white",
          }}
        >
          Cập nhật thông tin
        </button>
      </div>
    </form>
  );
};
export default UpdateProfile;