import { createContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCart } from "../stores/cart/actions";
import Aos from "aos";
import "aos/dist/aos.css";

export const AppContext = createContext({});

export function AppContextProvider({ children }) {
  const dispatch = useDispatch();
  const { carts } = useSelector((state) => state.cart);
  const { accessToken, refreshToken, user } = useSelector(
    (state) => state.auth
  );
  const { orders } = useSelector((state) => state.order);
  const { coupons, discounts } = useSelector((state) => state.coupon);
  const { address, isEditAddress } = useSelector((state) => state.address);
  useEffect(() => {
    if (accessToken) {
      dispatch(getCart());
    }
  }, [accessToken]);
  useEffect(() => {
    Aos.init();
  }, []);
  return (
    <AppContext.Provider
      value={{
        accessToken,
        refreshToken,
        carts,
        user,
        order: orders,
        coupons,
        discounts,
        billings: address,
        isEditAddress,

      }}
    >
      {children}
    </AppContext.Provider>
  );
}
