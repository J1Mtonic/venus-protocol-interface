import React from 'react';
import { useField } from 'formik';
import { TextField, ITextFieldProps } from '../TextField';

interface IFormikTextField extends Omit<ITextFieldProps, 'name' | 'onChange' | 'value'> {
  name: string;
  displayableErrorCodes?: string[];
}

export const FormikTextField = ({
  name,
  displayableErrorCodes = [],
  onBlur,
  ...rest
}: IFormikTextField) => {
  const [{ value, onBlur }, { error, touched }, { setValue, setTouched }] = useField(name);
  const onChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    const val = e.target.value;
    setValue(val);
    setTouched(true);
  };

  return (
    <TextField
      name={name}
      value={value || ''}
      onChange={onChange}
      onBlur={onBlur}
      hasError={!!(error && displayableErrorCodes.includes(error) && touched)}
      {...rest}
    />
  );
};
