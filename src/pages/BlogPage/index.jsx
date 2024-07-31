import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import { useQuery } from "@tanstack/react-query";
import { blogService } from "./../../services/blog.service";
import { Link } from "react-router-dom";
import Loading from "../../components/Loading";

export default function BlogPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const itemsPerPage = 4;

  const { data, isLoading } = useQuery(
    ["blog", currentPage],
    () => blogService.fetchAllBlogs(currentPage),
    {
      retry: 3,
      retryDelay: 1000,
    }
  );

  useEffect(() => {
    if (data) {
      setTotalPages(Math.ceil(data.length / itemsPerPage));
    }
  }, [data, itemsPerPage]);

  const dataExists = data && Array.isArray(data);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedBlogs = dataExists ? data.slice(startIndex, endIndex) : [];

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <Layout>
      <div className="w-full  pt-[0px] pb-[0px]">
        <div className="blogs-wrapper w-full-width">
          <div className="title-bar">
            <div className="page-title-wrapper bg-[#D3EFFF] w-full h-[173px] py-10">
              <div className="max-w-6xl mx-auto">
                <div className="mb-5">
                  <div>
                    <div className="breadcrumb-wrapper font-400 text-[13px] text-qblack mb-[23px]">
                      <span>
                        <a href="/">
                          <span className="mx-1 capitalize">home</span>
                        </a>
                        <span className="sperator">/</span>
                      </span>
                      <span>
                        <a href="/blogs">
                          <span className="mx-1 capitalize">blogs</span>
                        </a>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <h1 className="text-3xl font-semibold text-qblack">
                    Our Blogs
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full py-5 lg:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="w-full">
              <div className="max-w-6xl mx-auto flex flex-col lg:flex-row">
                {/* Cột 1 (70%) */}
                <div className="w-full lg:w-9/12 pr-5 mb-4 lg:mb-0">
                  <div className="bg-white shadow-sm rounded-md">
                    {/* Hàng 1 */}
                    {isLoading ? (
                      <Loading />
                    ) : (
                      displayedBlogs?.map((item) => (
                        <div key={item.id} className="p-4 shadow-sm flex">
                          {/* Ảnh (nằm ngoài cùng bên trái) */}
                          <img
                            src={`${item.imageBlog}`}
                            alt="Mô tả ảnh"
                            className="w-full lg:w-[200px] h-[190px] lg:mr-5 rounded-md object-cover mb-4 lg:mb-0 mx-auto"
                          />

                          {/* Phần thông tin tin tức (tiêu đề, tác giả, nội dung) */}

                          <div>
                            <div className="bg-blue-700 text-white py-0.5 px-1 mb-2 w-[60px] rounded-md text-center">
                              Tin tức
                            </div>
                            {/* Tiêu đề tin tức */}
                            <Link to={`/tin-tuc/${item.slugBlog}`}>
                              <h2 className="text-xl lg:text-2xl font-semibold mb-2">
                                {item.titleBlog}
                              </h2>
                            </Link>

                            {/* Thông tin người viết */}
                            <p className="text-gray-600 mb-1">
                              Tác giả: <b>{item.userBlog}</b> | Ngày:{" "}
                              {item.updatedAt}
                            </p>

                            {/* Nội dung tin tức */}
                            <Link to={`/tin-tuc/${item.slugBlog}`}>
                              <p
                                className="text-[18px] lg:text-base line-clamp-2"
                                dangerouslySetInnerHTML={{
                                  __html: item?.contentBlog,
                                }}
                              ></p>
                            </Link>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                {/* Cột 2 (30%) */}
                <div className="w-full lg:w-3/12">
                  {/* Nội dung cột 2 */}
                  <div className="bg-white p-4 shadow-md flex flex-col rounded-md">
                    <p className="bg-blue-700 text-white py-0.5 px-1 mb-2 w-[256px] rounded-md text-center text-[23px]">
                      Tin tức xem nhiều
                    </p>

                    <img
                      src="https://phongvu.vn/cong-nghe/wp-content/uploads/2023/11/danh-gia-laptop-msi-cyborg-300x300.png"
                      alt="Mô tả ảnh"
                      className="w-full h-40 object-cover mb-4 rounded-md"
                    />
                    {isLoading ? (
                      <Loading />
                    ) : (
                      data?.map((item, index) => (
                        <div>
                          <ul
                            className="list-decimal text-gray-600 flex-1"
                            key={index}
                          >
                            <div className="flex mb-2">
                              <div className="w-5 h-5 bg-blue-700 text-white mr-2 flex items-center justify-center rounded-md mt-1">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <Link to={`/tin-tuc/${item.slugBlog}`}>
                                    <div>
                                      <b>{item.titleBlog}</b>
                                    </div>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </ul>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <div class="mt-4 lg:mt-[1rem] opacity-1">
                <div class="w-full text-center opacity-1 mt-[1rem]">
                  <div class="inline-flex">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      class="bg-gray-200 z-[1] w-[2rem] h-[2rem] flex justify-center items-center rounded-[0.25rem] border border-solid border-[rgb(228, 229, 240)]"
                    >
                      <svg
                        fill="none"
                        viewBox="0 0 24 24"
                        size="16"
                        class="css-26qhcs"
                        color="placeholder"
                        height="16"
                        width="16"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M15.5 5L8.5 12L15.5 19"
                          stroke="#82869E"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>
                      </svg>
                    </button>
                    {[...Array(totalPages).keys()].map((page) => (
                      <button
                        key={page + 1}
                        onClick={() => handlePageChange(page + 1)}
                        className={`ml-[0.5rem] z-[1] w-[2rem] h-[2rem] flex justify-center items-center rounded-[0.25rem] ${
                          currentPage === page + 1
                            ? "bg-blue-700 text-white"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        <div class="m-0 p-0 opacity-1 text-[13px] leading-[24px] overflow-hidden">
                          {page + 1}
                        </div>
                      </button>
                    ))}
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      class="bg-gray-200 ml-[0.5rem] z-[1] w-[2rem] h-[2rem] flex justify-center items-center rounded-[0.25rem] border border-solid border-[rgb(228, 229, 240)]"
                    >
                      <svg
                        fill="none"
                        viewBox="0 0 24 24"
                        size="16"
                        class="css-26qhcs"
                        color="placeholder"
                        height="16"
                        width="16"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8.5 19L15.5 12L8.5 5"
                          stroke="#82869E"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
