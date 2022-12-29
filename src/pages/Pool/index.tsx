/** @jsxImportSource @emotion/react */
import { Typography } from '@mui/material';
import { Cell, CellGroup, Icon, Spinner } from 'components';
import React, { useContext, useMemo } from 'react';
import { Redirect, RouteComponentProps } from 'react-router-dom';
import { useTranslation } from 'translation';
import { Pool } from 'types';
import { formatCentsToReadableValue } from 'utilities';

import { useGetPool } from 'clients/api';
import PLACEHOLDER_KEY from 'constants/placeholderKey';
import { routes } from 'constants/routing';
import { AuthContext } from 'context/AuthContext';

import Table from './Table';
import { useStyles } from './styles';

export interface PoolUiProps {
  pool?: Pool;
}

export const PoolUi: React.FC<PoolUiProps> = ({ pool }) => {
  const styles = useStyles();
  const { t, Trans } = useTranslation();

  const cells: Cell[] = useMemo(() => {
    const { totalSupplyCents, totalBorrowCents } = (pool?.assets || []).reduce(
      (acc, item) => ({
        totalSupplyCents: acc.totalSupplyCents + item.supplyBalanceCents,
        totalBorrowCents: acc.totalBorrowCents + item.borrowBalanceCents,
      }),
      {
        totalSupplyCents: 0,
        totalBorrowCents: 0,
      },
    );

    return [
      {
        label: t('pool.header.totalSupplyLabel'),
        value: formatCentsToReadableValue({
          value: totalSupplyCents,
        }),
      },
      {
        label: t('pool.header.totalBorrowLabel'),
        value: formatCentsToReadableValue({
          value: totalBorrowCents,
        }),
      },
      {
        label: t('pool.header.availableLiquidityLabel'),
        value: formatCentsToReadableValue({
          value: totalSupplyCents - totalBorrowCents,
        }),
      },
      {
        label: t('pool.header.assetsLabel'),
        value: pool?.assets.length || PLACEHOLDER_KEY,
      },
    ];
  }, [pool]);

  return pool ? (
    <>
      <div css={styles.header}>
        <Typography variant="small2" component="div" css={styles.headerDescription}>
          {pool.description}
        </Typography>

        <CellGroup cells={cells} />
      </div>

      {pool.isIsolated && (
        <div css={styles.banner}>
          <div css={styles.bannerContent}>
            <Icon name="attention" css={styles.bannerIcon} />

            <Typography variant="small2" css={styles.bannerText}>
              <Trans
                i18nKey="pool.bannerText"
                components={{
                  Link: (
                    <Typography
                      variant="small2"
                      component="a"
                      // TODO: add href
                      href="TBD"
                      target="_blank"
                      rel="noreferrer"
                    />
                  ),
                }}
              />
            </Typography>
          </div>
        </div>
      )}

      <Table pool={pool} />
    </>
  ) : (
    <Spinner />
  );
};

export type PoolPageProps = RouteComponentProps<{ poolComptrollerAddress: string }>;

const PoolPage: React.FC<PoolPageProps> = ({
  match: {
    params: { poolComptrollerAddress },
  },
}) => {
  const { account } = useContext(AuthContext);

  const { data: getPoolData, isLoading: isGetPoolLoading } = useGetPool({
    accountAddress: account?.address,
    poolComptrollerAddress,
  });

  // Redirect to Pools page if pool Comptroller address is incorrect
  if (!isGetPoolLoading && !getPoolData?.pool) {
    <Redirect to={routes.dashboard.path} />;
  }

  return <PoolUi pool={getPoolData?.pool} />;
};

export default PoolPage;