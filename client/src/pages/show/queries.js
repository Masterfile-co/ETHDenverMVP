import { gql } from "@apollo/client";

export const GET_FOR_SALE = gql`
  query getForSale {
    msts(where: { forSale: true }) {
      id
      uri
      forSale
      salePrice
      offeringBuyer {
        id
      }
      owner {
        id
      }
      creator {
        id
      }
    }
  }
`;
