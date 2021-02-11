import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import Collection from "./pages/collection";
import Connect from "./pages/connect";
import Create from "./pages/create";
import Show from "./pages/show";
import View from "./pages/view";

const BaseRouter = () => (
  <Switch>
    <Route path="/connect" component={Connect} />
    <Route path="/show" component={Show} />
    <Route path="/collection" component={Collection} />
    <Route path="/view/:tokenId" component={View} />
    <Route path="/" exact component={Create} />
  </Switch>
);
export default BaseRouter;
