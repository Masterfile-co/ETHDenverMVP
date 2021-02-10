import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import { ethers } from "ethers";
import { useSnackbar } from "notistack";
import { useReactiveVar } from "@apollo/client";
import { contractVar } from "../../../cache";
import BigNumber from "bignumber.js";

export default function Card({ uri, id, purchasePrice, offered }) {
  let [data, setData] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  let contract = useReactiveVar(contractVar);

  async function handleBuy() {
    let fee = new BigNumber("50000000000").multipliedBy(365).multipliedBy(3);
    let value = new BigNumber(purchasePrice).plus(fee);
    console.log(value);

    contract
      .requestBuy(id, { value: value.toFixed() })
      .then((res) => {
        enqueueSnackbar(`Successfully offered for sale!`, {
          variant: "success",
        });
      })
      .catch((err) => {
        console.log(err);
        enqueueSnackbar(`${err.data.message}`, {
          variant: "error",
        });
      });
  }

  useEffect(() => {
    // axios.get(process.env.REACT_APP_BUCKET_URL+uri).then((res) => {
    //   console.log(res);
    //   setData(res.data);
    // });
    axios
      .get(
        "https://hub.textile.io/ipns/bafzbeih4na564d2fifrz22kqlqmfhbrlxokggjelmw6rnecxlb3g5o5iyy/ac489a4f-38de-43da-b74c-af47273be1df_metadata.json"
      )
      .then((res) => {
        console.log(res);
        setData(res.data);
      });
  }, []);

  return (
    <li className="col-span-1 flex flex-col text-center bg-white rounded-lg shadow">
      <div className="flex-1 flex flex-col p-8">
        <img
          className="w-32 h-32 flex-shrink-0 mx-auto bg-black"
          // src={data?.properties?.thumbnail}
          src={
            "https://hub.textile.io/ipns/bafzbeih4na564d2fifrz22kqlqmfhbrlxokggjelmw6rnecxlb3g5o5iyy/ac489a4f-38de-43da-b74c-af47273be1df_thumbnail.jpg"
          }
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
          <dd className="mt-3">
            <span className="px-2 py-1 text-teal-800 text-s leading-4 font-medium bg-teal-100 rounded-full">
              {ethers.utils.formatEther(purchasePrice).toString()} ETH
            </span>
          </dd>
        </dl>
      </div>
      <div className="border-t border-gray-200">
        <div className="-mt-px flex">
          <div className="-ml-px w-0 flex-1 flex">
            <button
              className="relative w-0 flex-1 inline-flex items-center justify-center py-4 text-sm leading-5 text-gray-700 font-medium border border-transparent rounded-br-lg hover:text-gray-500 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 focus:z-10 transition ease-in-out duration-150"
              disabled={offered}
              onClick={handleBuy}
            >
              <span className="ml-3">
                {offered ? "Offer Made" : "Purchase"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
