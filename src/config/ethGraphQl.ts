import xvsVaultInfo from '@venusprotocol/venus-protocol/artifacts/contracts/XVSVault/XVSVault.sol/XVSVault.json';
import { Config } from 'eth-graphql';
import { providers } from 'ethers';
import sample from 'lodash/sample';

import bep20Abi from '../constants/contracts/abis/bep20.json';
import mainContractAddresses from '../constants/contracts/addresses/main.json';
import { RPC_URLS } from '../constants/endpoints';

import { BscChainId } from '../types';

const mainnetProvider = new providers.JsonRpcProvider(
  sample(RPC_URLS[BscChainId.MAINNET]) as string,
);
const testnetProvider = new providers.JsonRpcProvider(
  sample(RPC_URLS[BscChainId.TESTNET]) as string,
);

const ethGraphQlConfig: Config = {
  chains: {
    [BscChainId.MAINNET]: {
      provider: mainnetProvider,
    },
    [BscChainId.TESTNET]: {
      provider: testnetProvider,
    },
  },
  contracts: [
    {
      name: 'xvsVault',
      address: {
        [BscChainId.MAINNET]: mainContractAddresses.xvsVaultProxy[BscChainId.MAINNET],
        [BscChainId.TESTNET]: mainContractAddresses.xvsVaultProxy[BscChainId.TESTNET],
      },
      abi: xvsVaultInfo.abi,
    },
    {
      name: 'bep20',
      abi: bep20Abi,
    },
  ],
};

export default ethGraphQlConfig;
