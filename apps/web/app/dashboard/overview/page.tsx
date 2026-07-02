export default function DashboardOverview() {
  return (
    <div>
      <h3>Visão Geral</h3>
      <p>Dashboard overview em construção...</p>
      <div style={{ marginTop: '2rem' }}>
        <h4>Estatísticas</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ padding: '1rem', border: '1px solid #ddd' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
              Total de itens
            </p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 'bold' }}>
              0
            </p>
          </div>
          <div style={{ padding: '1rem', border: '1px solid #ddd' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
              Itens comprados
            </p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 'bold' }}>
              0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
