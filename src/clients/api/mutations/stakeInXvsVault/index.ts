import BigNumber from 'bignumber.js';
import { checkForXvsVaultProxyTransactionError } from 'errors';
import { ContractReceipt } from 'ethers';
import { Token } from 'types';

import { XvsVault } from 'types/contracts';

export interface StakeInXvsVaultInput {
  xvsVaultContract: XvsVault;
  rewardToken: Token;
  amountWei: BigNumber;
  poolIndex: number;
}

export type StakeInXvsVaultOutput = ContractReceipt;

const stakeInXvsVault = async ({
  xvsVaultContract,
  rewardToken,
  amountWei,
  poolIndex,
}: StakeInXvsVaultInput): Promise<StakeInXvsVaultOutput> => {
  const transaction = await xvsVaultContract.deposit(
    rewardToken.address,
    poolIndex,
    amountWei.toFixed(),
  );
  const receipt = await transaction.wait(1);
  return checkForXvsVaultProxyTransactionError(receipt);
};

export default stakeInXvsVault;
