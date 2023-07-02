import BigNumber from 'bignumber.js';
import { Vault } from 'types';
import { convertWeiToTokens, getTokenByAddress } from 'utilities';

import {
  GetGeneralVaultInfosQuery,
  GetUserVaultInfosQuery,
  GetVaultBalancesQuery,
  GetVaultsQuery,
} from 'clients/ethGraphQl';
import { BLOCKS_PER_DAY } from 'constants/bsc';
import { DAYS_PER_YEAR } from 'constants/daysPerYear';
import { TOKENS } from 'constants/tokens';

const formatPools = ({
  getGeneralVaultInfosData,
  getVaultsData,
  getVaultBalancesData,
  getUserVaultInfosData,
}: {
  getGeneralVaultInfosData?: GetGeneralVaultInfosQuery;
  getVaultsData?: GetVaultsQuery;
  getVaultBalancesData?: GetVaultBalancesQuery;
  getUserVaultInfosData?: GetUserVaultInfosQuery;
}) => {
  if (!getGeneralVaultInfosData || !getVaultsData || !getVaultBalancesData) {
    return [];
  }

  const vestingVaults: Vault[] = getVaultsData.contracts.xvsVault.poolInfos_MULT.map<Vault>(
    (poolInfos, poolIndex) => {
      const stakedToken = getTokenByAddress(poolInfos.token)!;
      const rewardToken = TOKENS.xvs;
      const lockingPeriodMs = +poolInfos.lockPeriod * 1000;

      const rewardWeiPerBlock = new BigNumber(
        getGeneralVaultInfosData.contracts.xvsVault.rewardTokenAmountsPerBlock,
      )
        .multipliedBy(poolInfos.allocPoint)
        .div(getGeneralVaultInfosData.contracts.xvsVault.totalAllocPoints);

      const dailyEmissionWei = rewardWeiPerBlock.multipliedBy(BLOCKS_PER_DAY);

      const totalStakedWei = new BigNumber(
        getVaultBalancesData.contracts.vestingVaultStakedTokens[poolIndex].balanceOf,
      );

      const stakingAprPercentage = dailyEmissionWei
        .multipliedBy(DAYS_PER_YEAR)
        .div(totalStakedWei)
        .multipliedBy(100)
        .toNumber();

      const pendingWithdrawalsFromBeforeUpgradeWei =
        getUserVaultInfosData?.contracts.xvsVault.pendingWithdrawalsBeforeUpgrade_MULT[poolIndex];

      const hasPendingWithdrawalsFromBeforeUpgrade =
        !!pendingWithdrawalsFromBeforeUpgradeWei && +pendingWithdrawalsFromBeforeUpgradeWei > 0;

      const rawUserStakedWei =
        getUserVaultInfosData?.contracts.xvsVault.getUserInfo_MULT[poolIndex].amount;

      const userStakedWei = rawUserStakedWei ? new BigNumber(rawUserStakedWei) : undefined;

      return {
        stakedToken,
        rewardToken,
        lockingPeriodMs,
        dailyEmissionWei,
        poolIndex,
        totalStakedWei,
        stakingAprPercentage,
        hasPendingWithdrawalsFromBeforeUpgrade,
        userStakedWei,
      };
    },
  );

  const getVaiVault = () => {
    const stakedToken = TOKENS.vai;
    const rewardToken = TOKENS.xvs;

    const dailyEmissionWei = new BigNumber(
      getGeneralVaultInfosData.contracts.comptroller.venusVAIVaultRate,
    ).multipliedBy(BLOCKS_PER_DAY);

    const totalStakedWei = new BigNumber(getVaultBalancesData.contracts.vai.balanceOf);

    const xvsPriceDollars = new BigNumber(
      getGeneralVaultInfosData.contracts.venusLens.vXVS.underlyingPrice,
    ).dividedBy(new BigNumber(10).pow(36 - TOKENS.xvs.decimals));

    const stakingAprPercentage = convertWeiToTokens({
      valueWei: dailyEmissionWei,
      token: TOKENS.xvs,
    })
      .multipliedBy(xvsPriceDollars) // We assume 1 VAI = 1 dollar
      .multipliedBy(DAYS_PER_YEAR)
      .dividedBy(
        convertWeiToTokens({
          valueWei: totalStakedWei,
          token: TOKENS.vai,
        }),
      )
      .multipliedBy(100)
      .toNumber();

    const rawUserStakedWei = getUserVaultInfosData?.contracts.vaiVault.userInfo.amount;

    const userStakedWei = rawUserStakedWei ? new BigNumber(rawUserStakedWei) : undefined;

    const vaiVault: Vault = {
      rewardToken,
      stakedToken,
      dailyEmissionWei,
      totalStakedWei,
      stakingAprPercentage,
      userStakedWei,
    };

    return vaiVault;
  };

  const vaiVault = getVaiVault();

  return [...vestingVaults, vaiVault];
};

export default formatPools;
