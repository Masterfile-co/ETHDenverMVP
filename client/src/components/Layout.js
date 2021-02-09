import React from "react";
import Footer from "./Footer";
import Topbar from "./Topbar";

export default function Layout(props) {
  return (
    <div className="font-sans antialiased text-gray-900">
      <div>
        <div className="min-h-screen bg-white">
          <Topbar />
          {props.children}
          <Footer />
        </div>
      </div>
    </div>
  );
}
