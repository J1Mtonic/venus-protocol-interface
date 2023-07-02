import { useQuery } from '@apollo/client';
import config from 'config';
import { Vault } from 'types';
import { areTokensEqual } from 'utilities';

import { GetGeneralVaultInfosDocument } from 'clients/ethGraphQl';
import { TOKENS, VBEP_TOKENS } from 'constants/tokens';

const FIRST_VXVS_TOKEN_ADDRESS = Object.entries(VBEP_TOKENS).find(([_BepTokenAddress, vBepToken]) =>
  areTokensEqual(vBepToken.underlyingToken, TOKENS.xvs),
)![1].address;

const useGetVaultsGraphQl = () => {
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

  console.log('getGeneralVaultInfosData', getGeneralVaultInfosData);

  const error = getGeneralVaultInfosError;
  const isLoading = isGetGeneralVaultInfosLoading;

  console.log('error', error);

  const data: Vault[] = [];

  return {
    error,
    isLoading,
    data,
  };
};

export default useGetVaultsGraphQl;
