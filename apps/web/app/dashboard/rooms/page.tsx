'use client';

import { useState } from 'react';
import { RoomCard } from '@/components/RoomCard';
import { RoomDetailLayout } from '@/components/RoomDetailLayout';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';

interface Room {
  id: string;
  name: string;
  totalItems: number;
  purchasedItems: number;
}

interface RoomItem {
  id: string;
  name: string;
  section: string;
  priority: 'Urgente' | 'Importante' | 'Normal';
  purchased: boolean;
}

const ROOMS: Room[] = [
  { id: '1', name: 'Cozinha Integrada', totalItems: 8, purchasedItems: 3 },
  { id: '2', name: 'Sala', totalItems: 6, purchasedItems: 2 },
  { id: '3', name: 'Quarto Principal', totalItems: 10, purchasedItems: 5 },
  { id: '4', name: 'Banheiro', totalItems: 7, purchasedItems: 4 },
  { id: '5', name: 'Escritório', totalItems: 5, purchasedItems: 1 },
  { id: '6', name: 'Sacada', totalItems: 3, purchasedItems: 0 },
  { id: '7', name: 'Lavanderia', totalItems: 4, purchasedItems: 2 }
];

const ROOM_ITEMS: Record<string, RoomItem[]> = {
  '1': [
    { id: '1-1', name: 'Geladeira inox', section: 'Reforma', priority: 'Urgente', purchased: false },
    { id: '1-2', name: 'Fogo embutido', section: 'Reforma', priority: 'Urgente', purchased: true },
    { id: '1-3', name: 'Pé aluminio para mesas', section: 'Itens Gerais da Casa', priority: 'Normal', purchased: true },
  ],
  '2': [
    { id: '2-1', name: 'Sofá cinza', section: 'Móveis Planejados', priority: 'Importante', purchased: true },
    { id: '2-2', name: 'Cortinas', section: 'Itens Gerais da Casa', priority: 'Normal', purchased: false },
  ],
  '3': [
    { id: '3-1', name: 'Closet planejado', section: 'Móveis Planejados', priority: 'Urgente', purchased: false },
    { id: '3-2', name: 'Cama estofada', section: 'Móveis Planejados', priority: 'Importante', purchased: true },
  ]
};

export default function RoomsPage() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [editingRoom, setEditingRoom] = useState<string | null>(null);

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
  };

  const handleBack = () => {
    setSelectedRoom(null);
  };

  if (selectedRoom) {
    const roomItems = ROOM_ITEMS[selectedRoom.id] || [];
    const priorityColors: Record<string, string> = {
      'Urgente': '#dc3545',
      'Importante': '#ffc107',
      'Normal': '#28a745'
    };

    return (
      <RoomDetailLayout roomName={selectedRoom.name} onBack={handleBack}>
        <div style={{ marginBottom: '2rem' }}>
          <RoomCard
            name={selectedRoom.name}
            itemCount={selectedRoom.totalItems}
            purchasedCount={selectedRoom.purchasedItems}
          />
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ marginBottom: '1rem' }}>Itens deste cômodo ({roomItems.length})</h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1rem'
            }}
          >
            {roomItems.map((item) => (
              <Card key={item.id}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={item.purchased}
                    style={{ marginTop: '0.25rem' }}
                  />
                  <div style={{ flex: 1 }}>
                    <h5
                      style={{
                        margin: '0 0 0.5rem 0',
                        textDecoration: item.purchased ? 'line-through' : 'none',
                        color: item.purchased ? '#999' : '#333'
                      }}
                    >
                      {item.name}
                    </h5>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#666' }}>
                      {item.section}
                    </p>
                    <span
                      style={{
                        display: 'inline-block',
                        backgroundColor: priorityColors[item.priority],
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        marginTop: '0.5rem'
                      }}
                    >
                      {item.priority}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <Button variant="primary" onClick={() => setEditingRoom(selectedRoom.id)}>
            Editar cômodo
          </Button>
        </Card>
      </RoomDetailLayout>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginTop: 0 }}>Cômodos</h3>
        <p style={{ color: '#666' }}>
          Visualize e gerencie seus cômodos e os itens de cada um
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}
      >
        {ROOMS.map((room) => (
          <RoomCard
            key={room.id}
            name={room.name}
            itemCount={room.totalItems}
            purchasedCount={room.purchasedItems}
            onClick={() => handleRoomSelect(room)}
          />
        ))}
      </div>
    </div>
  );
}
