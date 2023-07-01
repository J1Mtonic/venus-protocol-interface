import type { CodegenConfig } from '@graphql-codegen/cli';
import { createSchema } from 'eth-graphql';
import { printSchema } from 'graphql';

import ethGraphQlConfig from './ethGraphQl';

const config: CodegenConfig = {
  overwrite: true,
  schema: printSchema(createSchema(ethGraphQlConfig)),
  documents: ['src/clients/api/queries/**/*.graphql'],
  generates: {
    './src/clients/ethGraphQl/gql/': {
      preset: 'client',
      plugins: [],
      config: {
        scalars: {
          BigInt: 'string',
        },
      },
    },
  },
};

export default config;
