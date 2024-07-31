import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { URL_CONSTANTS } from "../../constants/url.constants";
import { categoryService } from "../../services/category.service";
import {COLOR} from "../../constants/style.constants"

export default function HeaderBottom() {
  const dropdownRef = useRef();
  const [dropdownStates, setDropdownStates] = useState({
    categories: false,
  });

  const toggleMenu = (item) => {
    const newDropdownStates = { ...dropdownStates };
    newDropdownStates[item] = !newDropdownStates[item];
    setDropdownStates(newDropdownStates);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownStates({ categories: false });
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

  return (
    <div className={`nav-widget-wrapper w-full  h-[60px] relative z-30 quomodo-shop-nav-bar lg:block hidden`} style={{
      background: COLOR.BLUE
    }}>
      <div className="max-w-6xl mx-auto h-full">
        <div className="w-full h-full relative">
          <div className="w-full h-full flex justify-between items-center">
            <div className="category-and-nav flex xl:space-x-7 space-x-3 items-center">
              <div className="category w-[270px] h-[53px] bg-white px-5 rounded-t-md mt-[6px] relative">
                <button
                  ref={dropdownRef}
                  onClick={() => toggleMenu("categories")}
                  type="button"
                  className="w-full h-full flex justify-between items-center"
                >
                  <div className="flex space-x-3 items-center">
                    <span>
                      <svg
                        className="fill-current"
                        width={14}
                        height={9}
                        viewBox="0 0 14 9"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect width={14} height={1} />
                        <rect y={8} width={14} height={1} />
                        <rect y={4} width={10} height={1} />
                      </svg>
                    </span>
                    <span className="text-sm font-600 text-qblacktext">
                      Danh mục sản phẩm
                    </span>
                  </div>
                  <div>
                    <svg
                      width={10}
                      height={5}
                      viewBox="0 0 10 5"
                      fill="none"
                      className="fill-current text-qblacktext"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="9.18359"
                        y="0.90918"
                        width="5.78538"
                        height="1.28564"
                        transform="rotate(135 9.18359 0.90918)"
                      />
                      <rect
                        x="5.08984"
                        y={5}
                        width="5.78538"
                        height="1.28564"
                        transform="rotate(-135 5.08984 5)"
                      />
                    </svg>
                  </div>
                </button>

                {dropdownStates.categories && (
                  <div class="fixed top-0 left-0 w-full h-full -z-10"></div>
                )}
                <div
                  className="category-dropdown w-full absolute left-0 top-[53px] overflow-hidden"
                  style={
                    dropdownStates.categories
                      ? { height: "924px" }
                      : { height: 0 }
                  }
                >
                  <ul className="categories-list">
                    {loadingCategory ? (
                      <Loading />
                    ) : (
                      isCategories?.map((item) => (
                        <li className="category-item">
                          <Link to={`/filter/${item.slugCategory}`}>
                            <div className="flex justify-between items-center px-5 h-10 bg-white  transition-all duration-300 ease-in-out cursor-pointer text-qblack hover:bg-qyellow">
                              <div className="flex items-center space-x-6">
                                <span>
                                  <img
                                    width={20}
                                    src={item.imageCategory}
                                    alt={item.nameCategory}
                                  />
                                </span>
                                <span className="text-xs font-400">
                                  {item.nameCategory}
                                </span>
                              </div>
                            </div>
                          </Link>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
              <div className="nav">
                <ul className="nav-wrapper flex xl:space-x-10 space-x-5">
                  <li className="relative ">
                    <Link to={URL_CONSTANTS.HOME}>
                      <span className="flex items-center text-sm font-600 cursor-pointer text-white">
                        <span>Home</span>
                      </span>
                    </Link>
                  </li>
                  <li>
                    <span className="flex items-center text-sm font-600 cursor-pointer text-white">
                      <span>About</span>
                    </span>
                  </li>
                  <li>
                    <Link to={URL_CONSTANTS.BLOG}>
                      <span className="flex items-center text-sm font-600 cursor-pointer text-white">
                        <span>Blog</span>
                      </span>

                    </Link>
                  </li>
                  <li>
                    <Link to={URL_CONSTANTS.CONTACT}>
                      <span className="flex items-center text-sm font-600 cursor-pointer text-white">
                        <span>Contact</span>
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="become-seller-btn">
              <div className="bg-black text-white w-[161px] h-[40px] flex justify-center items-center cursor-pointer">
                <div className="flex space-x-2 items-center">
                  <span className="text-sm font-600">Become a Seller</span>
                  <span className="pt-1">
                    <svg
                      className="fill-current"
                      width={6}
                      height={10}
                      viewBox="0 0 6 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="1.08984"
                        width="6.94106"
                        height="1.54246"
                        transform="rotate(45 1.08984 0)"
                        fill="white"
                      />
                      <rect
                        x={6}
                        y="4.9082"
                        width="6.94106"
                        height="1.54246"
                        transform="rotate(135 6 4.9082)"
                        fill="white"
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
  );
}
