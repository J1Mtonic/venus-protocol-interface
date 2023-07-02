import { ApolloClient, InMemoryCache } from '@apollo/client';
import { createLink } from 'eth-graphql';

import config from 'config/ethGraphQl';

const link = createLink(config);

export const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link,
});
