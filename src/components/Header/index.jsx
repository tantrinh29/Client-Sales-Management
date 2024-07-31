import React from "react";
import HeaderTop from "../HeaderTop";
import HeaderBottom from "../HeaderBottom";
import HeaderCenter from "../HeaderCenter";

export default function Header() {
  return (
    <div className="header-section-wrapper relative">
      <HeaderTop />
      <HeaderCenter />
      <HeaderBottom />
    </div>
  );
}
