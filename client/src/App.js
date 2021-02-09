import React from "react";

import { BrowserRouter as Router } from "react-router-dom";
import BaseRouter from "./routes";
import Layout from "./components/Layout";

function App() {
  return (
    <div className="App">
      <Router>
        <Layout>
          <BaseRouter />
        </Layout>
      </Router>
    </div>
  );
}

export default App;
