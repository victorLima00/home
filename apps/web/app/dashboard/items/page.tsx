export default function ItemsPage() {
  return (
    <div>
      <h3>Itens</h3>
      <p>Lista de itens em construção...</p>
      <div style={{ marginTop: '2rem' }}>
        <button
          style={{
            padding: '0.5rem 1rem',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          + Adicionar Item
        </button>
      </div>
    </div>
  );
}
