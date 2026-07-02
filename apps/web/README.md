/**

- README - apps/web
-
- Frontend moderno do HOME em Next.js
-
- ## Estrutura
-
- - `app/`: App Router do Next.js (páginas, layouts, routes)
- - `components/`: Componentes React reutilizáveis
- - `hooks/`: Custom hooks
- - `lib/`: Utilitários (API client, schemas, validação)
- - `styles/`: Estilos globais e módulos CSS
-
- ## Setup
-
- ```bash

  ```
- npm install
- cp .env.local.example .env.local
- npm run dev
- ```

  ```
-
- Acesse em `http://localhost:3000`
-
- ## Características
-
- - ✅ Next.js 15 com App Router
- - ✅ TypeScript fim-a-fim
- - ✅ Zod para validação
- - ✅ API client tipado
- - ✅ Layouts aninhados
- - ✅ Pronto para integração com Firestore
-
- ## Padrões
-
- - Componentes: Functional components com hooks
- - Estado: Props drilling + (futuro) Context API ou Zustand
- - Dados: API client tipado em `lib/api-client.ts`
- - Validação: Schemas Zod em `lib/schemas.ts`
-
- ## Próximos Passos
-
- 1.  Criar componentes base (Button, Card, Layout, etc)
- 2.  Integrar Firestore para dados de itens
- 3.  Implementar chamadas para backend de promoções
- 4.  Adicionar estados de loading/erro
- 5.  Design tokens e acessibilidade
      */
