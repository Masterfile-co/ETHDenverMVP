import { useEffect } from "react";
import { accountVar } from "./cache";
import { useLazyQuery, useReactiveVar } from "@apollo/client";

export function useQueryWithAccount(QUERY) {
  let account = useReactiveVar(accountVar);

  let [sendQuery, { loading, error, data }] = useLazyQuery(QUERY);

  useEffect(() => {
    if (account) {
      sendQuery({ variables: { id: account.toLowerCase() } });
    }
    // eslint-disable-next-line
  }, [account]);

  if (error) {
    console.log(error);
  }

  return { loading, error, data };
}
