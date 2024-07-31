import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { AppContext } from "../../contexts/AppContextProvider";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { orders } from "../../stores/order/actions";
import { useDispatch } from "react-redux";
import createNotification from "../../utils/notification";
import Layout from "../../components/Layout";
import { URL_CONSTANTS } from "../../constants/url.constants";
export default function OrderPage() {
  const { order } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isCheckOrder, setIsCheckOrder] = useState();
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const dispatch = useDispatch();
  const paymentMethod = useMemo(
    () => queryParams.get("payment"),
    [queryParams]
  );

  const paymentMomo = useMemo(
    () => ({
      partnerCode: queryParams.get("partnerCode"),
      orderId: queryParams.get("orderId"),
      requestId: queryParams.get("requestId"),
      amount: queryParams.get("amount"),
      orderInfo: queryParams.get("orderInfo"),
      orderType: queryParams.get("orderType"),
      transId: queryParams.get("transId"),
      message: queryParams.get("message"),
    }),
    [queryParams]
  );

  const paymentVnpay = useMemo(
    () => ({
      vnp_Amount: queryParams.get("vnp_Amount"),
      vnp_BankCode: queryParams.get("vnp_BankCode"),
      vnp_BankTranNo: queryParams.get("vnp_BankTranNo"),
      vnp_CardType: queryParams.get("vnp_CardType"),
      vnp_OrderInfo: queryParams.get("vnp_OrderInfo"),
      vnp_TransactionNo: queryParams.get("vnp_TransactionNo"),
    }),
    [queryParams]
  );

  const dispatchOrder = useCallback(async () => {
    const data = {
      ...order,
      ...(paymentMomo && paymentMomo.transId !== null ? { paymentMomo } : {}),
      ...(paymentVnpay && paymentVnpay.vnp_BankTranNo !== null
        ? { paymentVnpay }
        : {}),
    };
    try {
      const response = await dispatch(orders(data, paymentMethod));
      if (response.status === true) {
        setIsCheckOrder(response);
      } else {
        setIsCheckOrder(response);
        navigate(`/checkout/${uuidv4()}`);
      }
    } catch (error) {
      console.error(error);
      setIsCheckOrder(response);
      navigate(`/checkout/${uuidv4()}`);
    }
  }, [dispatch, order, paymentMomo, paymentVnpay, paymentMethod]);

  useEffect(() => {
    dispatchOrder();
  }, []);

  console.log(isCheckOrder);

  return (
    <Layout>
      <div className="bg-gray-100">
        <div className="bg-white p-6  md:mx-auto">
          {isCheckOrder?.status === true ? (
            <svg
              viewBox="0 0 24 24"
              className="text-green-600 w-16 h-16 mx-auto my-6"
            >
              <path
                fill="currentColor"
                d="M12,0A12,12,0,1,0,24,12,12.014,12.014,0,0,0,12,0Zm6.927,8.2-6.845,9.289a1.011,1.011,0,0,1-1.43.188L5.764,13.769a1,1,0,1,1,1.25-1.562l4.076,3.261,6.227-8.451A1,1,0,1,1,18.927,8.2Z"
              ></path>
            </svg>
          ) : isCheckOrder?.status === false ? (
            <svg className="w-16 h-16 mx-auto my-6" viewBox="0 0 512 512">
              <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z" />
            </svg>
          ) : (
            <svg className="w-16 h-16 mx-auto my-6" viewBox="0 0 512 512">
              <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z" />
            </svg>
          )}

          <div className="text-center">
            <h3 className="md:text-2xl text-base text-gray-900 font-semibold text-center">
              {isCheckOrder?.status === true
                ? isCheckOrder?.message
                : isCheckOrder?.status === false
                ? isCheckOrder?.message
                : "Loading"}
            </h3>
            <p className="text-gray-600 my-2">
              Thank you for completing your secure online payment.
            </p>
            <p> Have a great day!</p>
            <div className="py-10 text-center">
              <Link
                to={URL_CONSTANTS.HOME}
                className="px-12 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3"
              >
                GO BACK
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
