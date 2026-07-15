import type { InputHTMLAttributes } from 'react';
import './TextField.css';

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function TextField({
  id,
  label,
  error,
  className,
  ...rest
}: TextFieldProps) {
  const inputId = id ?? rest.name;
  const classes = ['fp-field', className].filter(Boolean).join(' ');

  return (
    <label className={classes} htmlFor={inputId}>
      <span className="fp-field__label">{label}</span>
      <input id={inputId} className="fp-field__input" {...rest} />
      {error ? <span className="fp-field__error">{error}</span> : null}
    </label>
  );
}
