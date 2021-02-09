import React from "react";
import Art from "../../../images/GirlsclubAsia-Illustrator-Yuko-Shimizu-sva_poster3_dive_print_size.jpg";

export default function PictureFame() {
  return (
    <div className="bg-white overflow-hidden mt-2">
      <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div>
          <div className="relative mb-8 lg:mb-0 lg:row-start-1 lg:col-start-2">
            <svg
              className="hidden lg:block absolute top-0 right-0 -mt-20 -mr-20"
              width="404"
              height="384"
              fill="none"
              viewBox="0 0 404 384"
            >
              <defs>
                <pattern
                  id="de316486-4a29-4312-bdfc-fbce2132a2c1"
                  x="0"
                  y="0"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <rect
                    className="text-gray-200"
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
                height="384"
                fill="url(#de316486-4a29-4312-bdfc-fbce2132a2c1)"
              ></rect>
            </svg>
            <div className="relative text-base mx-auto max-w-prose lg:max-w-none">
              <figure>
                <div className="relative pb-7/12 lg:pb-0">
                  <img
                    className="rounded-lg shadow-lg object-cover object-center absolute inset-0 w-full h-full lg:static lg:h-auto"
                    src={Art}
                    alt=""
                    width="1184"
                    height="1376"
                  />
                </div>
              </figure>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
