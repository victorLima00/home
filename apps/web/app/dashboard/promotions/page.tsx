'use client';

import { useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

export default function PromotionsPage() {
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchInput.trim()) return;
    setIsLoading(true);
    // Simulação de busca (será integrado com API no Lote 19)
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginTop: 0 }}>Buscar Promoções</h3>
        <p style={{ color: '#666' }}>
          Encontre promoções dos itens que você está buscando
        </p>
      </div>

      {/* Formulário de busca */}
      <Card style={{ marginBottom: '2rem' }}>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'flex-end'
          }}
        >
          <div style={{ flex: 1, minWidth: '250px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 500,
                fontSize: '0.9rem'
              }}
            >
              Nome do item
            </label>
            <input
              type="text"
              placeholder="Ex: Sofá, Espelho, Cortina..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 500,
                fontSize: '0.9rem'
              }}
            >
              Notas adicionais
            </label>
            <input
              type="text"
              placeholder="Ex: Cor, tamanho, especificações..."
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>
          <Button
            variant="primary"
            onClick={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? '🔄 Buscando...' : '🔍 Buscar'}
          </Button>
        </div>
      </Card>

      {/* Resultado da busca */}
      {isLoading && (
        <Card style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: '#666' }}>Buscando promoções...</p>
        </Card>
      )}

      {!isLoading && !searchInput && (
        <Card style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ color: '#999', fontSize: '0.9rem' }}>
            Digite o nome de um item e clique em "Buscar" para encontrar promoções
          </p>
        </Card>
      )}

      {/* Grid de resultados (simulado) */}
      {!isLoading && searchInput && (
        <div>
          <h4 style={{ marginBottom: '1rem' }}>Resultados para "{searchInput}"</h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1.5rem'
            }}
          >
            <Card>
              <div style={{ marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '100%',
                    height: '150px',
                    backgroundColor: '#e9ecef',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999',
                    marginBottom: '1rem'
                  }}
                >
                  [Imagem]
                </div>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Produto Exemplo</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>Zoom</p>
              </div>
              <p style={{ margin: '1rem 0', fontSize: '1.25rem', fontWeight: 'bold' }}>
                R$ 299,90
              </p>
              <Button variant="primary" size="sm" style={{ width: '100%' }}>
                Ver Oferta →
              </Button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
