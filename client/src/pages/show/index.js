import React from "react";
import { Helmet } from "react-helmet";

import Header from "./components/Header";
import Gaberiel from "../../images/gabrielsmall-Recovered.png";
import Dive from "../../images/GirlsclubAsia-Illustrator-Yuko-Shimizu-sva_poster3_dive_print_size.jpg";
import Card from "./components/Card";
import { useQuery } from "@apollo/client";
import { GET_FOR_SALE } from "./queries";

const MockData = [
  {
    title: "Gabriel",
    artist: "Peter Mohrbacher",
    timestamp: "April 3rd 2021",
    purchasePrice: "1.4",
    thumbnail:
      "https://hub.textile.io/ipns/bafzbeibtbalzgi3nb4yiej47mcaajsd6xcn6m3avygg6ycq67z3fulzw5e/0479b4ca-8f94-4f46-a686-9c95ce14a7ff_thumbnail.jpg",
  },
  {
    title: "Dive",
    artist: "Yuko Shimizu",
    timestamp: "February 14th 2021",
    purchasePrice: "10",
    thumbnail:
      "https://hub.textile.io/ipns/bafzbeibtbalzgi3nb4yiej47mcaajsd6xcn6m3avygg6ycq67z3fulzw5e/0479b4ca-8f94-4f46-a686-9c95ce14a7ff_thumbnail.jpg",
  },
];

export default function Show() {
  let { data } = useQuery(GET_FOR_SALE);

  console.log(data);

  return (
    <div class="py-10">
      <Helmet>
        <meta charSet="utf-8" />
        <title>Masterfile | Show</title>
      </Helmet>
      <Header />
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <ul class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {data?.msts?.map((work, key) => (
                <Card
                  key={key}
                  uri={work.uri}
                  id={work.id}
                  purchasePrice={work.salePrice}
                  // offered={work.offeringBuyer ? true : false}
                  offered={false}
                />
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
