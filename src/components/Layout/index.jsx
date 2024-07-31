import React from "react";
import Header from "../Header";
import Footer from "../Footer";
import Discount from "../Discount";

export default function Layout({ children }) {
  return (
    <React.Fragment>
      <div className="w-full overflow-x-hidden">
        <Header />
        <div className="w-full pt-[10px]">
          {children}
        </div>
        <Discount />
        <Footer />
      </div>
    </React.Fragment>
  );
}
