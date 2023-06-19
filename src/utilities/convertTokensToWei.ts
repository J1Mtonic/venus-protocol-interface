import BigNumber from 'bignumber.js';
import { Token, VToken } from 'types';

export const convertTokensToWei = ({ value, token }: { value: BigNumber; token: Token | VToken }) =>
  value.multipliedBy(new BigNumber(10).pow(token.decimals)).dp(0);

export default convertTokensToWei;
