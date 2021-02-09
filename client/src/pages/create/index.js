import React from "react";
import Header from "./components/Header";
import MintForm from "./components/MintForm";

export default function Create() {
  return (
    <div class="py-10">
      <Header />
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <div class="bg-white py-16 px-4 overflow-hidden sm:px-6 lg:px-8 lg:py-24">
              <div class="relative max-w-xl mx-auto">
                <svg
                  class="absolute left-full transform translate-x-1/2"
                  width="404"
                  height="404"
                  fill="none"
                  viewBox="0 0 404 404"
                >
                  <defs>
                    <pattern
                      id="85737c0e-0916-41d7-917f-596dc7edfa27"
                      x="0"
                      y="0"
                      width="20"
                      height="20"
                      patternUnits="userSpaceOnUse"
                    >
                      <rect
                        class="text-gray-200"
                        x="0"
                        y="0"
                        width="4"
                        height="4"
                        fill="currentColor"
                      ></rect>
                    </pattern>
                  </defs>
                  <rect
                    width="404"
                    height="404"
                    fill="url(#85737c0e-0916-41d7-917f-596dc7edfa27)"
                  ></rect>
                </svg>
                <svg
                  class="absolute right-full bottom-0 transform -translate-x-1/2"
                  width="404"
                  height="404"
                  fill="none"
                  viewBox="0 0 404 404"
                >
                  <defs>
                    <pattern
                      id="85737c0e-0916-41d7-917f-596dc7edfa27"
                      x="0"
                      y="0"
                      width="20"
                      height="20"
                      patternUnits="userSpaceOnUse"
                    >
                      <rect
                        class="text-gray-200"
                        x="0"
                        y="0"
                        width="4"
                        height="4"
                        fill="currentColor"
                      ></rect>
                    </pattern>
                  </defs>
                  <rect
                    width="404"
                    height="404"
                    fill="url(#85737c0e-0916-41d7-917f-596dc7edfa27)"
                  ></rect>
                </svg>
                <div class="text-center">
                  <h2 class="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10">
                    Select Artwork
                  </h2>
                  <p class="mt-4 text-lg leading-6 text-gray-500">
                    Upload and Describe Your Masterfile
                  </p>
                </div>
                <div class="mt-12">
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
