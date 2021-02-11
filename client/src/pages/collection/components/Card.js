import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";

export default function Card({
  uri,
  id,
  forSale,
  setModalOpen,
  sale,
  setSale,
}) {
  let [data, setData] = useState(null);

  useEffect(() => {

    axios
      .get(process.env.REACT_APP_BUCKET_URL + uri + "_metadata.json")
      .then((res) => {
        setData(res.data);
      });

  }, []);

  async function handleSell() {
    let temp = { ...sale };
    temp.id = id;
    setSale(temp);
    setModalOpen(true);
  }

  return (
    <>
      <li className="col-span-1 flex flex-col text-center bg-white rounded-lg shadow">
        <div className="flex-1 flex flex-col p-8">
          <img
            className="w-48 h-48 flex-shrink-0 mx-auto bg-white"
            src={data?.properties?.thumbnail}
            alt=""
          />
          <h3 className="mt-6 text-gray-900 text-sm leading-5 font-medium">
            {data?.name}
          </h3>
          <dl className="mt-1 flex-grow flex flex-col justify-between">
            <dt className="sr-only">Artist</dt>
            <dd className="text-gray-500 text-sm leading-5">{data?.creator}</dd>
            <dt className="sr-only">Title</dt>
            <dt className="sr-only">Date of Creation</dt>
            <dd className="text-gray-500 text-sm leading-5">
              {moment.unix(data?.timestamp).format("MMMM Do YYYY")}
            </dd>
            <dt className="sr-only">Title</dt>
          </dl>
        </div>
        <div class="border-t border-gray-200">
          <div class="-mt-px flex">
            <div class="w-0 flex-1 flex border-r border-gray-200">
              <a
                class="relative -mr-px w-0 flex-1 inline-flex items-center justify-center py-4 text-sm leading-5 text-gray-700 font-medium border border-transparent hover:text-gray-500 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 focus:z-10 transition ease-in-out duration-150"
                href="/view"
              >
                <span class="ml-3">Open</span>
              </a>
            </div>
            <div class="-ml-px w-0 flex-1 flex">
              <button
                onClick={handleSell}
                disabled={forSale}
                class="relative w-0 flex-1 inline-flex items-center justify-center py-4 text-sm leading-5 text-gray-700 font-medium border border-transparent rounded-br-lg hover:text-gray-500 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 focus:z-10 transition ease-in-out duration-150"
              >
                <span class="ml-3">{forSale ? "( For Sale )" : "Sell"}</span>
              </button>
            </div>
          </div>
        </div>
      </li>
    </>
  );
}
