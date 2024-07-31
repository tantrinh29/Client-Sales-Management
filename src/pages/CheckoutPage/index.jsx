import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Layout from "../../components/Layout";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../contexts/AppContextProvider";
import huydev from "../../json/address.json";
import { formatPrice } from "../../utils/fomatPrice";
import { useQuery } from "@tanstack/react-query";
import { paymentService } from "../../services/payment.service";
import Loading from "../../components/Loading";
import { useDispatch } from "react-redux";
import { dataOrder, redirectPayment } from "../../stores/order/actions";
import { history } from "../../helpers/history";
import Modal from "../../components/Modal";
import {
  addAddress,
  getAddress,
  updateAddress,
} from "../../stores/address/actions";
import createNotification from "../../utils/notification";
import { SET_EDIT_MODE } from "../../stores/address/types";

const initialValues = (user) => ({
  id: user?._id,
  name: user?.name || "",
  address: user?.address || "",
  city: user?.city || "",
  district: user?.district || "",
  commune: user?.commune || "",
  phone: user?.phone || "",
  default: user?.default || false,
});

export default function CheckoutPage() {
  const { code } = useParams();
  const { user, carts, billings, isEditAddress } = useContext(AppContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isAddressPageOpen, setIsAddressPageOpen] = useState(false);
  const modalAddressRef = useRef();
  const [provinces, setProvinces] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCommune, setSelectedCommune] = useState("");
  const [activePaymentItem, setActivePaymentItem] = useState(
    "64f98dfe26535a0cff5054ea"
  );
  const [validationErrors, setValidationErrors] = useState([]);
  const [inputs, setInputs] = useState(initialValues());
  const [isAddressItem, setIsAddressItem] = useState(null);

  const handleEditModalAddress = (item) => {
    setInputs(initialValues(item));
    setSelectedProvince(item.city);
    setSelectedDistrict(item.district);
    setSelectedCommune(item.commune);
    setValidationErrors([]);
    dispatch({ type: SET_EDIT_MODE, payload: true });
    setIsAddressPageOpen(true);
  };

  const handleCloseModalAddress = () => {
    setInputs(initialValues());
    setSelectedProvince("");
    setSelectedDistrict("");
    setSelectedCommune("");
    setValidationErrors([]);
    dispatch({ type: SET_EDIT_MODE, payload: false });
    setIsAddressPageOpen(false);
  };

  useEffect(() => {
    if (billings.length > 0) {
      setIsAddressItem(billings[0]._id);
    }
  }, [billings]);

  const handleActionAddress = useCallback((id) => {
    setIsAddressItem(id);
  }, []);

  const handleDocumentClick = (event) => {
    if (
      modalAddressRef.current &&
      !modalAddressRef.current.contains(event.target)
    ) {
      setInputs(initialValues());
      setSelectedProvince("");
      setSelectedDistrict("");
      setSelectedCommune("");
      setValidationErrors([]);
      dispatch({ type: SET_EDIT_MODE, payload: false });
      setIsAddressPageOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  const { data: isPayments, isloading: loadingPayment } = useQuery(
    ["payment"],
    () => paymentService.fetchAllPayments(),
    {
      retry: 3,
      retryDelay: 1000,
    }
  );

  const handleClickPayment = (itemId) => {
    setActivePaymentItem(itemId);
  };

  useEffect(() => {
    dispatch(getAddress());
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setInputs((prevInputs) => ({
      ...prevInputs,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const handleSelectProvince = useCallback((e) => {
    const selectedCity = e.target.value;
    setSelectedProvince(selectedCity);
    setInputs((prevInputs) => ({
      ...prevInputs,
      city: selectedCity,
    }));
  }, []);

  const handleSelectDistrict = useCallback((e) => {
    const selectedDistrictValue = e.target.value;
    setSelectedDistrict(selectedDistrictValue);
    setInputs((prevInputs) => ({
      ...prevInputs,
      district: selectedDistrictValue,
    }));
  }, []);

  const handleSelectCommune = useCallback((e) => {
    const selectedCommuneValue = e.target.value;
    setSelectedCommune(selectedCommuneValue);
    setInputs((prevInputs) => ({
      ...prevInputs,
      commune: selectedCommuneValue,
    }));
  }, []);

  useEffect(() => {
    setProvinces(huydev.provinces);
    setDistricts(huydev.districts);
    setWards(huydev.wards);
  }, []);

  const totalAmountAll = useMemo(
    () =>
      carts?.reduce(
        (total, cart) => total + cart.product.price_has_dropped * cart.quantity,
        0
      ),
    [carts]
  );

  const filteredDistricts = useMemo(
    () =>
      districts?.filter(
        (district) => district.province_id === Number(selectedProvince)
      ),
    [districts, selectedProvince]
  );

  const filteredWards = useMemo(
    () =>
      wards?.filter((ward) => ward.district_id === Number(selectedDistrict)),
    [wards, selectedDistrict]
  );

  const handleSubmitAddress = useCallback(
    async (e) => {
      e.preventDefault();

      const action = isEditAddress ? updateAddress : addAddress;
      const response = await dispatch(action(inputs));

      if (response.status === true) {
        setValidationErrors([]);
        setIsAddressPageOpen(false);
        createNotification("success", "topRight", response.message);
      } else {
        if (response.status === false) {
          setValidationErrors([]);
          createNotification("error", "topRight", response.message);
        }
        setValidationErrors(response.errors);
      }
    },
    [isEditAddress, inputs]
  );

  const products = useMemo(
    () =>
      carts?.map((cart) => ({
        color: cart.color,
        productID: cart.productID,
        quantity: cart.quantity,
      })),
    [carts]
  );

  const orderData = useMemo(
    () => ({
      code,
      totalPrice: totalAmountAll,
      paymentID: activePaymentItem,
      products,
      addressID: isAddressItem,
    }),
    [code, totalAmountAll, activePaymentItem, isAddressItem, products]
  );

  const handleSubmitOrder = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        dispatch(dataOrder(orderData));
        const paymentResponse = await dispatch(redirectPayment(orderData));
        if (paymentResponse && paymentResponse.paymentMethod === true) {
          history.push(paymentResponse.result);
        } else {
          navigate(paymentResponse.result);
        }
      } catch (error) {
        console.error("Error submitting order:", error);
      }
    },
    [orderData]
  );

  return (
    <Layout>
      <div className="w-full  pt-0 pb-0">
        <div className="checkout-page-wrapper w-full bg-white pb-[60px]">
          <div className="w-full mb-5">
            <div className="page-title-wrapper bg-[#D3EFFF] w-full h-[173px] py-10">
              <div className="max-w-6xl mx-auto">
                <div className="mb-5">
                  <div>
                    <div className="breadcrumb-wrapper font-400 text-[13px] text-black mb-[23px]">
                      <span>
                        <a href="/">
                          <span className="mx-1 capitalize">home</span>
                        </a>
                        <span className="sperator">/</span>
                      </span>
                      <span>
                        <a href="/checkout">
                          <span className="mx-1 capitalize">checkout</span>
                        </a>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <h1 className="text-3xl font-semibold text-black">
                    Checkout
                  </h1>
                </div>
              </div>
            </div>
          </div>
          <div className="checkout-main-content w-full">
            <div className="max-w-6xl mx-auto">
              <div className="w-full lg:flex lg:space-x-[30px] pt-4">
                <div className="lg:w-1/2 w-full">
                  <h1 className="sm:text-2xl text-xl text-black font-medium mb-5">
                    Billing Details
                  </h1>
                  <div className="w-full px-5 py-[30px] border border-[#EDEDED]">
                    <div className="border-none border-1 border-transparent opacity-100 rounded-8 bg-white relative">
                      <div>
                        <div className="border-none border-1 border-transparent opacity-100 relative h-full">
                          <div
                            type="line"
                            width={137}
                            height={40}
                            className=" relative flex items-stretch overflow-y-hidden w-full border-b-2 border-solid border-gray-300"
                          >
                            <div className="p-2 cursor-pointer flex justify-center items-center bg-white flex-row">
                              <div
                                type="subtitle"
                                color="primary500"
                                className=" border-none border-1 border-transparent opacity-100 text-blue-500 font-semibold leading-6 overflow-hidden"
                              >
                                Nhận hàng tại nhà
                              </div>
                              <div className="tab-checkout"></div>
                            </div>
                          </div>
                          <div className="border-none border-1 border-transparent opacity-100 p-4">
                            <div
                              type="subtitle"
                              className="m-0 p-0 pr-3 pb-3 border-none border-1 border-transparent opacity-100 text-inherit font-semibold leading-6 overflow-hidden transition-colors duration-300 ease-in-out"
                            >
                              Thông tin nhận hàng
                            </div>
                            <div className="flex flex-wrap mb-4">
                              {billings?.map((item, index) => (
                                <div
                                  key={index}
                                  className="w-full md:w-1/2 mb-4 gap-5"
                                  style={{ paddingLeft: 0, paddingRight: 8 }}
                                >
                                  <div
                                    onClick={() =>
                                      handleActionAddress(item._id)
                                    }
                                    className={`inline-block border ${
                                      isAddressItem === item._id
                                        ? "border-blue-500"
                                        : "border-[rgb(224, 224, 224)]"
                                    } bg-white p-2.5 rounded-md relative overflow-hidden cursor-pointer w-full`}
                                    style={{ height: "100%" }}
                                  >
                                    <div>
                                      <span
                                        style={{
                                          fontWeight: "bold",
                                          marginRight: 2,
                                        }}
                                      >
                                        {item.name}
                                      </span>
                                      <div
                                        className="inline-block"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditModalAddress(item);
                                        }}
                                      >
                                        <svg
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          size={20}
                                          className="fill-current text-gray-500"
                                          color="#848788"
                                          height={20}
                                          width={20}
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            clipRule="evenodd"
                                            d="M14.4798 5.35373C14.968 4.86557 15.7594 4.86557 16.2476 5.35373L16.6919 5.79803C17.1801 6.28618 17.1801 7.07764 16.6919 7.56579L16.1819 8.07582L13.9698 5.86375L14.4798 5.35373ZM12.9092 6.92441L6.23644 13.5971L5.68342 16.3622L8.44851 15.8092L15.1212 9.13648L12.9092 6.92441ZM16.707 9.67199L9.3486 17.0304C9.24389 17.1351 9.11055 17.2065 8.96535 17.2355L4.87444 18.0537C4.62855 18.1029 4.37434 18.0259 4.19703 17.8486C4.01971 17.6713 3.94274 17.4171 3.99192 17.1712L4.8101 13.0803C4.83914 12.9351 4.91051 12.8017 5.01521 12.697L13.4192 4.29307C14.4931 3.21912 16.2343 3.21912 17.3083 4.29307L17.7526 4.73737C18.8265 5.81131 18.8265 7.55251 17.7526 8.62645L16.7174 9.66162C16.7157 9.66336 16.714 9.6651 16.7122 9.66683C16.7105 9.66856 16.7088 9.67028 16.707 9.67199ZM3.15918 20.5908C3.15918 20.1766 3.49497 19.8408 3.90918 19.8408H20.2728C20.687 19.8408 21.0228 20.1766 21.0228 20.5908C21.0228 21.005 20.687 21.3408 20.2728 21.3408H3.90918C3.49497 21.3408 3.15918 21.005 3.15918 20.5908Z"
                                            fill="#82869E"
                                          />
                                        </svg>
                                      </div>
                                    </div>
                                    <div>{item.phone}</div>
                                    <div
                                      className="text-[13px]"
                                      style={{
                                        WebkitLineClamp: 2,
                                        overflow: "hidden",
                                        display: "-webkit-box",
                                      }}
                                    >
                                      {item.address},{" "}
                                      {
                                        wards.find(
                                          (commune) =>
                                            commune.id === Number(item.commune)
                                        )?.name
                                      }
                                      ,{" "}
                                      {
                                        districts.find(
                                          (district) =>
                                            district.id ===
                                            Number(item.district)
                                        )?.name
                                      }
                                      ,{" "}
                                      {
                                        provinces.find(
                                          (city) =>
                                            city.id === Number(item.city)
                                        )?.name
                                      }
                                    </div>
                                    {isAddressItem === item._id && (
                                      <React.Fragment>
                                        <div
                                          className="absolute top-0 right-0 w-0 h-0 border border-solid transform rotate-180"
                                          style={{
                                            borderColor:
                                              "transparent transparent rgb(20, 53, 195) transparent",
                                            borderWidth: "0 36px 36px 0",
                                          }}
                                        ></div>

                                        <span className="flex absolute top-0 right-0 z-0">
                                          <svg
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            size={20}
                                            className="stroke-white"
                                            color="#ffffff"
                                            height={20}
                                            width={20}
                                            xmlns="http://www.w3.org/2000/svg"
                                          >
                                            <path
                                              d="M5 12.4545L9.375 17L19 7"
                                              stroke="#82869E"
                                              strokeWidth="1.5"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            />
                                          </svg>
                                        </span>
                                      </React.Fragment>
                                    )}
                                  </div>
                                </div>
                              ))}

                              <div
                                className="w-full md:w-1/2 mb-4"
                                ref={modalAddressRef}
                                style={{ paddingLeft: 0, paddingRight: 8 }}
                                onClick={() => setIsAddressPageOpen(true)}
                              >
                                <button
                                  height="2.5rem"
                                  className="opacity-100 rounded-md bg-transparent border border-solid border-gray-300 relative flex items-center justify-center outline-none min-w-10 w-full cursor-pointer transition duration-80 hover:bg-gray-100"
                                  type="button"
                                  style={{
                                    color: "rgb(132, 135, 136)",
                                    minHeight: 100,
                                    flexDirection: "column",
                                    height: "100%",
                                  }}
                                >
                                  <svg
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    size={25}
                                    className="css-1e44j4b"
                                    color="#848788"
                                    height={25}
                                    width={25}
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      clipRule="evenodd"
                                      d="M12.75 4C12.75 3.58579 12.4142 3.25 12 3.25C11.5858 3.25 11.25 3.58579 11.25 4V11.25H4C3.58579 11.25 3.25 11.5858 3.25 12C3.25 12.4142 3.58579 12.75 4 12.75H11.25V20C11.25 20.4142 11.5858 20.75 12 20.75C12.4142 20.75 12.75 20.4142 12.75 20V12.75H20C20.4142 12.75 20.75 12.4142 20.75 12C20.75 11.5858 20.4142 11.25 20 11.25H12.75V4Z"
                                      fill="#82869E"
                                    />
                                  </svg>
                                  Thêm địa chỉ
                                  <span style={{ marginLeft: 0 }}>
                                    <div className="css-157jl91" />
                                  </span>
                                </button>
                              </div>
                            </div>

                            <Modal
                              title={`${
                                isEditAddress
                                  ? "Cập nhật thông tin nhận hàng"
                                  : "Thông tin người nhận hàng"
                              }`}
                              onClickStopModal={(e) => e.stopPropagation()}
                              isOpen={isAddressPageOpen}
                              onClose={handleCloseModalAddress}
                            >
                              <form onSubmit={handleSubmitAddress}>
                                <div className="px-4">
                                  <div className="justify-between flex flex-wrap opacity-1">
                                    <div
                                      className="relative max-w-full min-h-[1px] opacity-1"
                                      style={{ flex: "0 0 49%" }}
                                    >
                                      <div className="text-left relative max-w-full min-h-[1px] opacity-1">
                                        <label
                                          htmlFor="name"
                                          className="mr-[8px] inline-flex items-center form-item-required"
                                          style={{ height: 40 }}
                                        >
                                          <div
                                            type="body"
                                            color="textTitle"
                                            className="m-0 p-0 opacity-1 font-[500] leading-[20px] overflow-hidden"
                                            style={{
                                              color: "rgb(27, 29, 41)",
                                            }}
                                          >
                                            Họ tên
                                          </div>
                                        </label>
                                      </div>
                                      <div className="flex flex-col justify-center relative max-w-full min-h-[1px]">
                                        <div className="flex items-center">
                                          <div
                                            className="max-w-full"
                                            style={{ flex: "1 1 auto" }}
                                          >
                                            <div className="opacity-1">
                                              <div
                                                className="form-input"
                                                height={40}
                                              >
                                                <input
                                                  id="name"
                                                  type="text"
                                                  name="name"
                                                  placeholder="Vui lòng nhập tên người nhận"
                                                  maxLength={255}
                                                  className="outline-none"
                                                  onChange={handleInputChange}
                                                  value={inputs.name}
                                                />
                                              </div>
                                              {validationErrors &&
                                                validationErrors.name && (
                                                  <div className="form-input-error">
                                                    {validationErrors.name.msg}
                                                  </div>
                                                )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                      className="relative max-w-full min-h-[1px] opacity-1"
                                      style={{ flex: "0 0 49%" }}
                                    >
                                      <div className="flex-col justify-center flex flex-wrap mb-[16px]">
                                        <div className="text-left relative max-w-full min-h-[1px] opacity-1">
                                          <label
                                            htmlFor="telephone"
                                            className="form-item-required mr-[8px] inline-flex items-center"
                                            style={{ height: 40 }}
                                          >
                                            <div
                                              className="m-0 p-0 opacity-1 font-[500] leading-[20px] overflow-hidden"
                                              style={{
                                                color: "rgb(27, 29, 41)",
                                              }}
                                            >
                                              Số điện thoại
                                            </div>
                                          </label>
                                        </div>
                                        <div className="flex flex-col justify-center relative max-w-full min-h-[1px]">
                                          <div className="flex items-center">
                                            <div
                                              className="max-w-full"
                                              style={{ flex: "1 1 auto" }}
                                            >
                                              <div className="opacity-1">
                                                <div
                                                  className="form-input"
                                                  height={40}
                                                >
                                                  <input
                                                    id="telephone"
                                                    type="text"
                                                    name="phone"
                                                    placeholder="Nhập số điện thoại"
                                                    maxLength={255}
                                                    className="outline-none"
                                                    onChange={handleInputChange}
                                                    value={inputs.phone}
                                                  />
                                                </div>
                                                {validationErrors &&
                                                  validationErrors.phone && (
                                                    <div className="form-input-error">
                                                      {
                                                        validationErrors.phone
                                                          .msg
                                                      }
                                                    </div>
                                                  )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="hr-checkout">
                                    <div
                                      width="100%"
                                      color="divider"
                                      className="css-yae08c"
                                    />
                                  </div>
                                  <div type="title" className="title-checkout">
                                    Địa chỉ nhận hàng
                                  </div>
                                  <div className="justify-between flex flex-wrap opacity-1">
                                    <div
                                      className="relative max-w-full min-h-[1px] opacity-1"
                                      style={{ flex: "0 0 49%" }}
                                    >
                                      <div className="flex-col justify-center flex flex-wrap mb-[16px]">
                                        <div className="text-left relative max-w-full min-h-[1px] opacity-1">
                                          <label
                                            htmlFor="provinceCode"
                                            className="form-item-required mr-[8px] inline-flex items-center"
                                            style={{ height: 40 }}
                                          >
                                            <div
                                              className="m-0 p-0 opacity-1 font-[500] leading-[20px] overflow-hidden"
                                              style={{
                                                color: "rgb(27, 29, 41)",
                                              }}
                                            >
                                              Tỉnh/Thành phố
                                            </div>
                                          </label>
                                        </div>

                                        <div className="flex flex-col justify-center relative max-w-full min-h-[1px]">
                                          <div className="flex items-center">
                                            <div
                                              className="max-w-full"
                                              style={{ flex: "1 1 auto" }}
                                            >
                                              <div className="opacity-1">
                                                <div className="relative">
                                                  <select
                                                    className="bg-white form-input text-[14px] w-full h-[2.5rem] pl-2 overflow-hidden cursor-pointer select-none outline-none rounded-[0.25rem] flex items-center"
                                                    style={{
                                                      border:
                                                        "1px solid rgb(228, 229, 240)",
                                                    }}
                                                    name="city"
                                                    onChange={
                                                      handleSelectProvince
                                                    }
                                                    value={selectedProvince}
                                                  >
                                                    <option value="">
                                                      Chọn Tỉnh / TP
                                                    </option>
                                                    {provinces?.map(
                                                      (province) => (
                                                        <option
                                                          key={province.id}
                                                          value={province.id}
                                                        >
                                                          {province.name}
                                                        </option>
                                                      )
                                                    )}
                                                  </select>
                                                  {validationErrors &&
                                                    validationErrors.city && (
                                                      <div className="form-input-error">
                                                        {
                                                          validationErrors.city
                                                            .msg
                                                        }
                                                      </div>
                                                    )}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                      className="relative max-w-full min-h-[1px] opacity-1"
                                      style={{ flex: "0 0 49%" }}
                                    >
                                      <div className="flex-col justify-center flex flex-wrap mb-[16px]">
                                        <div className="text-left relative max-w-full min-h-[1px] opacity-1">
                                          <label
                                            htmlFor="districtCode"
                                            className="form-item-required mr-[8px] inline-flex items-center"
                                            style={{ height: 40 }}
                                          >
                                            <div
                                              style={{
                                                color: "rgb(27, 29, 41)",
                                              }}
                                              className="m-0 p-0 opacity-1 font-[500] leading-[20px] overflow-hidden"
                                            >
                                              Quận/Huyện
                                            </div>
                                          </label>
                                        </div>
                                        <div className="flex flex-col justify-center relative max-w-full min-h-[1px]">
                                          <div className="flex items-center">
                                            <div
                                              className="max-w-full"
                                              style={{ flex: "1 1 auto" }}
                                            >
                                              <div className="opacity-1">
                                                <div className="relative">
                                                  <select
                                                    className="bg-white form-input text-[14px] w-full h-[2.5rem] pl-2 overflow-hidden cursor-pointer select-none outline-none rounded-[0.25rem] flex items-center"
                                                    style={{
                                                      border:
                                                        "1px solid rgb(228, 229, 240)",
                                                    }}
                                                    name="district"
                                                    value={selectedDistrict}
                                                    onChange={
                                                      handleSelectDistrict
                                                    }
                                                    disabled={!selectedProvince}
                                                    placeholder={`Chọn Quận / Huyện ${selectedDistrict}`}
                                                  >
                                                    <option value="">
                                                      Chọn Quận / Huyện
                                                    </option>
                                                    {filteredDistricts?.map(
                                                      (district) => (
                                                        <option
                                                          key={district.id}
                                                          value={district.id}
                                                        >
                                                          {district.name}
                                                        </option>
                                                      )
                                                    )}
                                                  </select>
                                                  {validationErrors &&
                                                    validationErrors.district && (
                                                      <div className="form-input-error">
                                                        {
                                                          validationErrors
                                                            .district.msg
                                                        }
                                                      </div>
                                                    )}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="justify-between flex flex-wrap opacity-1">
                                    <div
                                      className="relative max-w-full min-h-[1px] opacity-1"
                                      style={{ flex: "0 0 49%" }}
                                    >
                                      <div className="flex-col justify-center flex flex-wrap mb-[16px]">
                                        <div className="text-left relative max-w-full min-h-[1px] opacity-1">
                                          <label
                                            htmlFor="wardCode"
                                            className="form-item-required mr-[8px] inline-flex items-center"
                                            style={{ height: 40 }}
                                          >
                                            <div
                                              style={{
                                                color: "rgb(27, 29, 41)",
                                              }}
                                              className="m-0 p-0 opacity-1 font-[500] leading-[20px] overflow-hidden"
                                            >
                                              Phường/Xã
                                            </div>
                                          </label>
                                        </div>
                                        <div className="flex flex-col justify-center relative max-w-full min-h-[1px]">
                                          <div className="flex items-center">
                                            <div
                                              className="max-w-full"
                                              style={{ flex: "1 1 auto" }}
                                            >
                                              <div className="opacity-1">
                                                <div className="relative">
                                                  <select
                                                    className="bg-white form-input w-full text-[14px] h-[2.5rem] pl-2 overflow-hidden cursor-pointer select-none outline-none rounded-[0.25rem] flex items-center"
                                                    style={{
                                                      border:
                                                        "1px solid rgb(228, 229, 240)",
                                                    }}
                                                    name="commune"
                                                    value={selectedCommune}
                                                    onChange={
                                                      handleSelectCommune
                                                    }
                                                    disabled={!selectedDistrict}
                                                    placeholder="Chọn Phường / Xã"
                                                  >
                                                    <option value="">
                                                      Chọn Phường / Xã
                                                    </option>
                                                    {filteredWards?.map(
                                                      (ward) => (
                                                        <option
                                                          key={ward.id}
                                                          value={ward.id}
                                                        >
                                                          {ward.name}
                                                        </option>
                                                      )
                                                    )}
                                                  </select>
                                                  {validationErrors &&
                                                    validationErrors.commune && (
                                                      <div className="form-input-error">
                                                        {
                                                          validationErrors
                                                            .commune.msg
                                                        }
                                                      </div>
                                                    )}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                      className="relative max-w-full min-h-[1px] opacity-1"
                                      style={{ flex: "0 0 49%" }}
                                    >
                                      <div className="flex-col justify-center flex flex-wrap mb-[16px]">
                                        <div className="text-left relative max-w-full min-h-[1px] opacity-1">
                                          <label
                                            htmlFor="address"
                                            className="form-item-required mr-[8px] inline-flex items-center"
                                            style={{ height: 40 }}
                                          >
                                            <div
                                              style={{
                                                color: "rgb(27, 29, 41)",
                                              }}
                                              className="m-0 p-0 opacity-1 font-[500] leading-[20px] overflow-hidden"
                                            >
                                              Địa chỉ cụ thể
                                            </div>
                                          </label>
                                        </div>
                                        <div className="flex flex-col justify-center relative max-w-full min-h-[1px]">
                                          <div className="flex items-center">
                                            <div
                                              className="max-w-full"
                                              style={{ flex: "1 1 auto" }}
                                            >
                                              <div className="opacity-1">
                                                <div
                                                  className="form-input"
                                                  height={40}
                                                >
                                                  <input
                                                    name="address"
                                                    onChange={handleInputChange}
                                                    value={inputs.address}
                                                    type="text"
                                                    placeholder="Số nhà, ngõ, tên đường..."
                                                    maxLength={255}
                                                    className="outline-none"
                                                  />
                                                </div>
                                                {validationErrors &&
                                                  validationErrors.address && (
                                                    <div className="form-input-error">
                                                      {
                                                        validationErrors.address
                                                          .msg
                                                      }
                                                    </div>
                                                  )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap justify-end opacity-1">
                                    <div className="flex flex-wrap flex-col opacity-1 mb-[16px]">
                                      <div className="flex items-center flex-col justify-center relative max-w-full min-h-[1px] opacity-1">
                                        <div
                                          className="max-w-full"
                                          style={{
                                            flex: "1 1 auto",
                                          }}
                                        >
                                          <input
                                            id="default-checkbox"
                                            type="checkbox"
                                            name="default"
                                            onChange={handleInputChange}
                                            checked={inputs.default}
                                            className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600  "
                                          />
                                          <label
                                            htmlFor="default-checkbox"
                                            className="ms-1 text-[13px] font-medium text-gray-900 dark:text-gray-300"
                                          >
                                            Đặt mặc định
                                          </label>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center px-4 py-2 justify-end space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
                                  <button
                                    type="submit"
                                    className=" text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                                  >
                                    {isEditAddress ? "Update" : "Add"}
                                  </button>
                                  <button
                                    onClick={handleCloseModalAddress}
                                    type="button"
                                    className=" text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                                  >
                                    Close
                                  </button>
                                </div>
                              </form>
                            </Modal>
                            <div
                              type="subtitle"
                              className="text-base font-medium leading-6 p-0.75 border-none border-t border-r border-b border-l  border-gray-300 opacity-100 overflow-hidden transition-colors duration-300"
                            >
                              Phương thức giao hàng
                            </div>
                            <div className="border-gray-300 opacity-100">
                              <div className="block mb-2 mr-0">
                                <div className="flex items-center cursor-pointer mt-2">
                                  <div className="inline-block relative w-4 min-w-6 h-6  ">
                                    <input
                                      type="radio"
                                      checked
                                      className="absolute z-1 w-full h-full cursor-pointer"
                                    />
                                  </div>

                                  <div
                                    className="flex border-none border-t border-r border-b border-l border-transparent opacity-100 ml-1"
                                    style={{ width: "100%" }}
                                  >
                                    <div className="flex-grow">
                                      <div
                                        type="body"
                                        color="textPrimary"
                                        className="opacity-100 text-gray-700 font-medium text-base leading-5 overflow-hidden line-clamp-none max-w-none min-w-none transition-colors duration-300"
                                      >
                                        Phí giao tiêu chuẩn
                                      </div>
                                    </div>
                                    <div
                                      className="teko-col teko-col-3 flex-grow"
                                      style={{ textAlign: "right" }}
                                    >
                                      <div
                                        type="body"
                                        color="success500"
                                        className=" border-solid border-transparent border-1 opacity-100 text-blue-600 font-medium text-base leading-5 overflow-hidden line-clamp-none max-w-none min-w-none transition-colors duration-300"
                                      >
                                        Miễn phí
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div
                              type="subtitle"
                              className="border-none opacity-100 font-medium text-base leading-6 overflow-hidden max-w-none min-w-none transition-colors duration-300"
                            >
                              Nhận Mã online, hóa đơn qua email
                            </div>
                            <div className="border-1 border-solid border-transparent opacity-100 bg-white pt-3">
                              <div className=" border-1 border-solid border-transparent opacity-100 pb-3 ">
                                <div
                                  className=" border-gray-200 rounded-md opacity-100 h-10 px-3 flex items-center bg-gray-50 overflow-hidden "
                                  height={40}
                                  disabled
                                >
                                  <input
                                    type="text"
                                    placeholder="Nhập email nhận thông tin"
                                    maxLength={255}
                                    disabled
                                    style={{
                                      color: "rgb(67, 70, 87)",
                                      flex: "1 1 0%",
                                    }}
                                    className="text-[13px] border-none"
                                    defaultValue={user?.email}
                                  />
                                  <div
                                    height={40}
                                    className="border-none border-1 border-transparent opacity-100 h-10 ml-50 flex items-center"
                                  >
                                    <svg
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      cursor="pointer"
                                      size={20}
                                      className="css-9w5ue6"
                                      height={20}
                                      width={20}
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
                                        fill="#DFDFE6"
                                      />
                                      <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M9.90045 8.64594C9.60755 8.35305 9.13268 8.35305 8.83979 8.64594C8.54689 8.93883 8.54689 9.41371 8.83979 9.7066L11.0765 11.9433L8.83997 14.1798C8.54707 14.4727 8.54707 14.9476 8.83997 15.2405C9.13286 15.5334 9.60773 15.5334 9.90063 15.2405L12.1371 13.004L14.3737 15.2405C14.6666 15.5334 15.1414 15.5334 15.4343 15.2405C15.7272 14.9476 15.7272 14.4727 15.4343 14.1798L13.1978 11.9433L15.4345 9.7066C15.7274 9.41371 15.7274 8.93883 15.4345 8.64594C15.1416 8.35305 14.6667 8.35305 14.3738 8.64594L12.1371 10.8826L9.90045 8.64594Z"
                                        fill="white"
                                      />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="sm:text-2xl text-xl text-black font-medium mb-5">
                    Thông tin đơn hàng
                  </h1>
                  <form
                    onSubmit={handleSubmitOrder}
                    className="w-full px-10 py-[30px] border border-[#EDEDED]"
                  >
                    <div className="sub-total mb-6">
                      <div className=" flex justify-between mb-5">
                        <p className="text-[13px] font-medium text-black uppercase">
                          Sản phẩm
                        </p>
                        <p className="text-[13px] font-medium text-black uppercase">
                          Tổng
                        </p>
                      </div>
                      <div className="w-full h-[1px] bg-[#EDEDED]" />
                    </div>
                    <div className="product-list w-full mb-[30px]">
                      <ul className="flex flex-col space-y-5">
                        {carts?.map((item, index) => (
                          <li key={index}>
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="text-[15px] text-black mb-2.5">
                                  {item.product.nameProduct}
                                  <sup className="text-[13px] text-gray-500 ml-2 mt-2">
                                    x{item.quantity}
                                  </sup>
                                </h4>
                                <p className="text-[13px] text-gray-500 capitalize">
                                  {item.color}
                                </p>
                              </div>
                              <div>
                                <span className="text-[15px] text-black font-medium">
                                  {formatPrice(
                                    item.product.price_has_dropped *
                                      item.quantity
                                  )}
                                </span>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="w-full h-[1px] bg-[#EDEDED]" />
                    <div className="mt-[30px]">
                      <div className=" flex justify-between mb-5">
                        <p className="text-[13px] font-medium text-black uppercase">
                          Tổng tạm tính
                        </p>
                        <p className="text-[15px] font-medium text-black uppercase">
                          {formatPrice(totalAmountAll)}
                        </p>
                      </div>
                    </div>
                    <div className="w-full mt-[30px]">
                      <div className="sub-total mb-6">
                        <div className=" flex justify-between mb-5">
                          <div>
                            <span className="text-[16px] text-qgraytwo mb-3 block">
                              Phí vận chuyển
                            </span>
                          </div>
                          <p className="text-[15px] font-medium text-blue-700">
                            Miễn phí
                          </p>
                        </div>
                        <div className="w-full h-[1px] bg-[#EDEDED]" />
                      </div>
                    </div>
                    <div className="mt-[30px]">
                      <div className=" flex justify-between mb-5">
                        <p className="text-2xl font-medium text-black">
                          Thành tiền
                        </p>
                        <p className="text-2xl font-medium text-qred text-blue-800 text-bold">
                          {" "}
                          {formatPrice(totalAmountAll)}
                        </p>
                      </div>
                    </div>
                    <div className="shipping mt-[30px]">
                      {loadingPayment ? (
                        <Loading />
                      ) : (
                        <ul className="flex flex-col space-y-1 pb-5">
                          {isPayments?.map((item, index) => (
                            <li className="pb-2" key={index}>
                              <div className="flex space-x-2.5 items-center">
                                <div className="input-radio">
                                  <input
                                    type="radio"
                                    className="accent-pink-500"
                                    checked={activePaymentItem === item._id}
                                    onClick={() => handleClickPayment(item._id)}
                                    id={item._id}
                                  />
                                </div>
                                <label
                                  htmlFor={item._id}
                                  className="text-[17px] text-normal text-black"
                                >
                                  {item.namePayment}
                                </label>
                              </div>

                              <p className="text-gray-500 text-[15px] ml-6">
                                {item.descriptionPayment}
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full h-[50px] bg-blue-700 text-white flex justify-center items-center rounded-lg"
                    >
                      <span className="text-sm font-semibold">
                        Place Order Now
                      </span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
