import { redirect } from 'next/navigation';

export default function DashboardPage() {
  redirect('/dashboard/driver');
  // This return is necessary but will not be rendered due to the redirect.
  return null;
}
