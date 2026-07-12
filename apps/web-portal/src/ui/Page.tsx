import type { ReactNode } from 'react';
import './Page.css';

type PageProps = {
  title: string;
  eyebrow?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function Page({ title, eyebrow, actions, children }: PageProps) {
  return (
    <div className="fp-page">
      <header className="fp-page__header">
        <div>
          {eyebrow ? <p className="fp-page__eyebrow">{eyebrow}</p> : null}
          <h1 className="fp-page__title">{title}</h1>
        </div>
        {actions ? <div className="fp-page__actions">{actions}</div> : null}
      </header>
      <div className="fp-page__body">{children}</div>
    </div>
  );
}
