import React from "react";
import { usePagination } from "../../hooks/usePagination";

export default function Pagination({ div, data, itemsPerPage, renderItem }) {
  const { currentPage, currentData, nextPage, prevPage, maxPages, goToPage } =
    usePagination(data, itemsPerPage);
  return (
    <React.Fragment>
      {div ? (
        <div className={div}>
          {currentData.map((item, index) => renderItem(item, index))}
        </div>
      ) : (
        currentData.map((item, index) => renderItem(item, index))
      )}
      <div className="mt-[1rem] opacity-1">
        <div className="w-full text-center opacity-1">
          <div className="inline-flex">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`${
                currentPage === 1 ? "bg-gray-200" : "bg-white"
              } z-[1] w-[2rem] h-[2rem] flex justify-center items-center rounded-[0.25rem] border border-solid border-[rgb(228, 229, 240)]`}
            >
              <svg
                fill="none"
                viewBox="0 0 24 24"
                size={16}
                className="css-26qhcs"
                color="placeholder"
                height={16}
                width={16}
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.5 5L8.5 12L15.5 19"
                  stroke="#82869E"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {[...Array(maxPages).keys()].map((page) => (
              <button
                key={page + 1}
                onClick={() => goToPage(page + 1)}
                className={`ml-[0.5rem] z-[1] w-[2rem] h-[2rem] flex justify-center items-center rounded-[0.25rem] ${
                  currentPage === page + 1
                    ? "bg-blue-700 text-white"
                    : "bg-white border border-solid border-[rgb(228, 229, 240)]"
                }`}
              >
                <div className="m-0 p-0 opacity-1 text-[13px] leading-[24px] overflow-hidden">
                  {page + 1}
                </div>
              </button>
            ))}

            <button
              onClick={nextPage}
              disabled={currentPage === maxPages}
              className={`${
                currentPage === maxPages ? "bg-gray-200" : "bg-white"
              } ml-[0.5rem] z-[1] w-[2rem] h-[2rem] flex justify-center items-center rounded-[0.25rem] border border-solid border-[rgb(228, 229, 240)]`}
            >
              <svg
                fill="none"
                viewBox="0 0 24 24"
                size={16}
                className="css-26qhcs"
                color="placeholder"
                height={16}
                width={16}
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.5 19L15.5 12L8.5 5"
                  stroke="#82869E"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
