import type { ReactNode } from 'react';
import './InlineError.css';

type InlineErrorProps = {
  children: ReactNode;
  action?: ReactNode;
};

export function InlineError({ children, action }: InlineErrorProps) {
  return (
    <div className="fp-inline-error" role="alert">
      <p className="fp-inline-error__message">{children}</p>
      {action ? <div className="fp-inline-error__action">{action}</div> : null}
    </div>
  );
}
