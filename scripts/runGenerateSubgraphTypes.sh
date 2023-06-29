#!/bin/sh

if [[ "${VITE_ENVIRONMENT}" == "testnet" ]]; then
    export SUBGRAPH_GRAPHQL_ENDPOINT="https://api.thegraph.com/subgraphs/name/venusprotocol/venus-isolated-pools-chapel"
else
  export SUBGRAPH_GRAPHQL_ENDPOINT="https://api.thegraph.com/subgraphs/name/venusprotocol/venus-isolated-pools"
fi

echo '$SUBGRAPH_GRAPHQL_ENDPOINT'$SUBGRAPH_GRAPHQL_ENDPOINT

yarn graphql-code-generator --config ./src/clients/subgraph/codegen.ts
