import React from "react";

export default function Card({
  thumbnail,
  title,
  artist,
  purchasePrice,
  timestamp,
}) {
  return (
    <li className="col-span-1 flex flex-col text-center bg-white rounded-lg shadow">
      <div className="flex-1 flex flex-col p-8">
        <img
          className="w-32 h-32 flex-shrink-0 mx-auto bg-black"
          src={thumbnail}
          alt=""
        />
        <h3 className="mt-6 text-gray-900 text-sm leading-5 font-medium">
          {title}
        </h3>
        <dl className="mt-1 flex-grow flex flex-col justify-between">
          <dt className="sr-only">Artist</dt>
          <dd className="text-gray-500 text-sm leading-5">{artist}</dd>
          <dt className="sr-only">Title</dt>
          <dt className="sr-only">Date of Creation</dt>
          <dd className="text-gray-500 text-sm leading-5">{timestamp}</dd>
          <dt className="sr-only">Title</dt>
          <dd className="mt-3">
            <span className="px-2 py-1 text-teal-800 text-s leading-4 font-medium bg-teal-100 rounded-full">
              {purchasePrice} ETH
            </span>
          </dd>
        </dl>
      </div>
      <div className="border-t border-gray-200">
        <div className="-mt-px flex">
          <div className="-ml-px w-0 flex-1 flex">
            <a
              className="relative w-0 flex-1 inline-flex items-center justify-center py-4 text-sm leading-5 text-gray-700 font-medium border border-transparent rounded-br-lg hover:text-gray-500 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 focus:z-10 transition ease-in-out duration-150"
              href="#"
            >
              <span className="ml-3">Purchase</span>
            </a>
          </div>
        </div>
      </div>
    </li>
  );
}
