import BigNumber from 'bignumber.js';
import { TransactionCategory, TransactionEvent } from 'types';
import { convertTokensToWei, getTokenByAddress, getVTokenByAddress } from 'utilities';

import { MAINNET_VBEP_TOKENS, TOKENS } from 'constants/tokens';

import { TransactionResponse } from './types';

const MAIN_POOL_VXVS_ADDRESS = '0x151b1e2635a717bcdc836ecd6fbb62b674fe3e1d';

const formatTransaction = ({
  amount,
  category,
  event,
  tokenAddress,
  timestamp,
  ...rest
}: TransactionResponse) => {
  const tokenOrVToken =
    category === 'vtoken'
      ? getVTokenByAddress(tokenAddress) || MAINNET_VBEP_TOKENS[MAIN_POOL_VXVS_ADDRESS]
      : getTokenByAddress(tokenAddress) || TOKENS.xvs;

  return {
    ...rest,
    amountWei: convertTokensToWei({ value: new BigNumber(amount), token: tokenOrVToken }),
    category: category as TransactionCategory,
    event: event as TransactionEvent,
    token: 'asset' in tokenOrVToken ? tokenOrVToken : tokenOrVToken.underlyingToken,
    timestamp: new Date(timestamp * 1000), // Convert timestamp to milliseconds
  };
};
export default formatTransaction;
