import React from "react";
import { COLOR } from "../../constants/style.constants";

export default function Discount() {
  return (
    <div
        className="discount-banner w-full h-[307px] bg-cover flex justify-center items-center "
        style={{
          background:
            'url("https://shopo-next.vercel.app/assets/images/discount-banner-1.jpg") 0% 0% / cover no-repeat',
        }}
      >
        <div>
          <div data-aos="fade-up" className="aos-init aos-animate">
            <h1 className="sm:text-3xl text-xl font-700 text-qblack mb-2 text-center font-bold">
              Nhận phiếu giảm giá <span className="mx-1 text-blue-500 font-bold">20%</span>
            </h1>
            <p className="text-center sm:text-[18px] text-sm font-400">
              bằng cách đăng kí Email với chúng tôi
            </p>
          </div>
          <div
            data-aos="fade-right"
            className="sm:w-[543px] w-[300px] h-[54px] flex mt-8 aos-init aos-animate "
          >
            <div className="flex-1 bg-white pl-4 flex space-x-2 items-center h-full focus-within:text-qyellow text-qblack rounded-l-lg">
              <span>
                <svg
                  width={17}
                  height={15}
                  viewBox="0 0 17 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 14H2C1.4 14 1 13.6 1 13V2C1 1.4 1.4 1 2 1H15C15.6 1 16 1.4 16 2V13C16 13.6 15.6 14 15 14Z"
                    stroke="currentColor"
                    strokeMiterlimit={10}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 4L8.5 8.5L14 4"
                    stroke="currentColor"
                    strokeMiterlimit={10}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <input
                type="email"
                name="email"
                className="w-full h-full focus:outline-none text-sm placeholder:text-xs placeholder:text-qblack text-qblack font-400 tracking-wider"
                placeholder="Địa chỉ email"
              />
            </div>
            <button
              type="button"
              className="sm:w-[158px] w-[80px] h-full bg-amber-400 text-sm font-bold rounded-r-lg"
              style={{background: COLOR.BLUE}}
            >
             <a className="text-white">Nhận phiếu giảm giá</a> 
            </button>
          </div>
        </div>
      </div>
  );
}
