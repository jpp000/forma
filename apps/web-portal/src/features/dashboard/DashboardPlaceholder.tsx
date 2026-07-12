import { Link } from 'react-router-dom';
import { Button, Page } from '../../ui';

export function DashboardPlaceholder() {
  return (
    <Page
      title="Clients"
      eyebrow="Dashboard"
      actions={
        <Link to="/invites">
          <Button type="button">Invite student</Button>
        </Link>
      }
    >
      <p>Roster table lands in the next tasks.</p>
    </Page>
  );
}
