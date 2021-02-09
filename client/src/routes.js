import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import Connect from "./pages/connect";
import Create from "./pages/create";

const BaseRouter = () => (
  <Switch>
    <Route path="/connect" component={Connect} />
    <Route path="/" exact component={Create} />
  </Switch>
);
export default BaseRouter;
