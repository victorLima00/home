'use client';

import { useState } from 'react';
import { ItemForm } from '@/components/ItemForm';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

export default function NewItemPage() {
  const [showForm, setShowForm] = useState(false);
  const [recentItems, setRecentItems] = useState<any[]>([]);

  const handleSuccess = () => {
    setShowForm(false);
    // Aqui será carregada a lista de items do backend (Lote 19 continuação)
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginTop: 0 }}>Novo Item</h3>
        <p style={{ color: '#666' }}>
          Adicione um novo item à sua lista de compras
        </p>
      </div>

      {showForm ? (
        <ItemForm
          onSuccess={handleSuccess}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <Card>
          <Button
            variant="primary"
            onClick={() => setShowForm(true)}
            type="button"
            data-testid="abrir-form-novo-item"
          >
            ➕ Criar Novo Item
          </Button>
        </Card>
      )}

      {recentItems.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h4>Itens Recentes</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {recentItems.map((item) => (
              <Card key={item.id}>
                <h5 style={{ margin: '0 0 0.5rem 0' }}>{item.nome}</h5>
                <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#666' }}>
                  {item.secao} • {item.comodo}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
