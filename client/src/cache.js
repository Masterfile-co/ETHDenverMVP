import { ApolloClient, InMemoryCache, makeVar } from "@apollo/client";

export const client = new ApolloClient({
  uri: "http://127.0.0.1:8000/subgraphs/name/ghardin1314/Masterfile-EthDenver",
  cache: new InMemoryCache(),
});

export const ethVar = makeVar(null);
export const accountVar = makeVar(null);
export const signerVar = makeVar(null);
export const providerVar = makeVar(null);
export const contractVar = makeVar(null);
