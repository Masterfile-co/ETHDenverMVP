import React, { useEffect, useState } from "react";
import axios from "axios";
import Art from "../../../images/GirlsclubAsia-Illustrator-Yuko-Shimizu-sva_poster3_dive_print_size.jpg";
import { useReactiveVar } from "@apollo/client";

import { accountVar } from "../../../cache";

export default function PictureFame({ uri, imgUrl }) {
  let [src, setSrc] = useState(null);
  let [srcType, setsrcType] = useState(null);
  let account = useReactiveVar(accountVar);

  function _imageEncode(arrayBuffer) {
    let u8 = new Uint8Array(arrayBuffer);
    let b64encoded = btoa(
      [].reduce.call(
        new Uint8Array(arrayBuffer),
        function (p, c) {
          return p + String.fromCharCode(c);
        },
        ""
      )
    );
    let mimetype = "image/jpeg";
    return "data:" + mimetype + ";base64," + b64encoded;
  }

  useEffect(() => {
    if (uri && imgUrl) {
      axios
        .get("http://localhost:5000/", {
          responseType: 'arraybuffer',
          params: {
            user: account,
            password: "testtesttesttest",
            label: uri,
            frmt: "png",
          },
        })
        .then((res) => {
          var img = Buffer.from(res.data, "binary").toString("base64");

          setSrc(
            `data:${res.headers["content-type"].toLowerCase()};base64,${img}`
          );
        });
    }
  }, [uri, imgUrl]);

  console.log(src);

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
                    src={src}
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
