import { type FormEvent, useState } from 'react';
import { FormField } from './FormField';
import { Button } from './Button';
import { Card } from './Card';
import { apiClient } from '@/lib/api-client';
import { ItemSchema } from '@/lib/schemas';
import type { Item } from '@/lib/schemas';

interface ItemFormProps {
  item?: Item;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ItemForm({ item, onSuccess, onCancel }: ItemFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    nome: item?.nome || '',
    secao: item?.secao || 'Reforma',
    comodo: item?.comodo || 'Cozinha Integrada',
    prioridade: item?.prioridade || 'Normal',
    comprado: item?.comprado || false,
    notas: item?.notas || '',
    responsavel: item?.responsavel || ''
  });

  const sections = ['Reforma', 'Móveis Planejados', 'Itens Gerais da Casa'];
  const rooms = [
    'Cozinha Integrada',
    'Sala',
    'Quarto Principal',
    'Banheiro',
    'Escritório',
    'Sacada',
    'Lavanderia'
  ];
  const priorities = ['Urgente', 'Importante', 'Normal'];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, type, value, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const validatedData = ItemSchema.parse({
        id: item?.id || 'new-item',
        ...formData
      });

      if (item?.id) {
        await apiClient.put(`/items/${item.id}`, validatedData);
      } else {
        await apiClient.post('/items', validatedData);
      }

      setFormData({
        nome: '',
        secao: 'Reforma',
        comodo: 'Cozinha Integrada',
        prioridade: 'Normal',
        comprado: false,
        notas: '',
        responsavel: ''
      });
      onSuccess?.();
    } catch (error) {
      const maybeZodError = error as { errors?: Array<{ path: string[]; message: string }>; message?: string };
      if (Array.isArray(maybeZodError.errors)) {
        const errorMap: Record<string, string> = {};
        maybeZodError.errors.forEach((err) => {
          const path = err.path.join('.');
          errorMap[path] = err.message;
        });
        setErrors(errorMap);
      } else {
        setErrors({
          submit: maybeZodError.message || 'Erro ao salvar item'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <h4 style={{ marginTop: 0 }}>{item?.id ? '✏️ Editar Item' : '➕ Novo Item'}</h4>

        {errors.submit && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              borderRadius: '4px',
              marginBottom: '1rem'
            }}
          >
            {errors.submit}
          </div>
        )}

        <FormField label="Nome do item" id="nome" error={errors.nome} required>
          <input
            id="nome"
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Ex: Sofá cinza, Espelho banheiro..."
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${errors.nome ? '#dc3545' : '#ddd'}`,
              borderRadius: '4px',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />
        </FormField>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <FormField label="Seção" id="secao" error={errors.secao} required>
            <select
              id="secao"
              name="secao"
              value={formData.secao}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${errors.secao ? '#dc3545' : '#ddd'}`,
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            >
              {sections.map((section) => (
                <option key={section} value={section}>
                  {section}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Cômodo" id="comodo" error={errors.comodo} required>
            <select
              id="comodo"
              name="comodo"
              value={formData.comodo}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${errors.comodo ? '#dc3545' : '#ddd'}`,
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            >
              {rooms.map((room) => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <FormField label="Prioridade" id="prioridade" error={errors.prioridade} required>
            <select
              id="prioridade"
              name="prioridade"
              value={formData.prioridade}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${errors.prioridade ? '#dc3545' : '#ddd'}`,
                borderRadius: '4px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            >
              {priorities.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="" id="comprado">
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer'
              }}
            >
              <input
                id="comprado"
                type="checkbox"
                name="comprado"
                checked={formData.comprado}
                onChange={handleChange}
              />
              <span>Já comprado</span>
            </label>
          </FormField>
        </div>

        <FormField label="Notas" id="notas" error={errors.notas}>
          <textarea
            id="notas"
            name="notas"
            value={formData.notas}
            onChange={handleChange}
            placeholder="Detalhes adicionais, links, referências..."
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${errors.notas ? '#dc3545' : '#ddd'}`,
              borderRadius: '4px',
              fontSize: '1rem',
              minHeight: '80px',
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
          />
        </FormField>

        <FormField label="Responsável" id="responsavel" error={errors.responsavel}>
          <input
            id="responsavel"
            type="text"
            name="responsavel"
            value={formData.responsavel}
            onChange={handleChange}
            placeholder="Quem é responsável por este item"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: `1px solid ${errors.responsavel ? '#dc3545' : '#ddd'}`,
              borderRadius: '4px',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />
        </FormField>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? '💾 Salvando...' : '💾 Salvar'}
          </Button>
          {onCancel && (
            <Button variant="secondary" type="button" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
