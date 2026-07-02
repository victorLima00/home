import { StatCard } from '@/components/StatCard';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

export default function DashboardOverview() {
  // Dados de exemplo (será integrado com Firestore no Lote 19)
  const stats = {
    totalItems: 48,
    purchasedItems: 12,
    priorityUrgent: 8,
    progressPercent: 25
  };

  const rooms = [
    'Cozinha Integrada',
    'Sala',
    'Quarto Principal',
    'Banheiro',
    'Escritório',
    'Sacada',
    'Lavanderia'
  ];

  const sections = [
    { name: 'Reforma', count: 10 },
    { name: 'Móveis Planejados', count: 13 },
    { name: 'Itens Gerais da Casa', count: 25 }
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginTop: 0 }}>Visão Geral</h3>
        <p style={{ color: '#666' }}>
          Acompanhe o progresso da sua reforma e organização
        </p>
      </div>

      {/* Barra de Progresso */}
      <Card style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0' }}>Progresso Geral</h4>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
            {stats.purchasedItems} de {stats.totalItems} itens comprados
          </p>
        </div>
        <div
          style={{
            width: '100%',
            height: '30px',
            backgroundColor: '#e9ecef',
            borderRadius: '15px',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: `${stats.progressPercent}%`,
              height: '100%',
              backgroundColor: '#28a745',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </Card>

      {/* Estatísticas */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}
      >
        <StatCard
          label="Total de Itens"
          value={stats.totalItems}
          description="Em todas as seções"
          icon="📋"
        />
        <StatCard
          label="Itens Comprados"
          value={stats.purchasedItems}
          description={`${stats.progressPercent}% concluído`}
          trend="up"
          icon="✅"
        />
        <StatCard
          label="Prioridade Urgente"
          value={stats.priorityUrgent}
          description="Próximas ações"
          trend="down"
          icon="🔴"
        />
      </div>

      {/* Seções */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        <Card>
          <h4 style={{ marginTop: 0 }}>Seções</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {sections.map((section) => (
              <li
                key={section.name}
                style={{
                  padding: '0.75rem',
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>{section.name}</span>
                <span
                  style={{
                    backgroundColor: '#e9ecef',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold'
                  }}
                >
                  {section.count}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h4 style={{ marginTop: 0 }}>Cômodos</h4>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}
          >
            {rooms.map((room) => (
              <div
                key={room}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  fontSize: '0.95rem'
                }}
              >
                🏠 {room}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <h4 style={{ marginTop: 0, marginBottom: '1rem' }}>Ações Rápidas</h4>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <Button variant="primary">+ Novo Item</Button>
          <Button variant="secondary">Buscar Promoções</Button>
          <Button variant="secondary">Gerar Relatório</Button>
        </div>
      </Card>
    </div>
  );
}
