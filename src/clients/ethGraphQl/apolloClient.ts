import { ApolloClient, InMemoryCache } from '@apollo/client';
import { createLink } from 'eth-graphql';

import config from 'config/ethGraphQl';

const link = createLink(config);

export const apolloClient = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      contracts: {
        merge: true,
      },
      xvsVault: {
        merge: true,
      },
      vaiVault: {
        merge: true,
      },
      comptroller: {
        merge: true,
      },
      venusLens: {
        merge: true,
      },
      vai: {
        merge: true,
      },
      bep20: {
        merge: true,
      },
    },
  }),
  link,
});
