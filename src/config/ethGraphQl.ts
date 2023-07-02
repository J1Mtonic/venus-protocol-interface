import comptrollerInfo from '@venusprotocol/venus-protocol/artifacts/contracts/Comptroller/Comptroller.sol/Comptroller.json';
import venusLensInfo from '@venusprotocol/venus-protocol/artifacts/contracts/Lens/VenusLens.sol/VenusLens.json';
import vaiVaultInfo from '@venusprotocol/venus-protocol/artifacts/contracts/Vault/VAIVault.sol/VAIVault.json';
import xvsVaultInfo from '@venusprotocol/venus-protocol/artifacts/contracts/XVSVault/XVSVault.sol/XVSVault.json';
import mainnetContractInfos from '@venusprotocol/venus-protocol/networks/mainnet.json';
import testnetContractInfos from '@venusprotocol/venus-protocol/networks/testnet.json';
import { Config } from 'eth-graphql';
import { providers } from 'ethers';
import sample from 'lodash/sample';

import bep20Abi from '../constants/contracts/abis/bep20.json';
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
      // TODO: deploy and use custom multicall address (none exists on mainnet)
      provider: mainnetProvider,
    },
    [BscChainId.TESTNET]: {
      // TODO: deploy and use custom multicall address (none exists on testnet)
      provider: testnetProvider,
    },
  },
  contracts: [
    {
      name: 'xvsVault',
      address: {
        [BscChainId.MAINNET]: mainnetContractInfos.Contracts.XVSVaultProxy,
        [BscChainId.TESTNET]: testnetContractInfos.Contracts.XVSVaultProxy,
      },
      abi: xvsVaultInfo.abi,
    },
    {
      name: 'vaiVault',
      address: {
        [BscChainId.MAINNET]: mainnetContractInfos.Contracts.VAIVaultProxy,
        [BscChainId.TESTNET]: testnetContractInfos.Contracts.VAIVaultProxy,
      },
      abi: vaiVaultInfo.abi,
    },
    {
      name: 'comptroller',
      address: {
        [BscChainId.MAINNET]: mainnetContractInfos.Contracts.Unitroller,
        [BscChainId.TESTNET]: testnetContractInfos.Contracts.Unitroller,
      },
      abi: comptrollerInfo.abi,
    },
    {
      name: 'venusLens',
      address: {
        [BscChainId.MAINNET]: mainnetContractInfos.Contracts.VenusLens,
        [BscChainId.TESTNET]: testnetContractInfos.Contracts.VenusLens,
      },
      abi: venusLensInfo.abi,
    },
    {
      name: 'bep20',
      abi: bep20Abi,
    },
    {
      name: 'vai',
      address: {
        [BscChainId.MAINNET]: mainnetContractInfos.Contracts.VAI,
        [BscChainId.TESTNET]: testnetContractInfos.Contracts.VAI,
      },
      abi: bep20Abi,
    },
  ],
};

export default ethGraphQlConfig;
