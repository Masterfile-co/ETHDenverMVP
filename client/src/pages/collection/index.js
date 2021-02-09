import React from "react";
import Card from "./components/Card";
import Header from "./components/Header";

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

export default function Collection() {
  return (
    <div class="py-10">
      <Header />
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <ul class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {MockData.map((work, key) => (
                <Card
                  title={work.title}
                  artist={work.artist}
                  thumbnail={work.thumbnail}
                  timestamp={work.timestamp}
                  purchasePrice={work.purchasePrice}
                />
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
