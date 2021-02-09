import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { ApolloProvider } from "@apollo/client";

ReactDOM.render(
  // <ApolloProvider>
    <App />,
  // </ApolloProvider>,
  document.getElementById("root")
);

