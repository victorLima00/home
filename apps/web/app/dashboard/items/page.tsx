import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

interface Item {
  id: string;
  name: string;
  section: string;
  room: string;
  priority: 'Urgente' | 'Importante' | 'Normal';
  purchased: boolean;
}

export default function ItemsPage() {
  const items: Item[] = [
    { id: '1', name: 'Espelho do banheiro', section: 'Reforma', room: 'Banheiro', priority: 'Urgente', purchased: false },
    { id: '2', name: 'Closet quarto', section: 'Móveis Planejados', room: 'Quarto Principal', priority: 'Urgente', purchased: false },
    { id: '3', name: 'Sofá cinza', section: 'Móveis Planejados', room: 'Sala', priority: 'Importante', purchased: true },
    { id: '4', name: 'Cortinas sala', section: 'Itens Gerais da Casa', room: 'Sala', priority: 'Normal', purchased: false },
    { id: '5', name: 'Luminária escritório', section: 'Itens Gerais da Casa', room: 'Escritório', priority: 'Normal', purchased: true },
  ];

  const priorityColors: Record<string, string> = {
    'Urgente': '#dc3545',
    'Importante': '#ffc107',
    'Normal': '#28a745'
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginTop: 0 }}>Itens</h3>
        <p style={{ color: '#666' }}>
          Gerencie todos os itens da sua reforma
        </p>
      </div>

      {/* Filtros e ações */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}
        >
          <input
            type="text"
            placeholder="Buscar itens..."
            style={{
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              flex: 1,
              minWidth: '200px'
            }}
          />
          <select
            style={{
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          >
            <option>Todas as seções</option>
            <option>Reforma</option>
            <option>Móveis Planejados</option>
            <option>Itens Gerais da Casa</option>
          </select>
          <Button variant="primary" size="sm">
            + Adicionar Item
          </Button>
        </div>
      </Card>

      {/* Tabela de itens */}
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: '#fff'
          }}
        >
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Nome</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Seção</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Cômodo</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Prioridade</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                style={{
                  borderBottom: '1px solid #eee',
                  backgroundColor: item.purchased ? '#f0f8f0' : '#fff'
                }}
              >
                <td style={{ padding: '1rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <input type="checkbox" checked={item.purchased} readOnly />
                    <span
                      style={{
                        textDecoration: item.purchased ? 'line-through' : 'none',
                        color: item.purchased ? '#999' : '#333'
                      }}
                    >
                      {item.name}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>{item.section}</td>
                <td style={{ padding: '1rem' }}>{item.room}</td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <span
                    style={{
                      backgroundColor: priorityColors[item.priority],
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {item.priority}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  {item.purchased ? '✅ Comprado' : '⏳ Pendente'}
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#007bff',
                      cursor: 'pointer',
                      marginRight: '0.5rem'
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#dc3545',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
