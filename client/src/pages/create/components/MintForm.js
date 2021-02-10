import React, { useState } from "react";
import { useReactiveVar } from "@apollo/client";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useHistory } from "react-router-dom";

import { signerVar, contractVar, accountVar } from "../../../cache";

export default function MintForm() {
  const history = useHistory();
  let contract = useReactiveVar(contractVar);
  let signer = useReactiveVar(signerVar);
  let account = useReactiveVar(accountVar);
  const { enqueueSnackbar } = useSnackbar();
  const [loadingState, setLoadingState] = useState("Create Masterfile");
  const [artwork, setArtwork] = useState(null);
  const [state, setstate] = useState({
    name: "",
    description: "",
    first_name: "",
    last_name: "",
  });

  const handleChange = (event) => {
    let temp = { ...state };
    temp[event.target.name] = event.target.value;
    setstate(temp);
  };

  const handleFile = (event) => {
    setArtwork(event.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!account) {
      enqueueSnackbar(`Please connect wallet and sign in`, {
        variant: "warning",
      });
      return;
    }

    setLoadingState("Encrypting File");

    // Format data to send via POST

    const form = new FormData();
    let data = { ...state };
    form.append("creator", state.last_name + ", " + state.first_name);
    form.append("name", state.name);
    form.append("description", state.description);
    form.append("artwork", artwork);

    let config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    axios
      .post("http://localhost:5000", form, config)
      .then(async (res) => {
        setLoadingState("Minting Artwork");
        // Receive uri from server
        let uri = res.data.uri;

        // Mint token
        await contract.MintNFT(account, uri, false, 0);

        enqueueSnackbar(`Check your collection!`, {
          variant: "success",
        });
        setLoadingState("Create Masterfile");
        setstate({ name: "", description: "", first_name: "", last_name: "" });
        setArtwork(null);

        history.push("/collection");
      })
      .catch((err) => {
        console.log(err);
        enqueueSnackbar(`${err.message}`, {
          variant: "error",
        });
      });
  };

  return (
    <form
      className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8"
      action="#"
      method="POST"
    >
      <div>
        <label
          className="block text-sm font-medium leading-5 text-gray-700"
          htmlFor="first_name"
        >
          First name
        </label>
        <div className="mt-1">
          <input
            className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
            id="first_name"
            type="text"
            name="first_name"
            autoComplete="given-name"
            onChange={handleChange}
          />
        </div>
      </div>
      <div>
        <label
          className="block text-sm font-medium leading-5 text-gray-700"
          htmlFor="last_name"
        >
          Last name
        </label>
        <div className="mt-1">
          <input
            className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
            id="last_name"
            type="text"
            name="last_name"
            autoComplete="family-name"
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="sm:col-span-2">
        <label
          className="block text-sm font-medium leading-5 text-gray-700"
          htmlFor="company"
        >
          Masterfile Title
        </label>
        <div className="mt-1">
          <input
            className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
            id="title"
            type="text"
            name="name"
            autoComplete="organization"
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="sm:col-span-2">
        <label
          className="block text-sm font-medium leading-5 text-gray-700"
          htmlFor="email"
        >
          Artwork
        </label>
        <div className="mt-1">
          <input
            type="file"
            className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
            id="artwork"
            name="artwork"
            autoComplete="artwork"
            onChange={handleFile}
          />
        </div>
      </div>

      <div className="sm:col-span-2">
        <label
          className="block text-sm font-medium leading-5 text-gray-700"
          htmlFor="message"
        >
          Description
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <textarea
            className="py-3 px-4 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
            id="message"
            name="description"
            rows="4"
            onChange={handleChange}
          ></textarea>
        </div>
      </div>
      <div className="sm:col-span-2">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span
              className="bg-gray-200 relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:shadow-outline"
              role="checkbox"
              tabIndex="0"
              aria-checked="false"
            >
              <span
                className="translate-x-0 inline-block h-5 w-5 rounded-full bg-white shadow transform transition ease-in-out duration-200"
                aria-hidden="true"
              ></span>
            </span>
          </div>
          <div className="ml-3">
            <p className="text-base leading-6 text-gray-500">
              By selecting this, you agree to the{" "}
              <a className="font-medium text-gray-700 underline" href="#">
                Privacy Policy
              </a>{" "}
              and{" "}
              <a className="font-medium text-gray-700 underline" href="#">
                Cookie Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
      <div className="sm:col-span-2">
        <span className="w-full inline-flex rounded-md shadow-sm">
          <button
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition ease-in-out duration-150"
            type="button"
            disabled={false}
            onClick={handleSubmit}
          >
            {loadingState}
          </button>
        </span>
      </div>
    </form>
  );
}
