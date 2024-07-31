import React from "react";

import Layout from "../../components/Layout";
import { useQuery } from "@tanstack/react-query";
import { blogService } from "../../services/blog.service";
import { Link, useParams } from "react-router-dom";
import Loading from "../../components/Loading";

export default function BlogDetail() {
  const { slug } = useParams();
  const { data, isLoading, refetch } = useQuery(
    ["blog"],
    () => blogService.fetchBlogBySlug(slug),
    {
      retry: 3,
      retryDelay: 1000,
    }
  );
  const { data: titleBlog } = useQuery(
    ["allBlogs"],
    () => blogService.fetchAllBlogs(slug),
    {
      retry: 3,
      retryDelay: 1000,
    }
  );
  React.useEffect(() => {
    refetch();
  }, [slug]);

  
  return (
    <Layout>
      <div className="w-full  pt-0 pb-0">
        <div className="w-full py-[20px]">
          <div className="max-w-6xl mx-auto">
            <div className="w-full">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row">
                {/* Cột 1 */}
                {isLoading ? (
                  <Loading />
                ) : (
                  <div className="w-full lg:w-9/12 pr-5 mb-4 lg:mb-0">
                    <div className="bg-white mb-4 shadow-sm rounded-md">
                      <div className="p-4 shadow-sm flex">
                        <div>
                          <h2 className="text-xl font-semibold mb-2">
                            {data.titleBlog}
                          </h2>
                          <p className="text-gray-600 mb-1">
                            Tác giả: <b>{data.userBlog}</b> | Ngày:{" "}
                            {data.updatedAt}
                          </p>
                          <div className="img w-full h-[457px] relative mb-5 mt-5 ">
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
                                alt="blog"
                                sizes="100vw"
                                srcSet={data.imageBlog}
                                src={data.imageBlog}
                                decoding="async"
                                data-nimg="fill"
                                className="w-full h-full object-cover rounded-md"
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
                          <p
                            className="text-[18px]"
                            dangerouslySetInnerHTML={{
                              __html: data.contentBlog,
                            }}
                          ></p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cột 2*/}
                <div className="w-full lg:w-3/12">
                  <div className="bg-white p-4 shadow-md flex flex-col rounded-md">
                    <p className="bg-blue-700 text-white py-0.5 px-1 mb-2 w-[256px] rounded-md text-center text-[20px]">
                      Bài viết gần đây
                    </p>
                    <img
                      src="https://phongvu.vn/cong-nghe/wp-content/uploads/2023/11/danh-gia-laptop-msi-cyborg-300x300.png"
                      alt="Mô tả ảnh"
                      className="w-full h-40 object-cover mb-4 rounded-md"
                    />
                    {titleBlog?.map((item, index) => (
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
                    ))}
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
