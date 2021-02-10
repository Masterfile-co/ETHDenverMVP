import React, { useState } from "react";
import { Helmet } from "react-helmet";
import Card from "./components/Card";
import Header from "./components/Header";
import { GET_USER_COLLECTION } from "./queries";
import { useQueryWithAccount } from "../../hooks";
import SellModal from "../../components/SellModal";
import { useReactiveVar } from "@apollo/client";
import { contractVar } from "../../cache";
import { ethers } from "ethers";
import { useSnackbar } from "notistack";

const MockData = [
  {
    title: "Gabriel",
    artist: "Peter Mohrbacher",
    timestamp: "April 3rd 2021",
    purchasePrice: "1.4",
    thumbnail:
      "https://hub.textile.io/ipns/bafzbeibtbalzgi3nb4yiej47mcaajsd6xcn6m3avygg6ycq67z3fulzw5e/0479b4ca-8f94-4f46-a686-9c95ce14a7ff_thumbnail.jpg",
  },
  {
    title: "Dive",
    artist: "Yuko Shimizu",
    timestamp: "February 14th 2021",
    purchasePrice: "10",
    thumbnail:
      "https://hub.textile.io/ipns/bafzbeibtbalzgi3nb4yiej47mcaajsd6xcn6m3avygg6ycq67z3fulzw5e/0479b4ca-8f94-4f46-a686-9c95ce14a7ff_thumbnail.jpg",
  },
];

export default function Collection() {
  const { data } = useQueryWithAccount(GET_USER_COLLECTION);
  let [modalOpen, setModalOpen] = useState(false);
  let [sale, setSale] = useState({ id: null, salePrice: 0 });
  const { enqueueSnackbar } = useSnackbar();
  let contract = useReactiveVar(contractVar);

  async function handleSell() {
    contract
      .OfferForSale(
        sale.id,
        ethers.utils.parseEther(sale.salePrice.toString()).toString()
      )
      .then((res) => {
        enqueueSnackbar(`Successfully offered for sale!`, {
          variant: "success",
        });
        setSale = { id: null, salePrice: 0 };
        setModalOpen(false);
      })
      .catch((err) => {
        console.log(err);
        enqueueSnackbar(`${err.data.message}`, {
          variant: "error",
        });
      });
  }

  return (
    <div class="py-10">
      {modalOpen ? (
        <SellModal
          sale={sale}
          setSale={setSale}
          handleSell={handleSell}
          onCancel={() => {
            setModalOpen(false);
          }}
        />
      ) : null}

      <Helmet>
        <meta charSet="utf-8" />
        <title>Masterfile | Collection</title>
      </Helmet>
      <Header />
      <main>
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div class="px-4 py-8 sm:px-0">
            <ul class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {data?.msts?.map((work, key) => (
                <Card
                  key={key}
                  forSale={work.forSale}
                  uri={work.uri}
                  id={work.id}
                  setModalOpen={setModalOpen}
                  sale={sale}
                  setSale={setSale}
                />
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
