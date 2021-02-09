import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import Create from "./pages/create";

const BaseRouter = () => (
  <Switch>
    <Route path="/" exact component={Create} />
  </Switch>
);
export default BaseRouter;
