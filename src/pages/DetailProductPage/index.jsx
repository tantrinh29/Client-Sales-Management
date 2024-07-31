import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Layout from "../../components/Layout";
import { productService } from "../../services/product.service";
import { commentService } from "../../services/comment.service";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { addToCart } from "../../stores/cart/actions";
import createNotification from "../../utils/notification";
import { useQuery } from "@tanstack/react-query";
import Loading from "../../components/Loading";
import Slider from "../../components/Carousel";
import { SwiperSlide } from "swiper/react";
import "./style.css";
import {
  calculateDiscountPercentage,
  formatPrice,
} from "../../utils/fomatPrice";
import { AppContext } from "../../contexts/AppContextProvider";
import { URL_CONSTANTS } from "../../constants/url.constants";
import "./style.css";
import { blogService } from "../../services/blog.service";

export default function DetailProductPage() {
  const { accessToken } = useContext(AppContext);

  const [isSeeMore, setIsSeeMore] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [rating, setRating] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null);
  const [showColorError, setShowColorError] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isLoadingCart, setIsLoadingCart] = useState(false);

  const { data, isLoading } = useQuery(
    ["blog"],
    () => blogService.fetchAllBlogs(),
    {
      retry: 3,
      retryDelay: 1000,
    }
  );

  const toggleSeeMore = useCallback(() => {
    setIsSeeMore(!isSeeMore);
  }, [isSeeMore]);

  const handleRating = useCallback((rate) => {
    setRating(rate);
  }, []);

  const handleImageClick = useCallback((index) => {
    setSelectedImageIndex(index);
  }, []);

  const { slug } = useParams();
  const [isSlug, setSlug] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [visibleItems, setVisibleItems] = useState(2);

  const handleLoadMore = () => {
    setVisibleItems((prevVisibleItems) => prevVisibleItems + 2);
  };

  const [inputs, setInputs] = useState({
    comment: "",
  });

  const [detailProduct, setDetailProduct] = useState(null);
  const [isComment, setIsComment] = useState(null);

  useEffect(() => {
    if (slug) {
      setSlug(slug);
    }
  }, [slug]);

  const queryKey = useMemo(() => ["edit-product", isSlug], [isSlug]);

  const { data: detailProductData, isLoading: isDetailProductLoading } =
    useQuery(
      queryKey,
      async () => {
        if (isSlug) {
          return await productService.fetchProductBySlug(isSlug);
        }
      },
      {
        staleTime: 500,
        enabled: !!isSlug,
      }
    );

  const { data: related, isLoading: loadingRelated } = useQuery(
    ["related", detailProductData?.brandID],
    () => productService.getProductOfBrand(detailProductData?.brandID),
    {
      staleTime: 500,
      enabled: !!detailProductData?.brandID,
    }
  );

  const filteredRelated = useMemo(
    () =>
      related?.filter(
        (huydev) => huydev.slugProduct !== detailProductData?.slugProduct
      ) ?? [],
    [related, detailProductData]
  );

  useEffect(() => {
    if (detailProductData) {
      setDetailProduct(detailProductData);
    }
  }, [detailProductData]);

  const fetchCommentData = useCallback(async () => {
    if (detailProduct) {
      try {
        const commentData = await commentService.fetchByProductComments(
          detailProduct._id
        );
        setIsComment(commentData);
      } catch (error) {
        console.error("Error fetching comment data:", error);
      }
    }
  }, [detailProduct]);

  useEffect(() => {
    fetchCommentData();
  }, [detailProduct, fetchCommentData]);

  // tổng, trung bình đánh giá
  const totalRating = useMemo(
    () =>
      isComment?.reduce(
        (total, comment) => total + parseInt(comment.rating),
        0
      ),
    [isComment]
  );

  const averageRating = useMemo(
    () => totalRating / isComment?.length,
    [totalRating, isComment]
  );

  useEffect(() => {
    fetchCommentData();
  }, [detailProduct]);

  const handleColorClick = useCallback((color) => {
    if (color === "") {
      setShowColorError(true);
    } else {
      setSelectedColor(color);
      setShowColorError(false);
    }
  }, []);

  const buyCart = useCallback(
    async (product) => {
      if (!selectedColor) {
        setShowColorError(true);
        return;
      }
      if (!accessToken) {
        return navigate(URL_CONSTANTS.LOGIN);
      }
      setIsLoadingCart(true);
      const response = await dispatch(
        addToCart({
          productID: product._id,
          color: selectedColor,
          quantity,
        })
      );
      if (response.status === true) {
        createNotification("success", "topRight", response.message);
      } else {
        createNotification("error", "topRight", response.message);
      }
      setIsLoadingCart(false);
    },
    [selectedColor, accessToken, dispatch, navigate, quantity]
  );

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  }, []);

  const handleComment = useCallback(
    async (e) => {
      e.preventDefault();
      let data = {
        rating: rating,
        comment: inputs.comment,
        productID: detailProduct?._id,
      };

      try {
        const response = await commentService.fetchPostComment(data);
        if (response.status === true) {
          setValidationErrors([]);
          setRating(0);
          setInputs({ ...inputs, comment: "" });
          createNotification("success", "topRight", response.message);
          fetchCommentData();
        } else {
          if (response?.status === false) {
            setValidationErrors([]);
            setInputs({ ...inputs, comment: "" });
            createNotification("error", "topRight", response.message);
          }
          setValidationErrors(response.errors);
        }
      } catch (error) {
        console.log(error);
      }
    },
    [rating, inputs, detailProduct, fetchCommentData]
  );

  const increaseQuantity = useCallback(() => {
    setQuantity(quantity + 1);
  }, [quantity]);

  const decreaseQuantity = useCallback(() => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  }, [quantity]);

  const handleTabClick = useCallback((index) => {
    setActiveTab(index);
  }, []);

  return (
    <Layout>
      {isDetailProductLoading ? (
        <Loading />
      ) : (
        <div className="w-full px-2">
          <div className="single-product-wrapper w-full">
            <div className="product-view-main-wrapper bg-white pt-[30px] w-full">
              <div class="breadcrumb-wrapper w-full ">
                <div className="max-w-6xl mx-auto">
                  <div>
                    <div className="breadcrumb-wrapper font-400 text-[13px] text-qblack mb-[23px]">
                      <span>
                        <a href="/">
                          <span className="mx-1 capitalize">home</span>
                        </a>
                        <span className="sperator">/</span>
                      </span>
                      <span>
                        <a href="/single-product">
                          <span className="mx-1 capitalize">
                            {detailProduct?.category.nameCategory}
                          </span>
                        </a>
                        /
                        <span className="mx-1 capitalize">
                          {detailProduct?.brand.nameBrand}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-white pb-[60px]">
                  <div className="max-w-6xl mx-auto">
                    <div className="product-view w-full lg:flex justify-between ">
                      <div
                        data-aos="fade-right"
                        className="lg:w-1/2 xl:mr-[70px] lg:mr-[50px] aos-init aos-animate"
                      >
                        <div className="w-full">
                          {detailProduct?.images && (
                            <div
                              key={selectedImageIndex}
                              className="w-full h-[600px] border border-qgray-border flex justify-center items-center overflow-hidden relative mb-3"
                            >
                              <img
                                src={
                                  detailProduct?.images
                                    ? detailProduct?.images[selectedImageIndex]
                                        .imagePath
                                    : null
                                }
                                alt={detailProduct?.nameProduct}
                                className="object-contain"
                              />
                              <div className="w-[80px] h-[80px] rounded-full bg-yellow-400 text-black flex justify-center items-center text-xl font-medium absolute left-[30px] top-[30px]">
                                <span>
                                  -
                                  {calculateDiscountPercentage(
                                    detailProduct?.initial_price,
                                    detailProduct?.price_has_dropped
                                  )}
                                </span>
                              </div>
                            </div>
                          )}
                          <div className="flex gap-2 flex-wrap">
                            {detailProduct?.images.map((path, index) => (
                              <div
                                onClick={() => handleImageClick(index)}
                                key={index}
                                className="w-[110px] h-[110px] p-[15px] border border-qgray-border cursor-pointer"
                              >
                                <img
                                  src={path.imagePath}
                                  alt={detailProduct?.nameProduct}
                                  className={`w-full h-full object-contain ${
                                    selectedImageIndex === index
                                      ? ""
                                      : "opacity-50"
                                  }`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="product-details w-full mt-10 lg:mt-0">
                          <span
                            data-aos="fade-up"
                            className="text-gray-500 text-xs font-normal uppercase tracking-wider mb-2 inline-block aos-init aos-animate"
                          >
                            {detailProduct?.category.nameCategory} /{" "}
                            {detailProduct?.brand.nameBrand}
                          </span>
                          <p
                            data-aos="fade-up"
                            className="text-xl font-medium text-qblack mb-4 aos-init aos-animate"
                          >
                            {detailProduct?.nameProduct}
                          </p>
                          <div
                            data-aos="fade-up"
                            className="flex space-x-[10px] items-center mb-6 aos-init aos-animate"
                          >
                            <div className="flex">
                              {Array.from(
                                { length: Math.min(5, averageRating) },
                                (_, index) => (
                                  <span key={index}>
                                    <svg
                                      width={18}
                                      height={17}
                                      viewBox="0 0 18 17"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M9 0L11.0206 6.21885H17.5595L12.2694 10.0623L14.2901 16.2812L9 12.4377L3.70993 16.2812L5.73056 10.0623L0.440492 6.21885H6.97937L9 0Z"
                                        fill="#FFA800"
                                      />
                                    </svg>
                                  </span>
                                )
                              )}
                            </div>
                            <span className="text-[13px] font-normal text-black">
                              {isComment?.length} Reviews
                            </span>
                          </div>

                          <div
                            data-aos="fade-up"
                            className="flex space-x-2 items-center mb-7 aos-init aos-animate"
                          >
                            <span className="text-sm font-500 text-gray-500 line-through mt-2">
                              {formatPrice(detailProduct?.initial_price)}
                            </span>
                            <span className="text-2xl font-500 text-qred">
                              {formatPrice(detailProduct?.price_has_dropped)}
                            </span>
                          </div>
                          <p
                            data-aos="fade-up"
                            className="text-gray-500 text-sm text-normal mb-[30px] leading-7 aos-init aos-animate"
                            dangerouslySetInnerHTML={{
                              __html: detailProduct?.contentProduct,
                            }}
                          ></p>
                          <div
                            data-aos="fade-up"
                            className="colors mb-[30px] aos-init aos-animate"
                          >
                            <span className="text-sm font-normal uppercase text-gray-500 mb-[14px] inline-block">
                              COLOR
                            </span>
                            <div className="flex space-x-2 items-center">
                              {detailProduct?.colors.map((item, index) => (
                                <div key={index}>
                                  <button
                                    onClick={() =>
                                      handleColorClick(item.nameColor)
                                    }
                                    className={`w-[20px] h-[20px] rounded-full ${
                                      selectedColor === item.nameColor
                                        ? "ring-2 ring-offset-2"
                                        : ""
                                    } flex justify-center items-center`}
                                  >
                                    <span
                                      className="w-[20px] h-[20px] rounded-full border"
                                      style={{ background: item.nameColor }}
                                    />
                                  </button>
                                </div>
                              ))}
                            </div>
                            {showColorError && (
                              <span style={{ color: "red", marginTop: "20px" }}>
                                (Vui lòng chọn màu)
                              </span>
                            )}
                          </div>

                          <div
                            data-aos="fade-up"
                            className="quantity-card-wrapper w-full flex items-center h-[50px] space-x-[10px] mb-[30px] aos-init aos-animate"
                          >
                            <div className="w-[120px] h-full px-[26px] flex items-center border border-gray-border rounded-lg">
                              <div className="flex justify-between items-center w-full ">
                                <button
                                  type="button"
                                  onClick={decreaseQuantity}
                                  className="text-base text-gray-500"
                                >
                                  -
                                </button>
                                <span className="text-black">{quantity}</span>
                                <button
                                  type="button"
                                  onClick={increaseQuantity}
                                  className="text-base text-gray-500"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            <div className="flex-1 h-full">
                              <button
                                type="button"
                                onClick={() => buyCart(detailProduct)}
                                className="bg-black text-white text-sm font-semibold w-full h-full rounded-lg"
                              >
                                {isLoadingCart ? (
                                  <Loading />
                                ) : (
                                  "Thêm vào giỏ hàng"
                                )}
                              </button>
                            </div>
                          </div>
                          <div
                            data-aos="fade-up"
                            className="mb-[20px] aos-init aos-animate"
                          >
                            <p className="text-[13px] text-gray-500 leading-7">
                              <span className="text-qblack">Category :</span>{" "}
                              {detailProduct?.category.nameCategory}
                            </p>
                            <p className="text-[13px] text-gray-500 leading-7">
                              <span className="text-qblack">SKU:</span>{" "}
                              {detailProduct?._id}
                            </p>
                          </div>
                          <div
                            data-aos="fade-up"
                            className="flex space-x-2 items-center mb-[20px] aos-init aos-animate"
                          >
                            <span>
                              <svg
                                width={12}
                                height={13}
                                viewBox="0 0 12 13"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M0 0C0.247634 0 0.475436 0 0.729172 0C0.738324 0.160174 0.747477 0.316279 0.757647 0.493233C1.05816 0.392044 1.33885 0.282211 1.62818 0.203395C3.11296 -0.201361 4.51385 0.0366111 5.84202 0.779512C6.47661 1.13494 7.14171 1.39071 7.86987 1.47207C8.88125 1.58496 9.82093 1.35817 10.7098 0.88426C10.9335 0.765274 11.1522 0.636627 11.411 0.491199C11.4161 0.606117 11.4237 0.693577 11.4237 0.780529C11.4242 3.18822 11.4222 5.5954 11.4288 8.00309C11.4293 8.1892 11.3718 8.29089 11.2096 8.38039C9.31956 9.42279 7.4285 9.43499 5.54557 8.37734C4.06231 7.54443 2.55363 7.43307 0.992568 8.13835C0.804428 8.22327 0.737816 8.33005 0.739341 8.53904C0.749003 9.9206 0.744426 11.3027 0.744426 12.6842C0.744426 12.7849 0.744426 12.8851 0.744426 13C0.48764 13 0.254244 13 0 13C0 8.67582 0 4.34961 0 0Z"
                                  fill="#EB5757"
                                />
                              </svg>
                            </span>
                            <button
                              type="button"
                              className="text-qred font-semibold text-[13px]"
                            >
                              Report This Item
                            </button>
                          </div>
                          <div
                            data-aos="fade-up"
                            className="social-share flex items-center w-full aos-init aos-animate"
                          >
                            <span className="text-qblack text-[13px] mr-[17px] inline-block">
                              Share This
                            </span>
                            <div className="flex space-x-5 items-center">
                              <span>
                                <svg
                                  width={10}
                                  height={16}
                                  viewBox="0 0 10 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M3 16V9H0V6H3V4C3 1.3 4.7 0 7.1 0C8.3 0 9.2 0.1 9.5 0.1V2.9H7.8C6.5 2.9 6.2 3.5 6.2 4.4V6H10L9 9H6.3V16H3Z"
                                    fill="#3E75B2"
                                  />
                                </svg>
                              </span>
                              <span>
                                <svg
                                  width={16}
                                  height={16}
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M8 0C3.6 0 0 3.6 0 8C0 11.4 2.1 14.3 5.1 15.4C5 14.8 5 13.8 5.1 13.1C5.2 12.5 6 9.1 6 9.1C6 9.1 5.8 8.7 5.8 8C5.8 6.9 6.5 6 7.3 6C8 6 8.3 6.5 8.3 7.1C8.3 7.8 7.9 8.8 7.6 9.8C7.4 10.6 8 11.2 8.8 11.2C10.2 11.2 11.3 9.7 11.3 7.5C11.3 5.6 9.9 4.2 8 4.2C5.7 4.2 4.4 5.9 4.4 7.7C4.4 8.4 4.7 9.1 5 9.5C5 9.7 5 9.8 5 9.9C4.9 10.2 4.8 10.7 4.8 10.8C4.8 10.9 4.7 11 4.5 10.9C3.5 10.4 2.9 9 2.9 7.8C2.9 5.3 4.7 3 8.2 3C11 3 13.1 5 13.1 7.6C13.1 10.4 11.4 12.6 8.9 12.6C8.1 12.6 7.3 12.2 7.1 11.7C7.1 11.7 6.7 13.2 6.6 13.6C6.4 14.3 5.9 15.2 5.6 15.7C6.4 15.9 7.2 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0Z"
                                    fill="#E12828"
                                  />
                                </svg>
                              </span>
                              <span>
                                <svg
                                  width={18}
                                  height={14}
                                  viewBox="0 0 18 14"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M17.0722 1.60052C16.432 1.88505 15.7562 2.06289 15.0448 2.16959C15.7562 1.74278 16.3253 1.06701 16.5742 0.248969C15.8985 0.640206 15.1515 0.924742 14.3335 1.10258C13.6933 0.426804 12.7686 0 11.7727 0C9.85206 0 8.28711 1.56495 8.28711 3.48557C8.28711 3.7701 8.32268 4.01907 8.39382 4.26804C5.51289 4.12577 2.9165 2.73866 1.17371 0.604639C0.889175 1.13814 0.71134 1.70722 0.71134 2.34742C0.71134 3.5567 1.31598 4.62371 2.27629 5.26392C1.70722 5.22835 1.17371 5.08608 0.675773 4.83711V4.87268C0.675773 6.5799 1.88505 8.00258 3.48557 8.32268C3.20103 8.39382 2.88093 8.42938 2.56082 8.42938C2.34742 8.42938 2.09845 8.39382 1.88505 8.35825C2.34742 9.74536 3.62784 10.7768 5.15722 10.7768C3.94794 11.7015 2.45412 12.2706 0.818041 12.2706C0.533505 12.2706 0.248969 12.2706 0 12.2351C1.56495 13.2309 3.37887 13.8 5.37062 13.8C11.8082 13.8 15.3294 8.46495 15.3294 3.84124C15.3294 3.69897 15.3294 3.52113 15.3294 3.37887C16.0052 2.9165 16.6098 2.31186 17.0722 1.60052Z"
                                    fill="#3FD1FF"
                                  />
                                </svg>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center flex-col lg:flex-row max-w-6xl m-auto gap-5">
              <div className="lg:w-8/12 relative pb-[20px]">
                <div className="tab-buttons w-full mb-3 mt-5 sm:mt-0">
                  <div className="max-w-6xl mx-auto">
                    <ul className="flex space-x-12 ">
                      <li onClick={() => handleTabClick(0)}>
                        <span
                          className={`py-[15px] sm:text-[15px] text-sm sm:block border-b font-medium cursor-pointer ${
                            activeTab === 0
                              ? "border-yellow-400 text-black"
                              : ""
                          }`}
                        >
                          Mô tả
                        </span>
                      </li>
                      <li onClick={() => handleTabClick(1)}>
                        <span
                          className={`py-[15px] sm:text-[15px] text-sm sm:block border-b font-medium cursor-pointer ${
                            activeTab === 1
                              ? "border-yellow-400 text-black"
                              : ""
                          }`}
                        >
                          Đánh giá
                        </span>
                      </li>
                      <li onClick={() => handleTabClick(2)}>
                        <span
                          className={`py-[15px] sm:text-[15px] text-sm sm:block border-b font-medium cursor-pointer ${
                            activeTab === 2
                              ? "border-yellow-400 text-black"
                              : ""
                          }`}
                        >
                          Thông số
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div className="w-full h-[1px] bg-[#E8E8E8] absolute left-0 sm:top-[50px] top-[36px] -z-10" />
                </div>
                <div className="tab-contents w-full min-h-[400px] ">
                  <div className="max-w-6xl mx-auto">
                    {activeTab === 0 ? (
                      <React.Fragment>
                        <div
                          // data-aos="fade-up"
                          style={
                            isSeeMore
                              ? { maxHeight: 550 }
                              : { maxHeight: "unset" }
                          }
                          className={`w-full ${
                            isSeeMore ? "bg-content" : ""
                          } aos-init`}
                          dangerouslySetInnerHTML={{
                            __html: detailProduct?.descriptionProduct,
                          }}
                        ></div>
                        <div className="text-center p-[16px]">
                          <a
                            onClick={toggleSeeMore}
                            className="bg-white color-[#1988EC] font-[500] rounded-[10px] m-auto max-w-[126px] w-full text-[15px] leading-[36px]"
                            style={{
                              display: "block",
                              boxShadow: "0 0 0 1px #1988EC",
                              cursor: "pointer",
                            }}
                          >
                            {isSeeMore ? (
                              <div
                                style={{
                                  color: "#1988EC",
                                }}
                              >
                                Xem thêm{" "}
                                <i
                                  className="fas fa-angle-down"
                                  aria-hidden="true"
                                ></i>
                              </div>
                            ) : (
                              <div style={{ color: "#1988EC" }}>
                                Thu gọn{" "}
                                <i
                                  className="fas fa-angle-up"
                                  aria-hidden="true"
                                ></i>
                              </div>
                            )}
                          </a>
                        </div>
                      </React.Fragment>
                    ) : activeTab === 1 ? (
                      <div className="max-w-6xl mx-auto">
                        <div
                          data-aos="fade-up"
                          className="w-full tab-content-item aos-init aos-animate"
                        >
                          <h6 className="text-[18px] font-medium text-black mb-2">
                            Bình Luận
                          </h6>
                          <div className="w-full">
                            <div className="review-wrapper w-full">
                              <div className="w-full reviews">
                                <div className="w-full comments">
                                  {isComment
                                    ?.slice(0, visibleItems)
                                    .map((item, index) => (
                                      <div
                                        key={index}
                                        className="comment-item bg-white mb-2.5 rounded-2xl"
                                      >
                                        <div className="comment-author flex justify-between items-center mb-3">
                                          <div className="flex space-x-3 items-center mt-3 ml-3">
                                            <div className="w-[40px] h-[40px] rounded-full overflow-hidden relative">
                                              <span
                                                style={{
                                                  boxSizing: "border-box",
                                                  display: "block",
                                                  overflow: "hidden",
                                                  width: "initial",
                                                  height: "initial",
                                                  background: "none",
                                                  opacity: 1,
                                                  border: 0,
                                                  margin: 0,
                                                  padding: 0,
                                                  position: "absolute",
                                                  inset: 0,
                                                }}
                                              >
                                                <img
                                                  alt
                                                  sizes="100vw"
                                                  src={`https://ui-avatars.com/api/name=${item.userID?.fullname}`}
                                                  decoding="async"
                                                  data-nimg="fill"
                                                  className="w-full h-full object-cover"
                                                  style={{
                                                    position: "absolute",
                                                    inset: 0,
                                                    boxSizing: "border-box",
                                                    padding: 0,
                                                    border: "none",
                                                    margin: "auto",
                                                    display: "block",
                                                    width: 0,
                                                    height: 0,
                                                    minWidth: "100%",
                                                    maxWidth: "100%",
                                                    minHeight: "100%",
                                                    maxHeight: "100%",
                                                  }}
                                                />
                                              </span>
                                            </div>
                                            <div>
                                              <p className="text-[18px] font-medium text-qblack">
                                                {item.userID.fullname}
                                              </p>
                                              <p className="text-[13px] font-normal text-qgray">
                                                {item.userID?.address}
                                              </p>
                                            </div>
                                          </div>
                                          <div className="flex items-center space-x-2 mr-5">
                                            <div className="flex">
                                              {Array.from(
                                                { length: item.rating },
                                                (_, index) => (
                                                  <span key={index}>
                                                    <svg
                                                      width={18}
                                                      height={17}
                                                      viewBox="0 0 18 17"
                                                      fill="none"
                                                      xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                      <path
                                                        d="M9 0L11.0206 6.21885H17.5595L12.2694 10.0623L14.2901 16.2812L9 12.4377L3.70993 16.2812L5.73056 10.0623L0.440492 6.21885H6.97937L9 0Z"
                                                        fill="#FFA800"
                                                      />
                                                    </svg>
                                                  </span>
                                                )
                                              )}
                                            </div>
                                            <span className="text-[13px] font-normal text-black mt-1 inline-block">
                                              ({item.rating}.0)
                                            </span>
                                          </div>
                                        </div>
                                        <div className="comment ml-5">
                                          <p className="text-[15px] text-gray leading-7 text-normal">
                                            {item.comment}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                                <div className="w-full flex justify-center">
                                  {isComment &&
                                    visibleItems < isComment.length && (
                                      <span
                                        className="text-[#1990FF] cursor-pointer text-center"
                                        onClick={handleLoadMore}
                                      >
                                        Xem thêm
                                      </span>
                                    )}
                                </div>
                              </div>
                              <form
                                onSubmit={handleComment}
                                className="write-review w-full mt-2"
                              >
                                <h1 className="text-[18px] font-medium text-black">
                                  Đánh giá và nhận xét
                                </h1>
                                <div className="flex space-x-1 items-center mb-[5px]">
                                  <div className="star-rating flex">
                                    <button
                                      type="button"
                                      onClick={() => handleRating(1)}
                                      className={
                                        rating >= 1
                                          ? "text-yellow-400"
                                          : "text-gray-400"
                                      }
                                    >
                                      <svg
                                        width={19}
                                        height={18}
                                        viewBox="0 0 19 18"
                                        fill="none"
                                        className="fill-current"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path d="M9.5 0L11.6329 6.56434H18.535L12.9511 10.6213L15.084 17.1857L9.5 13.1287L3.91604 17.1857L6.04892 10.6213L0.464963 6.56434H7.36712L9.5 0Z" />
                                      </svg>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRating(2)}
                                      className={
                                        rating >= 2
                                          ? "text-yellow-400"
                                          : "text-gray-400"
                                      }
                                    >
                                      <svg
                                        width={19}
                                        height={18}
                                        viewBox="0 0 19 18"
                                        fill="none"
                                        className="fill-current"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path d="M9.5 0L11.6329 6.56434H18.535L12.9511 10.6213L15.084 17.1857L9.5 13.1287L3.91604 17.1857L6.04892 10.6213L0.464963 6.56434H7.36712L9.5 0Z" />
                                      </svg>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRating(3)}
                                      className={
                                        rating >= 3
                                          ? "text-yellow-400"
                                          : "text-gray-400"
                                      }
                                    >
                                      <svg
                                        width={19}
                                        height={18}
                                        viewBox="0 0 19 18"
                                        fill="none"
                                        className="fill-current"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path d="M9.5 0L11.6329 6.56434H18.535L12.9511 10.6213L15.084 17.1857L9.5 13.1287L3.91604 17.1857L6.04892 10.6213L0.464963 6.56434H7.36712L9.5 0Z" />
                                      </svg>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRating(4)}
                                      className={
                                        rating >= 4
                                          ? "text-yellow-400"
                                          : "text-gray-400"
                                      }
                                    >
                                      <svg
                                        width={19}
                                        height={18}
                                        viewBox="0 0 19 18"
                                        fill="none"
                                        className="fill-current"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path d="M9.5 0L11.6329 6.56434H18.535L12.9511 10.6213L15.084 17.1857L9.5 13.1287L3.91604 17.1857L6.04892 10.6213L0.464963 6.56434H7.36712L9.5 0Z" />
                                      </svg>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRating(5)}
                                      className={
                                        rating >= 5
                                          ? "text-yellow-400"
                                          : "text-gray-400"
                                      }
                                    >
                                      <svg
                                        width={19}
                                        height={18}
                                        viewBox="0 0 19 18"
                                        fill="none"
                                        className="fill-current"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path d="M9.5 0L11.6329 6.56434H18.535L12.9511 10.6213L15.084 17.1857L9.5 13.1287L3.91604 17.1857L6.04892 10.6213L0.464963 6.56434H7.36712L9.5 0Z" />
                                      </svg>
                                    </button>
                                  </div>
                                  <span className="text-black text-[15px] font-normal mt-1">
                                    ({rating}.0)
                                  </span>
                                </div>
                                <div className="w-full review-form ">
                                  <div className="sm:flex sm:space-x-[30px] items-center mb-5"></div>
                                  <div className="w-full mb-[10px]">
                                    <h6 className="input-label text-gray-400 capitalize text-[13px] font-normal block mb-2 ">
                                      Message*
                                    </h6>
                                    <textarea
                                      name="comment"
                                      onChange={handleChange}
                                      cols={30}
                                      rows={3}
                                      placeholder="Mời bạn để lại bình luận..."
                                      value={inputs.comment}
                                      className="w-full focus:ring-0 focus:outline-none p-4 border border-yellow-400"
                                    />
                                  </div>
                                  {validationErrors &&
                                    validationErrors.comment && (
                                      <p className="mt-1 text-red-500">
                                        <li>{validationErrors.comment.msg}</li>
                                      </p>
                                    )}
                                  <div className="flex justify-end">
                                    <button
                                      type="submit"
                                      className="bg-black text-white w-[200px] h-[50px] flex justify-center rounded"
                                    >
                                      <span className="flex space-x-1 items-center h-full">
                                        <span className="text-sm font-semibold">
                                          Submit Review
                                        </span>
                                      </span>
                                    </button>
                                  </div>
                                </div>
                              </form>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : activeTab === 2 ? (
                      <div className="max-w-6xl mx-auto">
                        <div
                          data-aos="fade-up"
                          className="w-full tab-content-item aos-init aos-animate"
                        >
                          <div className="saller-info-wrapper w-full">
                            <div className="items-center flex justify-center">
                              <div className="pd-spec-holder ">
                                <div
                                  className="tlqcontent"
                                  dangerouslySetInnerHTML={{
                                    __html:
                                      detailProduct?.specificationsProduct,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="lg:w-4/12 relative pb-[20px]">
                <div className="flex flex-col rounded-md">
                  <p className="py-[15px] sm:text-[15px] text-sm sm:block border-b font-medium cursor-pointer">
                    Tin tức mới nhất
                  </p>
                  <div className="py-[20px] leading-[18px]" style={{
                    borderBottom: "1px solid #E5EAF1",
                  }}>
                    <Link href="/cau-hinh-may-tinh-do-hoa" className="text-center mb-[12px] block">
                      <img
                        src="https://hoanghapccdn.com/media/news/14_pc_do_hoa_hoanghapc_min.jpg"
                        alt="100+ Cấu Hình Máy Tính Đồ Họa Theo Ngân Sách✔️"
                        width={352}
                        height={235}
                        className="w-auto h-auto block m-auto"
                      />
                    </Link>
                    <div>
                      <a
                        href="/cau-hinh-may-tinh-do-hoa"
                        className="font-[600] text-[16px] leading-[20px] mb-[4px]"
                      >
                        100+ Cấu Hình Máy Tính Đồ Họa Theo Ngân Sách✔️
                      </a>
                      <div className="text-ellipsis overflow-hidden line-clamp-2" style={{
                        
                      }}>
                        Cấu hình máy tính đồ họa chuyên dụng cho công việc thiết
                        kế đồ họa, làm phim, Render và xử lý các thuật toán AI
                        trí tuệ nhân tạo phù hợp nhất mọi công việc.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="related-product w-full bg-gray-50">
              <div className="max-w-6xl mx-auto">
                <div className="w-full py-[60px]">
                  <h1 className="sm:text-2xl text-xl font-600 text-qblacktext leading-none mb-[30px]">
                    Related Product
                  </h1>
                  {filteredRelated.length > 0 ? (
                    <Slider
                      className="swiper"
                      spaceBetween={10}
                      navigation={true}
                      pagination={false}
                      slidesPerView={5}
                      breakpoints={{
                        1024: {
                          slidesPerView: 5,
                        },
                        768: {
                          slidesPerView: 3,
                        },
                        640: {
                          slidesPerView: 2,
                        },
                        320: {
                          slidesPerView: 2,
                        },
                      }}
                    >
                      {filteredRelated?.map((item, index) => (
                        <SwiperSlide key={index}>
                          <div
                            data-aos="fade-up"
                            className="bg-white w-full w[140px]"
                          >
                            <div className="relative w-full h-full p-4 flex flex-col bg-white justify-between">
                              <div className="relative flex-1 flex-grow-0 flex-shrink-0 flex-basis-auto">
                                <div className="relative">
                                  <div className="relative pb-[100%]">
                                    <div
                                      height="100%"
                                      width="100%"
                                      className="inline-block overflow-hidden h-full w-full transition-transform duration-300 ease-in-out absolute inset-0 object-contain"
                                    >
                                      <Link to={`/product/${item.slugProduct}`}>
                                        <img
                                          src={item.images[0].imagePath}
                                          loading="lazy"
                                          hover="zoom"
                                          decoding="async"
                                          alt="Laptop ACER Nitro 16 Phoenix AN16-41-R5M4 (Ryzen 5 7535HS/RAM 8GB/RTX 4050/512GB SSD/ Windows 11)"
                                          style={{
                                            width: "100%",
                                            height: "100%",
                                            objectFit: "contain",
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                          }}
                                        />
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                                <div className="mb-1">
                                  <div
                                    type="body"
                                    color="textSecondary"
                                    className="product-brand-name border-gray-300 opacity-100 text-gray-500 font-medium text-sm leading-[20px] overflow-hidden whitespace-nowrap overflow-ellipsis transition duration-300 ease-in-out delay-0s"
                                    style={{
                                      textTransform: "uppercase",
                                      display: "inline",
                                    }}
                                  >
                                    {item.brand.nameBrand}
                                  </div>
                                </div>
                                <div className="h-12">
                                  <div
                                    type="caption"
                                    className="att-product-card-title  border-gray-300 opacity-100 text-gray-600 font-normal text-sm leading-4 overflow-hidden custom-line-clamp"
                                    color="textPrimary"
                                  >
                                    <Link to={`/product/${item.slugProduct}`}>
                                      <h3
                                        title={item.nameProduct}
                                        className="text-sm font-normal leading-4 inline"
                                      >
                                        {item.nameProduct}
                                      </h3>
                                    </Link>
                                  </div>
                                </div>
                                <div className="relative mt-1 mb-1 pr-0 flex items-center">
                                  <div className="flex flex-col items-start h-10">
                                    <div
                                      type="subtitle"
                                      className="att-product-detail-latest-price opacity-100 text-blue-700 font-bold text-lg leading-6 overflow-hidden whitespace-normal overflow-ellipsis mt-1"
                                      color="primary500"
                                    >
                                      {formatPrice(item.price_has_dropped)}đ
                                    </div>
                                    <div class="flex h-4">
                                      <div
                                        type="caption"
                                        class="att-product-detail-retail-price m-0.25 opacity-100 text-gray-500 font-normal text-xs leading-4 overflow-hidden overflow-ellipsis line-through mt-1"
                                        color="textSecondary"
                                      >
                                        {formatPrice(item.initial_price)} đ
                                      </div>
                                      <div
                                        type="caption"
                                        color="primary500"
                                        class="opacity-100 text-blue-500 font-normal text-xs leading-4 overflow-hidden overflow-ellipsis ml-2 mt-1"
                                      >
                                        -{" "}
                                        {calculateDiscountPercentage(
                                          item?.initial_price,
                                          item?.price_has_dropped
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="ml-10">
                                    <button
                                      className="w-8 h-8 border-[1px] border-blue-400 rounded-full p-[11px] flex-shrink-0 order-first"
                                      onClick={() => handleAddToCart()}
                                    >
                                      <img
                                        src="https://i.imgur.com/ZCeBSHN.png"
                                        alt=""
                                        style={{ transform: "scale(2.5)" }}
                                      />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </SwiperSlide>
                      ))}
                      <div className="navigation slider-prev" />
                      <div className="navigation slider-next" />
                    </Slider>
                  ) : (
                    <div className="items-center flex justify-center">
                      <img
                        src="https://i.imgur.com/2yNJN6H.png"
                        alt=""
                        width={200}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
