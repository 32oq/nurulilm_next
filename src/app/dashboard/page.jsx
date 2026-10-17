import DashboardClient from './DashboardClient';

export const metadata = {
  title: 'Patron Desk & Reading Room | Nurul Ilm Library ',
  description: 'Manage study carrel bookings, book loans, focus sprint tracking, and digital patron credentials.',
};

export default function DashboardPage() {
  return <DashboardClient />;
}
