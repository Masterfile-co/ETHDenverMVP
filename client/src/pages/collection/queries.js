import { gql } from "@apollo/client";

export const GET_USER_COLLECTION = gql`
  query getUserCollection($id: ID!) {
    msts(where: { owner: $id }) {
      id
      uri
      forSale
      owner {
        id
      }
      creator {
        id
      }
    }
  }
`;
