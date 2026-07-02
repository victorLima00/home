import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - HOME'
};

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="layout-dashboard">
      <header style={{ borderBottom: '1px solid #ccc', padding: '1rem' }}>
        <h2>Dashboard</h2>
      </header>
      <nav style={{ padding: '1rem', background: '#f5f5f5' }}>
        <ul style={{ display: 'flex', gap: '1rem', listStyle: 'none' }}>
          <li>
            <a href="/dashboard/overview">Visão Geral</a>
          </li>
          <li>
            <a href="/dashboard/rooms">Cômodos</a>
          </li>
          <li>
            <a href="/dashboard/items">Itens</a>
          </li>
          <li>
            <a href="/dashboard/promotions">Promoções</a>
          </li>
        </ul>
      </nav>
      <main style={{ padding: '1rem' }}>{children}</main>
    </div>
  );
}
