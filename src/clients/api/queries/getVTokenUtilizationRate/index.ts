import BigNumber from 'bignumber.js';

import { InterestRateModel, InterestRateModelV2 } from 'types/contracts';

interface GetVTokenUtilizationRateInputBase {
  vTokenBorrowBalanceWei: BigNumber;
  vTokenCashWei: BigNumber;
  vTokenReservesWei: BigNumber;
}

interface GetCoreVTokenUtilizationRateInput extends GetVTokenUtilizationRateInputBase {
  interestRateModelContract: InterestRateModel;
  isIsolatedPoolMarket: false;
  vTokenBadDebtWei: undefined;
}

interface GetIsolatedVTokenUtilizationRateInput extends GetVTokenUtilizationRateInputBase {
  interestRateModelContract: InterestRateModelV2;
  isIsolatedPoolMarket: true;
  vTokenBadDebtWei: BigNumber;
}

export type GetVTokenUtilizationRateInput =
  | GetCoreVTokenUtilizationRateInput
  | GetIsolatedVTokenUtilizationRateInput;

export type GetVTokenUtilizationRateOutput = {
  utilizationRate: number;
};

const getVTokenUtilizationRate = async ({
  vTokenBorrowBalanceWei,
  vTokenCashWei,
  vTokenReservesWei,
  vTokenBadDebtWei,
  interestRateModelContract,
  isIsolatedPoolMarket,
}: GetVTokenUtilizationRateInput): Promise<GetVTokenUtilizationRateOutput> => {
  let result;

  if (isIsolatedPoolMarket) {
    result = await interestRateModelContract.utilizationRate(
      vTokenCashWei.toFixed(),
      vTokenBorrowBalanceWei.toFixed(),
      vTokenReservesWei.toFixed(),
      vTokenBadDebtWei.toFixed(),
    );
  } else {
    result = await interestRateModelContract.utilizationRate(
      vTokenCashWei.toFixed(),
      vTokenBorrowBalanceWei.toFixed(),
      vTokenReservesWei.toFixed(),
    );
  }

  // TODO: convert to percentage
  console.log('result', result.toString());

  return { utilizationRate: 100 };
};

export default getVTokenUtilizationRate;
