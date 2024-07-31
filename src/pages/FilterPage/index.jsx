import React, { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "../../components/Layout";
import { useQuery } from "@tanstack/react-query";
import { productService } from "../../services/product.service";
import { Link, useParams } from "react-router-dom";
import Loading from "../../components/Loading";
import colors from "../../json/color.json";
import { brandService } from "./../../services/brand.service";
import RangeComponent from "../../components/Range";
import {
  calculateDiscountPercentage,
  formatPrice,
} from "../../utils/fomatPrice";
import Pagination from "../../components/Pagination";
import { history } from "../../helpers/history";

const sort = [
  {
    id: 1,
    name: "Giá tăng dần",
    sort: "SORT_BY_PRICE",
    order: "ASC",
  },
  {
    id: 2,
    name: "Giá giảm dần",
    sort: "SORT_BY_PRICE",
    order: "DESC",
  },
  {
    id: 3,
    name: "Sản phẩm mới nhất",
    sort: "SORT_BY_PUBLISH_AT",
    order: "SBPA",
  },
];

export default function FilterPage() {
  const { slug } = useParams();
  const [isSlug, setSlug] = useState(null);
  useEffect(() => {
    if (slug) {
      setSlug(slug);
    }
  }, [slug]);

  const [visibleItems, setVisibleItems] = useState(4);

  const handleLoadMore = () => {
    setVisibleItems((prevVisibleItems) => prevVisibleItems + 4);
  };

  const { data: isProducts, isloading: loadingProduct } = useQuery({
    queryKey: ["products", isSlug],
    queryFn: () => productService.fetchProductsByCategory(isSlug),
    staleTime: 500,
    enabled: !!isSlug,
  });

  const { data: isBrands, isloading: loadingBrand } = useQuery(
    ["brands"],
    () => brandService.fetchAllBrands(),
    {
      retry: 3,
      retryDelay: 1000,
    }
  );

  const initialFilters = {
    brands: [],
    colors: [],
    sorts: "",
    prices: "",
  };
  const [clickedItemId, setClickedItemId] = useState();
  const [filters, setFilters] = useState(initialFilters);
  const [priceRange, setPriceRange] = useState([1000000, 100000000]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const querybrands = params.getAll("brands");
    const queryColors = params.getAll("colors");
    const querySorts = params.get("sorts");
    const queryPrices = params.get("prices");
    const searchTerm = params.get("search");

    setFilters({
      brands: querybrands || [],
      sorts: querySorts || "",
      colors: queryColors || [],
      prices: queryPrices || "",
      search: searchTerm || "",
    });
  }, []);

  const handleFilterChange = (group, value) => {
    setFilters((prevFilters) => {
      const updatedFilters = { ...prevFilters };

      if (group === "brands") {
        if (updatedFilters.brands.includes(value)) {
          updatedFilters.brands = updatedFilters.brands.filter(
            (brand) => brand !== value
          );
        } else {
          updatedFilters.brands.push(value);
        }
      } else if (group === "colors") {
        if (updatedFilters.colors.includes(value)) {
          updatedFilters.colors = updatedFilters.colors.filter(
            (color) => color !== value
          );
        } else {
          updatedFilters.colors.push(value);
        }
      } else if (value === updatedFilters[group]) {
        delete updatedFilters[group];
      } else {
        updatedFilters[group] = value;
      }

      return updatedFilters;
    });
  };

  useEffect(() => {
    const hasFilters = Object.values(filters).some((value) =>
      Array.isArray(value) ? value.length > 0 : value !== ""
    );
    const queryArray = [];

    for (const [key, value] of Object.entries(filters)) {
      if (
        (Array.isArray(value) && value.length > 0) ||
        (value !== "" && key !== "sorts" && key !== "prices")
      ) {
        // If the value is an array with items, add multiple key-value pairs with the same key
        value.forEach((item) => {
          queryArray.push(`${key}=${encodeURIComponent(item)}`);
        });
      } else if (value !== "") {
        queryArray.push(`${key}=${encodeURIComponent(value)}`);
      }
    }

    // Join all key-value pairs with "&" to create the final query string
    const query = queryArray.join("&");

    const currentPath = window.location.pathname;
    const newUrl = hasFilters ? `${currentPath}?${query}` : currentPath;

    history.push(newUrl);
  }, [filters]);

  let filteredData =
    isProducts && isProducts.length > 0
      ? isProducts
          .slice()
          .sort((a, b) => {
            if (filters.sorts === "ASC") {
              return (
                parseInt(a.price_has_dropped) - parseInt(b.price_has_dropped)
              );
            } else if (filters.sorts === "DESC") {
              return (
                parseInt(b.price_has_dropped) - parseInt(a.price_has_dropped)
              );
            } else if (filters.sorts === "SBPA") {
              return (
                new Date(b.createAt).getTime() - new Date(a.createAt).getTime()
              );
            }
            return 0;
          })
          .filter((huydev) => {
            if (
              Array.isArray(filters.brands) &&
              filters.brands.length > 0 &&
              !filters.brands.includes(huydev?.brand.nameBrand.toLowerCase())
            ) {
              return false;
            }

            if (Array.isArray(filters.colors) && filters.colors.length > 0) {
              const selectedColors = filters.colors.map((color) => color);
              const productColors = huydev.colors.map(
                (color) => color.nameColor
              );
              const hasMatchingColor = selectedColors.some((selectedColor) =>
                productColors.includes(selectedColor)
              );

              if (!hasMatchingColor) {
                return false;
              }
            }

            if (filters.prices) {
              const [minSalary, maxSalary] = filters.prices.split("-");
              const priceProduct = parseInt(huydev.price_has_dropped);

              if (minSalary && priceProduct < parseInt(minSalary)) {
                return false;
              }

              if (maxSalary && priceProduct > parseInt(maxSalary)) {
                return false;
              }
            }

            return true;
          })
      : [];

  useEffect(() => {
    if (filters.prices) {
      const newPriceRange = filters.prices.split("-").map(Number);
      const [min, max] = priceRange;

      if (min !== newPriceRange[0] || max !== newPriceRange[1]) {
        const updatedPriceRange = [newPriceRange[0], newPriceRange[1]];
        setPriceRange(updatedPriceRange);
      }
    }
  }, [filters.prices, priceRange]);

  const handlePriceChange = (newPriceRange) => {
    if (
      newPriceRange[0] !== priceRange[0] ||
      newPriceRange[1] !== priceRange[1]
    ) {
      handleFilterChange("prices", `${newPriceRange[0]}-${newPriceRange[1]}`);
      setPriceRange(newPriceRange);
    }
  };

  const handleSortChange = useCallback(
    (item) => {
      setClickedItemId(item.id);
      handleFilterChange("sorts", item.order);
    },
    [handleFilterChange]
  );

  useEffect(() => {
    const filteredSort = sort.filter((item) => item.order === filters.sorts);
    if (filteredSort.length > 0) {
      setClickedItemId(filteredSort[0].id);
    }
  }, [sort, filters.sorts]);

  const renderOrderItem = (item, index) => {
    return (
      <div className="bg-white mb-2 xl:gap-[10px] gap-[2px]" key={index}>
        <div className="relative w-full h-full p-4 flex flex-col bg-white justify-between">
          <div className="relative flex-1 flex-grow-0 flex-shrink-0 flex-basis-auto mb-2">
            <div className="relative mb-1">
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
    );
  };

  const FilteredProducts = ({ filteredData, loadingProduct }) => {
    return (
      <div>
        {filteredData?.length > 0 ? (
          loadingProduct ? (
            <Loading />
          ) : (
            <ListFilterPage filterData={filteredData} />
          )
        ) : (
          <div
            className="opacity-100 mt-10 mb-10"
            style={{ textAlign: "center" }}
          >
            <div
              height={200}
              width={200}
              className="relative inline-block overflow-hidden h-200 w-200"
            >
              <img src="https://i.imgur.com/NKeOh8y.png" />
            </div>
            <div
              type="subtitle"
              className="opacity-100 text-inherit font-semibold text-base leading-6 overflow-hidden"
            >
              Không tìm thấy sản phẩm nào
            </div>
          </div>
        )}
      </div>
    );
  };

  const ListFilterPage = ({ filterData }) => {
    return (
      <React.Fragment>
        <Pagination
          div={
            "grid xl:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-1 mb-[40px] place-content-start bg-gray-50"
          }
          data={filteredData}
          itemsPerPage={8}
          renderItem={renderOrderItem}
        />
      </React.Fragment>
    );
  };

  return (
    <Layout>
      <div className="w-full pt-[30px] pb-[60px]">
        <div className="products-page-wrapper w-full">
          <div className="max-w-6xl mx-auto">
            <div>
              <div className="breadcrumb-wrapper font-[400] text-[13px] text-black mb-[23px]">
                <span>
                  <a href="/">
                    <span className="mx-1 capitalize">home</span>
                  </a>
                  <span className="sperator capitalize">
                    / Filter / {isSlug}
                  </span>
                </span>
              </div>
            </div>
            <div className="w-full lg:flex lg:space-x-[20px]">
              <div className="lg:w-[250px]">
                <div className="filter-widget w-full fixed lg:relative left-0 top-0 h-screen z-10 lg:h-auto overflow-y-scroll lg:overflow-y-auto bg-white px-[30px] hidden lg:block">
                  {Object.entries(filters).some(
                    ([key, value]) =>
                      value &&
                      key !== "sorts" &&
                      key !== "prices" &&
                      value.length > 0
                  ) ? (
                    <div className="filter-subject-item pb-4 border-b border-gray-border mt-5">
                      <h3 className="text-black text-base font-500">Filters</h3>
                      <hr className="my-4" />
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(filters).map(([key, value]) =>
                          value &&
                          key !== "sorts" &&
                          key !== "prices" &&
                          value.length > 0 ? (
                            <React.Fragment key={key}>
                              {Array.isArray(value)
                                ? value.map((item, index) => (
                                    <React.Fragment key={index + 1}>
                                      <span
                                        className="opacity-1 capitalize inline-flex items-center px-2 bg-[rgb(255, 255, 255)] h-[24px] text-xs rounded-xl border border-solid border-[rgb(210, 210, 210)]"
                                        style={{ cursor: "pointer" }}
                                      >
                                        <div
                                          type="caption"
                                          color="textPrimary"
                                          className="mr-[0.25rem] "
                                        >
                                          {item}
                                        </div>
                                        <svg
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          size={16}
                                          className="css-9w5ue6"
                                          height={16}
                                          width={16}
                                          xmlns="http://www.w3.org/2000/svg"
                                          style={{ cursor: "pointer" }}
                                          onClick={() =>
                                            handleFilterChange(key, item)
                                          }
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
                                      </span>
                                    </React.Fragment>
                                  ))
                                : value.split(",").map((item, index) => (
                                    <div
                                      className="opacity-1 inline-flex items-center px-2 bg-[rgb(255, 255, 255)] h-[24px] rounded-xl border-solid border-[rgb(210, 210, 210)]"
                                      key={`${key}_${item}_${index}`}
                                    >
                                      <span
                                        className="css-cbubas"
                                        style={{ cursor: "pointer" }}
                                      >
                                        <div
                                          type="caption"
                                          color="textPrimary"
                                          className="capitalize"
                                        >
                                          {item}
                                        </div>
                                        <svg
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          size={16}
                                          className="css-9w5ue6"
                                          height={16}
                                          width={16}
                                          xmlns="http://www.w3.org/2000/svg"
                                          style={{ cursor: "pointer" }}
                                          onClick={() =>
                                            handleFilterChange(key, item)
                                          }
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
                                      </span>
                                    </div>
                                  ))}
                            </React.Fragment>
                          ) : null
                        )}
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                  <div className="filter-subject-item pb-5 border-b border-qgray-border mt-5">
                    <div className="subject-title mb-[20px]">
                      <h1 className="text-black text-base font-[500]">
                        Price Range
                      </h1>
                    </div>
                    <div className="price-range mb-5">
                      <div className="range-slider">
                        <RangeComponent
                          range={priceRange}
                          onPriceChange={handlePriceChange}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-black font-[400]">
                      Price: {priceRange[0].toLocaleString()} -{" "}
                      {priceRange[1].toLocaleString()}
                    </p>
                  </div>

                  <div className="filter-subject-item pb-5 border-b border-gray-border mt-5">
                    <div className="subject-title mb-[20px]">
                      <h1 className="text-black text-base font-[500]">
                        Brands
                      </h1>
                    </div>
                    <div className="filter-items">
                      <ul>
                        {loadingBrand ? (
                          <Loading />
                        ) : isBrands?.filter(
                            (item) => item.categoryID.slugCategory === isSlug
                          )?.length > 0 ? (
                          <React.Fragment>
                            {isBrands
                              .filter(
                                (item) =>
                                  item.categoryID.slugCategory === isSlug
                              )
                              .slice(0, visibleItems)
                              .map((item) => (
                                <li key={item._id} className="mb-2">
                                  <div className="flex space-x-[10px] items-center">
                                    <input
                                      onChange={() =>
                                        handleFilterChange(
                                          "brands",
                                          item.slugBrand
                                        )
                                      }
                                      checked={filters.brands.includes(
                                        item.slugBrand
                                      )}
                                      type="checkbox"
                                      name={item.nameBrand}
                                      id={item.nameBrand}
                                    />
                                    <div>
                                      <label
                                        htmlFor={item.nameBrand}
                                        className="text-xs font-400 capitalize"
                                      >
                                        {item.nameBrand}
                                      </label>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            {visibleItems < isBrands.length && (
                              <span
                                className="text-[#1990FF] cursor-pointer text-[0.75rem] text-center"
                                onClick={handleLoadMore}
                              >
                                Xem thêm
                              </span>
                            )}
                          </React.Fragment>
                        ) : (
                          <p>Rỗng</p>
                        )}
                      </ul>
                    </div>
                  </div>
                  <div className="filter-subject-item pb-5 border-b border-gray-border mt-5">
                    <div className="subject-title mb-[20px]">
                      <h1 className="text-black text-base font-[500]">
                        Colors
                      </h1>
                    </div>
                    <div className="filter-items">
                      <ul>
                        {colors?.map((item, index) => (
                          <li key={index} className="mb-2">
                            <div className="flex space-x-[10px] items-center">
                              <input
                                onChange={() =>
                                  handleFilterChange("colors", item.name)
                                }
                                checked={filters.colors.includes(item.name)}
                                type="checkbox"
                                name={item.name}
                                id={item.name}
                              />

                              <div>
                                <label
                                  htmlFor={item.name}
                                  className="text-xs font-400 capitalize"
                                >
                                  {item.name}
                                </label>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="w-10 h-10 fixed top-5 right-5 z-50 rounded lg:hidden flex justify-center items-center border border-qred text-qred"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex-1">
                <div className="products-sorting w-full bg-white md:h-[70px] flex md:flex-row flex-col md:space-y-0 space-y-5 md:justify-between md:items-center p-[20px] mb-[20px]">
                  <div>
                    <p className="font-400 text-[13px]">
                      <span className="text-qgray"> Showing</span> 1–
                      {filteredData ? filteredData?.length : 0} of{" "}
                      {isProducts?.length} results
                    </p>
                  </div>

                  <div className="flex space-x-1 items-center">
                    {sort?.map((item, index) => {
                      return (
                        <div
                          key={index}
                          onClick={() => handleSortChange(item)}
                          style={
                            clickedItemId === item.id
                              ? { borderColor: "rgb(20, 53, 195)" }
                              : { borderColor: "rgb(224, 224, 224)" }
                          }
                          className={`rounded-[4px] inline-block p-[0.5rem] select-none border border-solid bg-white relative overflow-hidden cursor-pointer`}
                        >
                          <div className="text-xs">{item.name}</div>
                          {clickedItemId === item.id && (
                            <React.Fragment>
                              <div
                                className="absolute top-[-1px] right-[-1px] w-0 h-0 border border-solid"
                                style={{
                                  borderColor:
                                    "transparent rgb(20, 53, 195) transparent transparent",
                                  borderWidth: "0px 20px 20px 0px",
                                }}
                              ></div>
                              <span className="flex absolute top-[-1px] right-[-1px] z-0">
                                <svg
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  size={14}
                                  className="css-1kpmq"
                                  color="#ffffff"
                                  height={12}
                                  width={12}
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
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    className="w-10 lg:hidden h-10 rounded flex justify-center items-center border border-qyellow text-yellow"
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
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                  </button>
                </div>
                <FilteredProducts
                  loadingProduct={loadingProduct}
                  filteredData={filteredData}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
