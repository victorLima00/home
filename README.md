# 🏠 HOME - Organização do Apartamento

Um projeto HTML/CSS/JavaScript para organizar a reforma e mobiliário de um apartamento de 36m², com prazo até **setembro de 2027**.

## 📋 Funcionalidades

### 📊 Visualizações
- **Por Cômodo (Páginas)**: cada cômodo funciona como uma página dedicada, com cards por tópico
- **Por Seção**: Organizada por Reforma, Móveis Planejados e Itens Gerais
- **Por Cômodo**: Agrupa todos os itens de cada cômodo
- **Por Prioridade**: Mostra itens organizados por urgência

### 🧩 Nova Estrutura de Apresentação
- Cada cômodo é uma página navegável no topo da área principal
- Dentro da página do cômodo, os tópicos ficam separados em cards:
   - 🔨 Reforma
   - 🛋️ Planejados
   - 📦 Itens
- Cada card possui um modelo 3D real (Three.js) para facilitar leitura e contexto

### 🔗 Rotas por Cômodo
- A navegação por cômodo atualiza a URL com query string
- Exemplos:
   - `?view=roompages&comodo=cozinha`
   - `?view=roompages&comodo=quarto`
   - `?view=sections`
- Ao abrir o link, o app restaura automaticamente a view e o cômodo selecionado

### 🏘️ Cômodos
- Cozinha Integrada (com Lavanderia e Sala)
- Sala
- Quarto Principal
- Banheiro
- Escritório
- Sacada
- Lavanderia

### ⚡ Prioridades
- 🔴 **Urgente**: Comprar primeiro
- 🟡 **Importante**: Segunda prioridade
- 🟢 **Normal**: Terceira prioridade

### ✅ Funcionalidades
- ✔️ Marcar itens como comprados
- ➕ Adicionar novos itens
- ✏️ Editar itens existentes
- 🗑️ Deletar itens
- 📊 Progresso geral e por seção
- 🔍 Filtrar por prioridade
- 👫👨👩 Atribuição de responsáveis (Ambos, Homem, Mulher)
- 💾 Dados salvos automaticamente no navegador

## 🚀 Como Usar

### Abrir o Projeto
1. Abra o arquivo `index.html` em um navegador web
2. O projeto carrega automaticamente com uma lista inicial de itens sugeridos

### Adicionar Itens
1. Preencha o formulário no painel lateral com:
   - Nome do item
   - Seção (Reforma, Móveis, Itens Gerais)
   - Cômodo
   - Prioridade
   - Responsável
   - Notas (opcional)
2. Clique em "Adicionar Item"

### Marcar como Comprado
- Clique no checkbox ao lado do item
- O item será marcado como comprado (com risco na descrição)

### Editar Itens
- Clique no botão ✏️ para editar nome, notas e responsável
- As mudanças são salvas automaticamente

### Deletar Itens
- Clique no botão 🗑️ para remover um item
- Confirme a exclusão

### Filtrar Itens
Use os botões de filtro superior para ver:
- Todos os itens
- Apenas urgentes
- Apenas importantes
- Apenas normais
- Apenas pendentes
- Apenas comprados

### Trocar Visualização
Use os botões de visualização (🏡 📋 📊 ⚡) para:
- 🏡 **Por Cômodo (Páginas)**: navegação por cômodo com cards de tópico e visual 3D
- 📋 **Por Seção**: Ver organizado por Reforma, Móveis e Itens
- 🏘️ **Por Cômodo**: Ver tudo de cada cômodo junto
- ⚡ **Por Prioridade**: Ver itens organizados por urgência

## 📦 Itens Sugeridos

O projeto vem pré-carregado com uma lista sugerida de 48 itens divididos em:
- **Reforma**: 10 itens
- **Móveis Planejados**: 13 itens
- **Itens Gerais da Casa**: 25 itens

Você pode modificar, deletar ou adicionar novos itens conforme necessário.

## 💾 Dados

Os dados são salvos automaticamente no armazenamento local do navegador (localStorage), então:
- ✅ Os dados persistem entre sessões
- ✅ Não é necessário fazer login
- ✅ Os dados ficam apenas no seu computador
- ⚠️ Limpar o cache do navegador pode apagar os dados

Se quiser resetar para a lista original, abra o DevTools (F12) e execute:
```javascript
localStorage.removeItem('appHomeData');
location.reload();
```

## 📊 Barra de Progresso

A barra superior mostra:
- Percentual de itens comprados
- Progresso por seção
- Progresso por cômodo

## 👥 Responsáveis

Os itens podem ser atribuídos a:
- 👫 Ambos
- 👨 Homem
- 👩 Mulher

Isso ajuda a dividir as responsabilidades de compra.

## 🎨 Design Responsivo

O projeto funciona bem em:
- 💻 Desktop
- 📱 Tablet
- 📲 Smartphone

## 📝 Notas

- Adicione notas aos itens para especificar cores, tamanhos ou preferências
- Use filtros para encontrar o que precisa rápido
- Revise o progresso regularmente até setembro de 2027

---

**Prazo**: Setembro de 2027  
**Apartamento**: 36m²  
**Morador**: Casal (Homem e Mulher)
