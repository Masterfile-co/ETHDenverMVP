import React from "react";
import { Helmet } from "react-helmet";

import MintForm from "./components/MintForm";
import SVG1 from "./components/SVG1";
import SVG2 from "./components/SVG2";

export default function Create() {
  return (
    <div className="py-10">
      <Helmet>
        <meta charSet="utf-8" />
        <title>Masterfile | Create Masterfile</title>
      </Helmet>
      <header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold leading-tight text-gray-900">
            CREATE MASTERFILE
          </h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="px-4 py-8 sm:px-0">
            <div className="bg-white py-16 px-4 overflow-hidden sm:px-6 lg:px-8 lg:py-24">
              <div className="relative max-w-xl mx-auto">
                <SVG1 />
                <SVG2 />
                <div className="text-center">
                  <h2 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10">
                    Select Artwork
                  </h2>
                  <p className="mt-4 text-lg leading-6 text-gray-500">
                    Upload and Describe Your Masterfile
                  </p>
                </div>
                <div className="mt-12">
                  <MintForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
