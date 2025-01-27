import {
  Currency as PSCurrency,
  CurrencyAmount as PSCurrencyAmount,
  Token as PSToken,
  Trade as PSTrade,
  TradeType as PSTradeType,
} from '@pancakeswap/sdk/dist/index.js';
import BigNumber from 'bignumber.js';
import config from 'config';
import { useMemo } from 'react';
import { SwapError } from 'types';
import { areTokensEqual, convertTokensToWei } from 'utilities';

import { useGetPancakeSwapPairs } from 'clients/api';

import formatToSwap from './formatToSwap';
import { UseGetSwapInfoInput, UseGetSwapInfoOutput } from './types';
import useGetTokenCombinations from './useGetTokenCombinations';
import wrapToken from './wrapToken';

export * from './types';

const useGetSwapInfo = (input: UseGetSwapInfoInput): UseGetSwapInfoOutput => {
  // Determine all possible token combinations based on input and base trade
  // tokens
  const tokenCombinations = useGetTokenCombinations({
    fromToken: input.fromToken,
    toToken: input.toToken,
  });

  // Fetch pair data
  const { data: getPancakeSwapPairsData, isLoading } = useGetPancakeSwapPairs({
    tokenCombinations,
  });

  // Find the best trade based on pairs
  const swapInfo: Omit<UseGetSwapInfoOutput, 'isLoading'> = useMemo(() => {
    let trade: PSTrade<PSCurrency, PSCurrency, PSTradeType> | undefined;
    let error: SwapError | undefined;

    if (areTokensEqual(input.fromToken, input.toToken)) {
      return {
        swap: undefined,
        error: undefined,
      };
    }

    const wrappedFromToken = wrapToken(input.fromToken);
    const wrappedToToken = wrapToken(input.toToken);

    // Return no trade if user is trying to wrap BNB to wBNB
    if (areTokensEqual(wrappedFromToken, wrappedToToken) && input.fromToken.isNative) {
      return {
        swap: undefined,
        error: 'WRAPPING_UNSUPPORTED',
      };
    }

    // Return no trade if user is trying to unwrap wBNB to BNB
    if (areTokensEqual(wrappedFromToken, wrappedToToken) && input.toToken.isNative) {
      return {
        swap: undefined,
        error: 'UNWRAPPING_UNSUPPORTED',
      };
    }

    // Handle "exactAmountIn" direction (sell an exact amount of fromTokens for
    // as many toTokens as possible)
    if (
      getPancakeSwapPairsData?.pairs &&
      input.direction === 'exactAmountIn' &&
      input.fromTokenAmountTokens &&
      Number(input.fromTokenAmountTokens) > 0
    ) {
      const fromTokenAmountWei = convertTokensToWei({
        value: new BigNumber(input.fromTokenAmountTokens),
        token: wrappedFromToken,
      });

      const currencyAmountIn = PSCurrencyAmount.fromRawAmount(
        new PSToken(
          config.chainId,
          wrappedFromToken.address,
          wrappedFromToken.decimals,
          wrappedFromToken.symbol,
        ),
        fromTokenAmountWei.toFixed(),
      );

      const currencyOut = new PSToken(
        config.chainId,
        wrappedToToken.address,
        wrappedToToken.decimals,
        wrappedToToken.symbol,
      );

      // Find best trade
      [trade] = PSTrade.bestTradeExactIn(
        getPancakeSwapPairsData?.pairs,
        currencyAmountIn,
        currencyOut,
        {
          maxHops: 3,
          maxNumResults: 1,
        },
      );

      error = trade ? undefined : 'INSUFFICIENT_LIQUIDITY';
    }

    // Handle "exactAmountOut" direction (sell as few fromTokens as possible for
    // a fixed amount of toTokens)
    if (
      getPancakeSwapPairsData?.pairs &&
      input.direction === 'exactAmountOut' &&
      input.toTokenAmountTokens &&
      Number(input.toTokenAmountTokens) > 0
    ) {
      const currencyIn = new PSToken(
        config.chainId,
        wrappedFromToken.address,
        wrappedFromToken.decimals,
        wrappedFromToken.symbol,
      );

      const toTokenAmountWei = convertTokensToWei({
        value: new BigNumber(input.toTokenAmountTokens),
        token: wrappedToToken,
      });

      const currencyAmountOut = PSCurrencyAmount.fromRawAmount(
        new PSToken(
          config.chainId,
          wrappedToToken.address,
          wrappedToToken.decimals,
          wrappedToToken.symbol,
        ),
        toTokenAmountWei.toFixed(),
      );

      // Find best trade
      [trade] = PSTrade.bestTradeExactOut(
        getPancakeSwapPairsData?.pairs,
        currencyIn,
        currencyAmountOut,
        {
          maxHops: 3,
          maxNumResults: 1,
        },
      );

      error = trade ? undefined : 'INSUFFICIENT_LIQUIDITY';
    }

    const swap =
      trade &&
      formatToSwap({
        input,
        trade,
      });

    return {
      swap,
      error,
    };
  }, [
    getPancakeSwapPairsData?.pairs,
    input.fromToken,
    input.toToken,
    input.fromTokenAmountTokens,
    input.toTokenAmountTokens,
  ]);

  // Because the swap pairs are fetched on every new block (and they do change
  // on every new block), the swap object generated ends up getting a new
  // reference on every new block even if its content is the same. For that
  // reason, we memoize it using its content as source of truth to check whether
  // it does change from one instance to the other
  const memoizedSwapInfo = useMemo(() => swapInfo, [JSON.stringify(swapInfo)]);

  return {
    ...memoizedSwapInfo,
    isLoading,
  };
};

export default useGetSwapInfo;
