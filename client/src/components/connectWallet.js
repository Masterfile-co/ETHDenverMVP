import { ethers } from "ethers";
import { useReactiveVar } from "@apollo/client";
import Web3Modal from "web3modal";
import Masterfile from "../artifacts/contracts/Masterfile.json";

import {
  accountVar,
  ethVar,
  signerVar,
  providerVar,
  contractVar,
} from "../cache";

const providerOptions = {
  // fortmatic: {
  //   package: Fortmatic, // required
  //   options: {
  //     key: "FORTMATIC_KEY", // required
  //   },
  // },
  // walletconnect: {
  //   package: WalletConnectProvider, // required
  //   options: {
  //     infuraId: "INFURA_ID", // required
  //   },
  // },
};

export const web3Modal = new Web3Modal({
  cacheProvider: true,
  providerOptions,
});

export async function initWeb3(callback = null) {
  try {
    const eth = await web3Modal.connect();
    ethVar(eth);

    eth.on("accountsChanged", async (accounts) => {
      console.log("accounts changed");
      await web3Modal.clearCachedProvider();
      ethVar(null);
      accountVar(null);
      // initWeb3();
    });

    eth.on("chainChanged", (chainID) => {
      console.log("chain changed");
      // ethVar(null);
      initWeb3();
    });

    eth.on("disconnect", async (error) => {
      ethVar(null);
      console.log("disconnected");
      await web3Modal.clearCachedProvider();
    });

    // let web3 = await getWeb3();
    // updateWeb3("eth", eth);

    const provider = new ethers.providers.Web3Provider(eth);
    // const provider = new ethers.providers.JsonRpcProvider(
    //   "http://127.0.0.1:8545",
    //   // {chaindId: 5777, name: "local"}
    // );

    providerVar(provider);

    const signer = provider.getSigner();
    signerVar(signer);

    var contract = new ethers.Contract(
      process.env.REACT_APP_CONTRACT_ADDRESS,
      Masterfile.abi,
      provider
    );

    contract = contract.connect(signer);
    contractVar(contract);

    const account = await signer.getAddress();

    accountVar(account);
    if (callback) {
      callback(account);
    }

  } catch (error) {
    console.error(error);
  }
}
