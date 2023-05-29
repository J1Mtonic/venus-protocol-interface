import { ComponentMeta } from '@storybook/react';
import noop from 'noop-ts';
import React from 'react';

import { poolData } from '__mocks__/models/pools';
import { TESTNET_TOKENS } from 'constants/tokens';
import { withCenterStory } from 'stories/decorators';

import { SupplyFormUi } from '.';

const fakePool = poolData[0];
const fakeAsset = fakePool.assets[2];

export default {
  title: 'Components/OperationModal/RepayForm',
  component: SupplyFormUi,
  decorators: [withCenterStory({ width: 600 })],
} as ComponentMeta<typeof SupplyFormUi>;

export const Default = () => (
  <SupplyFormUi
    asset={fakeAsset}
    pool={fakePool}
    onSubmit={noop}
    onCloseModal={noop}
    isSwapLoading={false}
    isSubmitting={false}
    formValues={{
      fromToken: TESTNET_TOKENS.xvs,
      amountTokens: '',
    }}
    setFormValues={noop}
  />
);