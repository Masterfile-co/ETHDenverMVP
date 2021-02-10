import { ApolloClient, InMemoryCache, makeVar } from "@apollo/client";

export const client = new ApolloClient({
  uri: "https://localhost:8000",
  cache: new InMemoryCache(),
});

export const ethVar = makeVar(null);
export const accountVar = makeVar(null);
export const signerVar = makeVar(null);
export const providerVar = makeVar(null);
export const contractVar = makeVar(null);
