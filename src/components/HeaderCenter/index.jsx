import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { URL_CONSTANTS } from "../../constants/url.constants";
import { AppContext } from "../../contexts/AppContextProvider";
import { formatPrice } from "../../utils/fomatPrice";
import { deleteToCartItem } from "../../stores/cart/actions";
import { useDispatch, useSelector } from "react-redux";
import { v4 as uuidv4 } from "uuid";
import Reponsive from "../Reponsive";
import { categoryService } from "../../services/category.service";
import "./index.css";
import { useQuery } from "@tanstack/react-query";
import { history } from "../../helpers/history";
import {
  deleteAllHistorySearch,
  getHistorySearch,
  postHistorySearch,
  valueSearch,
} from "../../stores/search/actions";
import { useDebounce } from "../../hooks/useDebounce";

export default function HeaderCenter() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { carts } = useContext(AppContext);
  const { search, historySearch, loading } = useSelector(
    (state) => state.filter
  );

  const totalAmountAll = carts?.reduce(
    (total, item) => total + item?.product.price_has_dropped * item.quantity,
    0
  );
  const handleDeleteItem = async (item) => {
    const response = await dispatch(deleteToCartItem(item));
    // console.log(response);
  };
  const [isSearchBoard, setIsSearchBoard] = useState(false);
  const [isNotification, setNotification] = useState(false);
  const [isOpenSidebar, setIsOpenSidebar] = useState(false);
  const searchBoardRef = useRef();
  const notificationRef = useRef();
  const sidebarRef = useRef();
  const handleSearchBoard = () => {
    setIsSearchBoard(true);
  };
  const handleNotification = () => {
    setNotification(!isNotification);
  };
  useEffect(() => {
    dispatch(getHistorySearch());
  }, [isSearchBoard]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchBoardRef.current &&
        !searchBoardRef.current.contains(event.target)
      ) {
        setIsSearchBoard(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotification(false);
      }
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpenSidebar(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const { data: isCategories, isloading: loadingCategory } = useQuery(
    ["categories"],
    () => categoryService.fetchAllCategories(),
    {
      retry: 3,
      retryDelay: 1000,
    }
  );

  const [searchTerm, setSearchTerm] = useState();
  const debouncedValue = useDebounce(searchTerm, 400);
  const refSearch = useRef();

  useEffect(() => {
    if (refSearch.current) {
      if (debouncedValue !== null && debouncedValue !== undefined) {
        dispatch(valueSearch(debouncedValue));
      }
    }
    refSearch.current = true;
  }, [debouncedValue, dispatch, searchTerm]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };
  const handleSearchQuery = useCallback(() => {
    if (searchTerm) { // Check if searchTerm is not empty or falsy
      dispatch(postHistorySearch(searchTerm));
      dispatch(getHistorySearch());
      navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
    } else {
      console.log('Search term is empty or falsy. Not sending the request.');
    }
  }, [dispatch, history, searchTerm]);
  
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearchQuery();
    }
  };


  

  const handleDeleteHistory = useCallback(() => {
    dispatch(deleteAllHistorySearch());
  }, []);

  return (
    <React.Fragment>
      <div className="w-full h-[86px] bg-white quomodo-shop-middle-bar lg:block hidden">
        <div className="max-w-6xl mx-auto h-full">
          <div className="relative h-full">
            <div className="flex justify-between items-center h-full">
              <Link to={URL_CONSTANTS.HOME} className="cursor-pointer">
                <img
                  className="mt-2"
                  width={152}
                  height={36}
                  src="https://i.imgur.com/ZEyJnBt.png"
                  alt="logo"
                />
              </Link>
              <div
                className="relative opacity-1 max-h-full min-h-[1px]"
                style={{
                  paddingLeft: 8,
                  paddingRight: 8,
                }}
              >
                <div className="relative w-[517px] h-[44px]">
                  <div
                    className="flex bg-[#F5F5F5] border border-solid border-[#eaeaea] rounded-[8px]"
                    onClick={handleSearchBoard}
                    ref={searchBoardRef}
                  >
                    <div className="inline-block w-full">
                      <input
                        onChange={handleSearch}
                        onKeyPress={handleKeyPress}
                        className="block bg-[#F5F5F5] text-[14px] outline-none w-full py-[0.375rem] px-[0.75rem] min-h-[16px] h-full"
                        placeholder="Nhập từ khoá cần tìm"
                      />
                    </div>
                    <div className="inline-block">
                      <button
                        className="search-icon"
                        onClick={handleSearchQuery}
                      >
                        <span
                          size={26}
                          color="#616161"
                          className="icon-search"
                        />
                      </button>
                    </div>
                  </div>
                  <div
                    className={`${
                      isSearchBoard ? "block" : "hidden"
                    } absolute bg-white rounded-[8px] py-[0.5rem] px-[0.8rem] z-[1000] w-full`}
                    style={{
                      boxShadow: "0 4px 6px 0 rgba(0, 0, 0, 0.1)",
                    }}
                    onClick={(event) => event.stopPropagation()}
                  >
                    {historySearch?.length > 0 && (
                      <React.Fragment>
                        <div className="flex justify-between items-center my-[4px]">
                          <div
                            fontWeight={500}
                            color="#82869E"
                            style={{
                              color: "rgb(130, 134, 158)",
                            }}
                            className="font-[500] text-[14px] text-left overflow-hidden uppercase"
                          >
                            Lịch sử tìm kiếm
                          </div>
                          <div
                            onClick={handleDeleteHistory}
                            style={{
                              color: "rgb(132, 135, 136)",
                            }}
                            className="cursor-pointer"
                          >
                            Xóa lịch sử
                          </div>
                        </div>
                        {historySearch?.map((item, index) => (
                          <Link
                            to={`/search?query=${encodeURIComponent(
                              item.nameSearch
                            )}`}
                            key={index}
                            className="flex p-[0.5rem] cursor-pointer rounded-[8px] items-center mb-2"
                            style={{
                              background: "rgb(245, 245, 245)",
                            }}
                          >
                            <span
                              size={20}
                              className="history-search inline-block bg-[#757575]"
                            />

                            <div style={{ margin: "0px 0.6rem" }}>
                              <div className="css-1488rru">
                                {item.nameSearch}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </React.Fragment>
                    )}

                    {search?.length > 0 &&
                      search?.map((item, index) => (
                        <Link
                          to={`/product/${item.slugProduct}`}
                          key={index}
                          className="flex p-[0.5rem] cursor-pointer rounded-[8px] items-center mb-2"
                          style={{
                            background: "rgb(245, 245, 245)",
                          }}
                        >
                          <svg
                            fill="none"
                            viewBox="0 0 24 24"
                            size={20}
                            className="css-9w5ue6"
                            height={20}
                            width={20}
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M5.5 10.5508C5.5 7.7613 7.7613 5.5 10.5507 5.5C13.3402 5.5 15.6015 7.7613 15.6015 10.5508C15.6015 11.9258 15.052 13.1725 14.1607 14.0832C14.147 14.0951 14.1336 14.1076 14.1206 14.1206C14.1075 14.1336 14.0951 14.147 14.0832 14.1607C13.1724 15.0521 11.9258 15.6015 10.5507 15.6015C7.7613 15.6015 5.5 13.3402 5.5 10.5508ZM14.6222 15.6829C13.5042 16.571 12.0894 17.1015 10.5507 17.1015C6.93286 17.1015 4 14.1686 4 10.5508C4 6.93288 6.93286 4 10.5507 4C14.1686 4 17.1015 6.93288 17.1015 10.5508C17.1015 12.0895 16.571 13.5043 15.6829 14.6222L19.7812 18.7206C20.0741 19.0135 20.0741 19.4884 19.7812 19.7813C19.4883 20.0741 19.0134 20.0741 18.7205 19.7813L14.6222 15.6829Z"
                              fill="#82869E"
                            />
                          </svg>

                          <div style={{ margin: "0px 0.6rem" }}>
                            <div className="css-1488rru">
                              {item.nameProduct}
                            </div>
                          </div>
                        </Link>
                      ))}
                    {search?.length === 0 && (
                      <div
                        style={{
                          margin: "8px 0px 4px",
                        }}
                      >
                        <div className="flex justify-between items-center my-[4px]">
                          <div
                            fontWeight={500}
                            color="#82869E"
                            style={{
                              color: "rgb(130, 134, 158)",
                            }}
                            className="font-[500] text-[14px] text-left overflow-hidden uppercase"
                          >
                            Từ khóa phổ biến
                          </div>
                        </div>
                        <div
                          className="flex pt-[4px] flex-wrap"
                          style={{
                            background: "rgb(255, 255, 255)",
                          }}
                        >
                          {isCategories
                            ?.filter(
                              (item) =>
                                item.outstandingCategory === "outstanding"
                            )
                            .map((item, index) => (
                              <Link
                                to={`/filter/${item.slugCategory}`}
                                key={index}
                                className="h-[32px] leading-[32px] px-[16px] rounded-[999px] text-[14px] cursor-pointer"
                                style={{
                                  background: "rgb(245, 245, 245)",
                                  color: "rgb(51, 51, 51)",
                                  margin: "0px 4px 10px",
                                }}
                              >
                                {item.nameCategory}
                              </Link>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 items-center">
                <div className="relative flex">
                  <div
                    className="box-icon rounded-[8px]"
                    ref={notificationRef}
                    onClick={handleNotification}
                  >
                    <img
                      src="https://shopjk.net/assets/frontend/theme_5/image/nam/ring.svg"
                      alt
                    />
                    <p id="num-notification" className="">
                      0
                    </p>
                  </div>
                  <div
                    onClick={(event) => event.stopPropagation()}
                    className="bg-white w-[336px] top-[60px] right-0 z-[100] absolute notify_menu rounded-[12px]"
                    style={
                      isNotification
                        ? {
                            display: "block",
                            boxShadow: "0px 1px 4px 0px #00000033",
                          }
                        : {
                            display: "none",
                            boxShadow: "0px 1px 4px 0px #00000033",
                          }
                    }
                  >
                    <div
                      className="bg-[#f3f3f7] flex justify-between p-[16px]"
                      style={{
                        borderRadius: "12px 12px 0 0",
                      }}
                    >
                      <div className="font-[700] text-[20px] leading-[28px] text-black">
                        Thông báo
                      </div>
                      <img
                        onClick={() => setNotification(false)}
                        src="https://shopjk.net/assets/frontend/theme_5/image/nam/profile_close.svg"
                        alt
                        className="cursor-pointer mr-[12px]"
                      />
                    </div>
                    <div className="max-w-full pb-[4px] mt-[8px] mx-[14px]">
                      <a
                        className="bg-white inline-flex rounded-[24px] cursor-pointer text-[13px] leading-[20px] border border-solid border-[#0e3eda] text-[#0e3eda] font-[500] bg-none ml-[4px]"
                        style={{
                          padding: "5px 20px 5px 20px",
                        }}
                      >
                        Hệ thống
                        <div className=" num-notification-inner num-notification-inner_1 ml-[4px]"></div>
                      </a>
                    </div>
                    <div className="max-h-[380px] pl-[16px] pr-[4px] mb-[12px] mt-[8px] mr-[4px]">
                      <div className="my-[16px] text-center">
                        {" "}
                        <img
                          className="inline"
                          src="https://shopjk.net/assets/frontend/theme_5/image/nam/notification_mailbox.png"
                          alt
                        />
                        <p className="font-[500] mt-[12px] text-[13px] leading-[20px] text-[#434657]">
                          Bạn chưa có thông báo nào
                        </p>
                      </div>
                    </div>
                    <div
                      className="px-[12px] pb-[12px] pt-[4px] text-center cursor-pointer"
                      style={{ display: "none" }}
                    >
                      <span className="text-color font-[500]">Xem thêm</span>
                      <img
                        src="https://shopjk.net/assets/frontend/theme_5/image/nam/notification_down.png"
                        alt
                      />
                    </div>
                  </div>
                  <div className="hidden bg-white">
                    <div className="hidden">
                      <a className="link-back close-step" />
                      <p className="text-black font-[500px] text-[12px] leading-[24px]">
                        Thông báo
                      </p>
                    </div>
                    <div className="max-w-full pb-[4px] ml-[14px] mr-[14px]">
                      <a
                        className="bg-white inline-flex rounded-[24px] cursor-pointer text-[13px] leading-[20px]  border border-solid border-[#0e3eda] text-[#0e3eda] font-[500] bg-none ml-[4px]"
                        data-id={1}
                        href="javascript:void(0)"
                      >
                        Hệ thống
                        <div className=" num-notification-inner num-notification-inner_1 c-ml-4"></div>
                      </a>
                    </div>

                    <div
                      className="notify-content_mobile px-[16px]"
                      id="result-notification_mobile"
                    ></div>

                    <div
                      className="px-[12px] pb-[12px] pt-[12px] text-center cursor-pointer"
                      style={{ display: "none" }}
                    >
                      <span className="text-black font-[500]">Xem thêm</span>
                      <img
                        src="https://shopjk.net/assets/frontend/theme_5/image/nam/notification_down.png"
                        alt
                      />
                    </div>
                  </div>
                </div>

                <div className="relative flex">
                  <div className="cursor-pointer box-icon rounded-[8px]">
                    <Link rel="noopener noreferrer" to={URL_CONSTANTS.CART}>
                      <svg
                        style={{
                          color: "#808080",
                        }}
                        width={20}
                        height={22}
                        viewBox="0 0 18 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M16.1568 5.1772C16.0284 4.84626 15.7343 4.81766 14.2887 4.81766H13.0875V4.2947C13.0875 3.48165 12.9716 2.91374 12.6899 2.32949C12.1804 1.2713 11.3272 0.531797 10.2213 0.188601C9.68279 0.0251747 8.87923 -0.0442816 8.39047 0.0292604C7.03602 0.241715 5.88039 1.09562 5.29223 2.31315C5.00642 2.90966 4.89045 3.48165 4.89045 4.2947V4.82175H3.68511C2.23954 4.82175 1.94546 4.85035 1.81705 5.19354C1.75078 5.41008 1.12948 10.0637 0.864385 12.0697C0.632431 13.8184 0.417045 15.469 0.259648 16.711C-0.0137267 18.8519 -0.00544266 18.8846 0.00284141 18.9214V18.9255C0.0401198 19.0644 0.408761 19.428 0.520596 19.5342L1.00521 20H16.9438L17.3041 19.6854C17.4657 19.5424 18 19.0562 18 18.8152C18 18.6517 16.1899 5.27117 16.1568 5.1772ZM16.6911 18.5046C16.687 18.5332 16.6538 18.619 16.5958 18.6803L16.513 18.7702H1.46498L1.2496 18.5414L2.09871 12.2863C2.39694 10.0596 2.66203 8.11888 2.81943 6.95855C2.88984 6.45193 2.92298 6.19453 2.93955 6.06788C3.49872 6.06379 5.94252 6.0597 8.98278 6.0597H15.0302L15.0384 6.10465C15.1047 6.4315 16.6621 18.141 16.6911 18.5046ZM6.1372 4.82175V4.35598C6.1372 4.04139 6.17862 3.6083 6.22418 3.40811C6.46856 2.38669 7.30111 1.5573 8.34076 1.29173C8.77568 1.1855 9.48811 1.22228 9.92303 1.37753H9.92717C10.3828 1.5287 10.7556 1.77384 11.0994 2.14972C11.6544 2.74623 11.8408 3.28145 11.8408 4.27018V4.82175H6.1372Z"
                          fill="rgb(73 73 73)"
                        />
                      </svg>
                      <p id="num-notification">
                        {carts?.length > 0 ? carts?.length : 0}
                      </p>
                    </Link>
                  </div>
                  <div
                    className="w-[300px] bg-white border-t-[3px] border-yellow-500  absolute -right-[45px] top-11 z-50 hidden group-hover:block"
                    style={{
                      boxShadow: "rgba(0, 0, 0, 0.14) 0px 15px 50px 0px",
                    }}
                  >
                    <div className="w-full h-full">
                      {carts?.length > 0 ? (
                        <React.Fragment>
                          <div className="product-items overflow-y-scroll">
                            <ul>
                              {carts?.map((item) => (
                                <li className="w-full h-full flex">
                                  <div className="flex space-x-[6px] justify-center items-center px-4 my-[20px]">
                                    <div className="w-[65px] h-full">
                                      <img
                                        src={item.product.image}
                                        alt={item.product.nameProduct}
                                        className="w-full h-full object-contain"
                                      />
                                    </div>
                                    <div className="flex-1 h-full flex flex-col justify-center ">
                                      <p className="title mb-2 text-[13px] font-600 text-black leading-4 line-clamp-2 hover:text-blue-600">
                                        {item.product.nameProduct}
                                      </p>
                                      <p className="price">
                                        <span className="offer-price text-red-500 font-600 text-[15px] ml-2">
                                          {formatPrice(
                                            item.product.price_has_dropped *
                                              item.quantity
                                          )}
                                        </span>
                                      </p>
                                    </div>
                                  </div>
                                  <span
                                    className="mt-[20px] mr-[15px] inline-flex cursor-pointer"
                                    onClick={() => handleDeleteItem(item._id)}
                                  >
                                    <svg
                                      width={8}
                                      height={8}
                                      viewBox="0 0 8 8"
                                      fill="none"
                                      className="inline fill-current text-[#AAAAAA] hover:text-qred"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path d="M7.76 0.24C7.44 -0.08 6.96 -0.08 6.64 0.24L4 2.88L1.36 0.24C1.04 -0.08 0.56 -0.08 0.24 0.24C-0.08 0.56 -0.08 1.04 0.24 1.36L2.88 4L0.24 6.64C-0.08 6.96 -0.08 7.44 0.24 7.76C0.56 8.08 1.04 8.08 1.36 7.76L4 5.12L6.64 7.76C6.96 8.08 7.44 8.08 7.76 7.76C8.08 7.44 8.08 6.96 7.76 6.64L5.12 4L7.76 1.36C8.08 1.04 8.08 0.56 7.76 0.24Z" />
                                    </svg>
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="w-full px-4 mt-[20px] mb-[12px]">
                            <div className="h-[1px] bg-[#F0F1F3]" />
                          </div>
                          <div className="product-actions px-4 mb-[30px]">
                            <div className="total-equation flex justify-between items-center mb-[28px]">
                              <span className="text-[15px] font-500 text-black">
                                Subtotal
                              </span>
                              <span className="text-[15px] font-500 text-red-500">
                                {formatPrice(totalAmountAll)}
                              </span>
                            </div>
                            <div className="product-action-btn">
                              <Link
                                to={URL_CONSTANTS.CART}
                                style={{
                                  backgroundColor: "#f0f1f3",
                                }}
                                className="flex items-center justify-center leading-3 font-bold  w-full h-[50px] mb-[10px] cursor-pointer"
                              >
                                <span>View Cart</span>
                              </Link>
                              <div className="w-full h-[50px] cursor-pointer">
                                <Link
                                  to={`/checkout/${uuidv4()}`}
                                  className="bg-yellow-400 flex h-full w-full opacity-1 leading-0 font-bold items-center justify-center"
                                >
                                  <span className="text-sm">Checkout Now</span>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      ) : (
                        <div className="p-4">
                          <div className="flex justify-center items-center">
                            <img
                              width={200}
                              src="https://i.imgur.com/7ebt4Bn.png"
                              alt="empty_cart"
                            />
                          </div>
                          <p className="text-sm flex justify-center items-center text-gray-400 pb-2">
                            Giỏ hàng chưa có sản phẩm nào
                          </p>
                          <Link
                            to={URL_CONSTANTS.HOME}
                            className="p-2 bg-yellow-400 items-center flex h-full w-full justify-center opacity-1 leaning-6"
                          >
                            Mua Sắm Ngay
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="relative flex">
                  <Link
                    to={URL_CONSTANTS.PROFILE}
                    className="box-icon rounded-[8px]"
                  >
                    <img
                      src="https://shopjk.net/assets/frontend/theme_5/image/nam/profile.svg"
                      alt
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* // Header Reponsive  */}

      <div className="lg:hidden block w-full h-[60px] bg-white">
        <div className="w-full h-full flex justify-between items-center px-5">
          <div
            ref={sidebarRef}
            onClick={() => setIsOpenSidebar(!isOpenSidebar)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </div>
          <div className="cursor-pointer">
            <img
              width={102}
              height={36}
              src="https://i.imgur.com/ZEyJnBt.png"
              alt="logo"
            />
          </div>
          <div className="cart relative cursor-pointer">
            <a rel="noopener noreferrer" href="/cart">
              <span>
                <svg
                  width={18}
                  height={20}
                  viewBox="0 0 18 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16.1568 5.1772C16.0284 4.84626 15.7343 4.81766 14.2887 4.81766H13.0875V4.2947C13.0875 3.48165 12.9716 2.91374 12.6899 2.32949C12.1804 1.2713 11.3272 0.531797 10.2213 0.188601C9.68279 0.0251747 8.87923 -0.0442816 8.39047 0.0292604C7.03602 0.241715 5.88039 1.09562 5.29223 2.31315C5.00642 2.90966 4.89045 3.48165 4.89045 4.2947V4.82175H3.68511C2.23954 4.82175 1.94546 4.85035 1.81705 5.19354C1.75078 5.41008 1.12948 10.0637 0.864385 12.0697C0.632431 13.8184 0.417045 15.469 0.259648 16.711C-0.0137267 18.8519 -0.00544266 18.8846 0.00284141 18.9214V18.9255C0.0401198 19.0644 0.408761 19.428 0.520596 19.5342L1.00521 20H16.9438L17.3041 19.6854C17.4657 19.5424 18 19.0562 18 18.8152C18 18.6517 16.1899 5.27117 16.1568 5.1772ZM16.6911 18.5046C16.687 18.5332 16.6538 18.619 16.5958 18.6803L16.513 18.7702H1.46498L1.2496 18.5414L2.09871 12.2863C2.39694 10.0596 2.66203 8.11888 2.81943 6.95855C2.88984 6.45193 2.92298 6.19453 2.93955 6.06788C3.49872 6.06379 5.94252 6.0597 8.98278 6.0597H15.0302L15.0384 6.10465C15.1047 6.4315 16.6621 18.141 16.6911 18.5046ZM6.1372 4.82175V4.35598C6.1372 4.04139 6.17862 3.6083 6.22418 3.40811C6.46856 2.38669 7.30111 1.5573 8.34076 1.29173C8.77568 1.1855 9.48811 1.22228 9.92303 1.37753H9.92717C10.3828 1.5287 10.7556 1.77384 11.0994 2.14972C11.6544 2.74623 11.8408 3.28145 11.8408 4.27018V4.82175H6.1372Z"
                    fill="gray"
                  />
                </svg>
              </span>
            </a>
            <span className="w-[18px] h-[18px] rounded-full  absolute -top-2.5 -right-2.5 flex justify-center items-center text-[9px] bg-qyellow text-qblack">
              {carts?.length > 0 ? carts?.length : 0}
            </span>
          </div>
        </div>
      </div>
      <Reponsive
        onClickStopModal={(e) => e.stopPropagation()}
        isOpenSidebar={isOpenSidebar}
        onClose={() => setIsOpenSidebar(false)}
      />
    </React.Fragment>
  );
}
