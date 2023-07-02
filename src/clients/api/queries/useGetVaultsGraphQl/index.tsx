import { useQuery } from '@apollo/client';
import config from 'config';
import { useMemo } from 'react';
import { Vault } from 'types';
import { areTokensEqual, getContractAddress } from 'utilities';

import {
  GetGeneralVaultInfosDocument,
  GetUserVaultInfosDocument,
  GetVaultBalancesDocument,
  GetVaultsDocument,
} from 'clients/ethGraphQl';
import { DEFAULT_REFETCH_INTERVAL_MS } from 'constants/defaultRefetchInterval';
import { TOKENS, VBEP_TOKENS } from 'constants/tokens';

import formatPools from './formatPools';

const xvsVaultProxyAddress = getContractAddress('xvsVaultProxy');
const vaiVaultAddress = getContractAddress('vaiVault');

const FIRST_VXVS_TOKEN_ADDRESS = Object.entries(VBEP_TOKENS).find(([_BepTokenAddress, vBepToken]) =>
  areTokensEqual(vBepToken.underlyingToken, TOKENS.xvs),
)![1].address;

const useGetVaultsGraphQl = ({ accountAddress }: { accountAddress?: string }) => {
  const {
    data: getGeneralVaultInfosData,
    error: getGeneralVaultInfosError,
    loading: isGetGeneralVaultInfosLoading,
  } = useQuery(GetGeneralVaultInfosDocument, {
    variables: {
      chainId: config.chainId,
      xvsTokenAddress: TOKENS.xvs.address,
      vXvsTokenAddress: FIRST_VXVS_TOKEN_ADDRESS,
    },
  });

  const poolCount = getGeneralVaultInfosData?.contracts.xvsVault.poolLength
    ? +getGeneralVaultInfosData?.contracts.xvsVault.poolLength
    : 0;

  const {
    data: getVaultsData,
    error: getVaultsError,
    loading: getVaultsLoading,
  } = useQuery(GetVaultsDocument, {
    variables: {
      chainId: config.chainId,
      poolInfosInputs: new Array(poolCount).fill(0).map((_, poolIndex) => ({
        arg0: TOKENS.xvs.address,
        arg1: poolIndex.toString(),
      })),
    },
    skip: !poolCount,
  });

  const {
    data: getUserVaultInfosData,
    error: getUserVaultInfosError,
    loading: getUserVaultInfosLoading,
  } = useQuery(GetUserVaultInfosDocument, {
    variables: {
      chainId: config.chainId,
      userAccountAddress: accountAddress || '',
      getUserInfoInputs: new Array(poolCount).fill(0).map((_, poolIndex) => ({
        _pid: poolIndex.toString(),
        _rewardToken: TOKENS.xvs.address,
        _user: accountAddress || '',
      })),
      pendingWithdrawalsBeforeUpgradeInputs: new Array(poolCount).fill(0).map((_, poolIndex) => ({
        _pid: poolIndex.toString(),
        _rewardToken: TOKENS.xvs.address,
        _user: accountAddress || '',
      })),
    },
    skip: !poolCount || !accountAddress,
    pollInterval: DEFAULT_REFETCH_INTERVAL_MS,
  });

  const vestingVaultStakedTokenAddresses =
    getVaultsData?.contracts.xvsVault.poolInfos_MULT.map(poolInfos => poolInfos.token) || [];

  const {
    data: getVaultBalancesData,
    error: getVaultBalancesError,
    loading: getVaultBalancesLoading,
  } = useQuery(GetVaultBalancesDocument, {
    variables: {
      chainId: config.chainId,
      vestingVaultStakedTokenAddresses,
      xvsVaultProxyAddress,
      vaiVaultAddress,
    },
    skip: vestingVaultStakedTokenAddresses.length === 0,
    pollInterval: DEFAULT_REFETCH_INTERVAL_MS,
  });

  const error =
    getGeneralVaultInfosError || getVaultsError || getUserVaultInfosError || getVaultBalancesError;

  const isLoading =
    isGetGeneralVaultInfosLoading ||
    getVaultsLoading ||
    getUserVaultInfosLoading ||
    getVaultBalancesLoading;

  const data: Vault[] = useMemo(
    () =>
      formatPools({
        getGeneralVaultInfosData,
        getVaultsData,
        getUserVaultInfosData,
        getVaultBalancesData,
      }),
    [getGeneralVaultInfosData, getVaultsData, getUserVaultInfosData, getVaultBalancesData],
  );

  return {
    error,
    isLoading,
    data,
  };
};

export default useGetVaultsGraphQl;
