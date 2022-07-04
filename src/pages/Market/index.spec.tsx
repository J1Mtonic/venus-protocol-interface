import BigNumber from 'bignumber.js';
import React from 'react';

import vTokenBalanceTreasury from '__mocks__/api/vTokenBalanceTreasury.json';
import { markets } from '__mocks__/models/markets';
import { getMarkets, useGetTreasuryTotals, useGetVTokenBalancesAll } from 'clients/api';
import renderComponent from 'testUtils/renderComponent';

import Market from '.';

jest.mock('clients/api');

describe('pages/Market', () => {
  beforeEach(() => {
    (getMarkets as jest.Mock).mockImplementation(() => ({ markets }));
    (useGetVTokenBalancesAll as jest.Mock).mockImplementation(() => ({
      data: vTokenBalanceTreasury,
    }));
    (useGetTreasuryTotals as jest.Mock).mockImplementation(() => ({
      data: {
        treasuryTotalSupplyBalanceCents: new BigNumber(0),
        treasuryTotalBorrowBalanceCents: new BigNumber(0),
        treasuryTotalBalanceCents: new BigNumber(0),
        treasuryTotalAvailableLiquidityBalanceCents: new BigNumber(0),
      },
      isLoading: false,
    }));
  });

  it('renders without crashing', async () => {
    renderComponent(<Market />);
  });
});
