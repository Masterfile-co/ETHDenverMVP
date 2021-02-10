import React from "react";
import { SnackbarProvider } from 'notistack';
import { BrowserRouter as Router } from "react-router-dom";
import BaseRouter from "./routes";
import Layout from "./components/Layout";

function App() {
  return (
    <div className="App">
      <Router>
        <SnackbarProvider>
          <Layout>
            <BaseRouter />
          </Layout>
        </SnackbarProvider>
      </Router>
    </div>
  );
}

export default App;
