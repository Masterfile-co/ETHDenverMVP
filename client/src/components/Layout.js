import React from "react";
import Footer from "./Footer";
import Topbar from "./Topbar";

export default function Layout(props) {
  return (
    <body class="min-h-screen bg-white">
      <Topbar />
      {props.children}
      <Footer />
    </body>
  );
}
