import React from "react";
import Header from "./components/Header";
import InfoCard from "./components/InfoCard";
import PictureFame from "./components/PictureFame";

export default function View() {
  return (
    <>
      <div class="py-10">
        <Header />
      </div>
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <InfoCard />
            <PictureFame />
          </div>
        </div>
      </main>
    </>
  );
}
