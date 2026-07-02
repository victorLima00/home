export default function PromotionsPage() {
  return (
    <div>
      <h3>Buscar Promoções</h3>
      <p>Busca de promoções integrada em construção...</p>
      <div style={{ marginTop: '1rem' }}>
        <input
          type="text"
          placeholder="Digite o nome do item..."
          style={{
            padding: '0.5rem',
            width: '300px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        />
        <button
          style={{
            marginLeft: '0.5rem',
            padding: '0.5rem 1rem',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Buscar
        </button>
      </div>
    </div>
  );
}
