import { gql } from "@apollo/client";

export const GET_TOKEN_VIEW = gql`
  query getTokenView($id: ID!) {
    mst(id: $id) {
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
