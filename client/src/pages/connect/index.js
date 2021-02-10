import React, { useState, useEffect } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { useSnackbar } from "notistack";

import { initWeb3 } from "../../components/connectWallet";
import Logo from "../../images/Masterfile-LogoSymbol-Purple.png";
import { Helmet } from "react-helmet";
import { useReactiveVar } from "@apollo/client";
import { accountVar } from "../../cache";

export default function Connect() {
  const [state, setState] = useState("");
  const [password, setPassword] = useState("");
  const account = useReactiveVar(accountVar);
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();

  const handleChange = (event) => {
    setPassword(event.target.value);
  };

  const pushPassword = (accountAddress) => {
    // console.log(password);
    // console.log(account);
    axios
      .post("http://localhost:5000/login", {
        password,
        account: accountAddress,
      })
      .then((res) => {
        console.log(res);
        // Store password locally
        enqueueSnackbar(`${res.data.message}`, {
          variant: "success",
        });
        console.log(res);
        localStorage.setItem(`PW-${account}`, password);
        setState("");
        setPassword("");
        history.push("/");
      })
      .catch((err) => {
        console.log(err);
        enqueueSnackbar(`${err.message}`, {
          variant: "error",
        });
      });
  };

  const handleSubmit = async () => {
    setState("Processing");

    if (!account) {
      await initWeb3(pushPassword);
    }

    // check if length of password > 16 characters
    // if (!account) {
    //   console.log("Connect Account first");
    //   return;
    // }
  };

  return (
    <div class="min-h-full flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <meta charSet="utf-8" />
        <title>Masterfile | Connect Wallet</title>
      </Helmet>
      <div class="max-w-md w-full">
        <div>
          <img class="mx-auto w-auto h-20" src={Logo} alt="" />
          <h2 class="mt-6 text-center text-3xl leading-9 font-extrabold text-gray-900">
            Connect your wallet
          </h2>
          <p class="mt-2 text-center text-sm leading-5 text-gray-600">
            <span></span>
            <span
              class="ml-1 font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline transition ease-in-out duration-150"
              href="#"
            >
              and choose a password to sign up
            </span>
          </p>
        </div>
        <div class="mt-8">
          <input type="hidden" name="remember" />
          <div class="rounded-md shadow-sm">
            <div class="-mt-px">
              <input
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300 focus:z-10 sm:text-sm sm:leading-5"
                aria-label="Password"
                name="password"
                type="password"
                required=""
                placeholder="Password"
                onChange={handleChange}
              />
            </div>
          </div>
          <div class="mt-6">
            <button
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition duration-150 ease-in-out"
              onClick={handleSubmit}
              // disabled={password.length < 16}
            >
              <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg
                  class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400 transition ease-in-out duration-150"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </span>
              <span class="">
                {state === "Processing" ? "Processing" : "Connect"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
