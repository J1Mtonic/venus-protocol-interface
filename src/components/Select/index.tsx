/** @jsxImportSource @emotion/react */
import { Select as MuiSelect } from '@mui/material';
import { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { SelectChangeEvent } from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import React, { useMemo, useState } from 'react';

import { useIsSmDown } from 'hooks/responsive';

import { TextButton } from '../Button';
import { Icon } from '../Icon';
import { SELECTED_MENU_ITEM_CLASSNAME, useStyles } from './styles';

interface Option {
  value: string | number;
  label: string;
}

export interface SelectProps {
  className?: string;
  options: Option[];
  value: string | undefined;
  onChange: (e: SelectChangeEvent) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  ariaLabel: string;
  title: string;
  name?: string;
}

export const Select: React.FC<SelectProps> = ({
  className,
  options,
  value,
  onChange,
  onBlur,
  ariaLabel,
  title,
  name,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const styles = useStyles();
  const isSmDown = useIsSmDown();

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  const menuProps = useMemo(() => {
    const mobileStyles: Partial<MenuProps> = {
      transformOrigin: {
        vertical: 'top',
        horizontal: 'center',
      },
      anchorReference: 'none',
      anchorOrigin: {
        vertical: 'top',
        horizontal: 'center',
      },
    };
    return {
      PaperProps: {
        sx: styles.menuWrapper,
      },
      ...(isSmDown ? mobileStyles : {}),
    };
  }, [isSmDown]);

  return (
    <>
      <div css={styles.label}>
        <Typography variant="small1" component="label" htmlFor="proposalType">
          {title}
        </Typography>
      </div>
      <MuiSelect
        name={name}
        open={isOpen}
        onClose={handleClose}
        onOpen={handleOpen}
        className={className}
        css={styles.root({ isOpen })}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        displayEmpty
        inputProps={{ 'aria-label': ariaLabel }}
        IconComponent={() => (
          <Icon css={styles.getArrowIcon({ isMenuOpened: isOpen })} name="arrowUp" />
        )}
        MenuProps={menuProps}
        autoWidth={isSmDown}
      >
        <div css={styles.mobileHeader}>
          <Typography variant="h4">{title}</Typography>

          <TextButton css={styles.closeMenuButton} onClick={handleClose}>
            <Icon name="close" />
          </TextButton>
        </div>
        {options.map(({ value: v, label }) => (
          <MenuItem
            disableRipple
            css={styles.menuItem}
            key={v}
            classes={{ selected: SELECTED_MENU_ITEM_CLASSNAME }}
            value={v}
          >
            {label}
          </MenuItem>
        ))}
      </MuiSelect>
    </>
  );
};
