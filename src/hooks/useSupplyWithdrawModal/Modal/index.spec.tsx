import { fireEvent } from '@testing-library/react';
import React from 'react';
import { Pool } from 'types';

import { poolData } from '__mocks__/models/pools';
import { getAllowance, useGetPool } from 'clients/api';
import MAX_UINT256 from 'constants/maxUint256';
import renderComponent from 'testUtils/renderComponent';
import en from 'translation/translations/en.json';

import SupplyWithdraw from '.';

const fakePool: Pool = poolData[0];
const fakeAsset = fakePool.assets[0];

jest.mock('clients/api');
jest.mock('hooks/useSuccessfulTransactionModal');

describe('hooks/useSupplyWithdrawModal', () => {
  beforeEach(() => {
    // Mark token as enabled
    (getAllowance as jest.Mock).mockImplementation(() => ({
      allowanceWei: MAX_UINT256,
    }));

    (useGetPool as jest.Mock).mockImplementation(() => ({
      data: {
        pool: fakePool,
      },
      isLoading: false,
    }));
  });

  it('renders without crashing', async () => {
    renderComponent(() => (
      <SupplyWithdraw
        onClose={jest.fn()}
        vToken={fakeAsset.vToken}
        poolComptrollerAddress={fakePool.comptrollerAddress}
      />
    ));
  });

  // TODO: add test to check Supply tab is hidden when token is LUNA or UST

  // TODO: move to each tab
  it('asks the user to connect if wallet is not connected', async () => {
    const { getByText } = renderComponent(() => (
      <SupplyWithdraw
        onClose={jest.fn()}
        vToken={fakeAsset.vToken}
        poolComptrollerAddress={fakePool.comptrollerAddress}
      />
    ));

    const connectTextSupply = getByText(en.supplyWithdraw.connectWalletToSupply);
    expect(connectTextSupply).toHaveTextContent(en.supplyWithdraw.connectWalletToSupply);
    const withdrawButton = getByText(en.supplyWithdraw.withdraw);
    fireEvent.click(withdrawButton);
    const connectTextWithdraw = getByText(en.supplyWithdraw.connectWalletToWithdraw);
    expect(connectTextWithdraw).toHaveTextContent(en.supplyWithdraw.connectWalletToWithdraw);
  });
});
