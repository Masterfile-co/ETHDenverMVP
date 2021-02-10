import { useReactiveVar } from "@apollo/client";
import React, { useEffect } from "react";

import { web3Modal, initWeb3 } from "./connectWallet";

import { accountVar } from "../cache";
import Logo from "../images/Masterfile-LogoSymbol-Purple.png";

export default function Topbar() {
  let account = useReactiveVar(accountVar);

  async function _init() {
    if (web3Modal.cachedProvider) {
      initWeb3();
    }
  }

  useEffect(() => {
    _init();
    // eslint-disable-next-line
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <img className="block lg:hidden w-auto h-12" src={Logo} alt="" />
              <img className="hidden lg:block h-8 w-auto" src={Logo} alt="" />
            </div>
            <div className="hidden sm:-my-px sm:ml-6 sm:flex">
              <a
                selected
                className="ml-8 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out"
                href="/"
              >
                Create
              </a>
              <a
                className="ml-8 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out"
                href="/show"
              >
                Show
              </a>
              <a
                className="ml-8 inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium leading-5 text-gray-500 hover:text-gray-700 hover:border-gray-300 focus:outline-none focus:text-gray-700 focus:border-gray-300 transition duration-150 ease-in-out"
                href="/collection"
              >
                Collection
              </a>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="w-full flex rounded-md shadow-sm">
              <a
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo active:bg-indigo-700 transition ease-in-out duration-150"
                href="/connect"
              >
                {account ? account : "Connect Wallet"}
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
