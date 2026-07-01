# 🎉 Sistema de Busca de Promoções - Guia de Uso

## 📋 Pré-requisitos

- **Node.js** (versão 14+ recomendado)
- **npm** (incluído com Node.js)

## 🚀 Instalação e Configuração

### 1️⃣ Instalar Dependências

Abra o terminal na pasta do projeto e execute:

```bash
npm install
```

Isso vai instalar:
- **Express**: Framework web
- **CORS**: Permite requisições do frontend
- **node-fetch**: Busca HTTP
- **cheerio**: Scraping HTML

### 2️⃣ Iniciar o Backend

Em um terminal, execute:

```bash
npm start
```

ou

```bash
node backend.js
```

Você deve ver:
```
🚀 Servidor de Promoções iniciado!
📍 Rodando em: http://localhost:3001
```

**NÃO FECHE ESTE TERMINAL!** O servidor precisa estar rodando para a feature funcionar.

### 3️⃣ Usar a Feature no App

1. Abra `index.html` no navegador
2. Clique em um item na lista
3. Clique no botão **"🔍 Buscar Promoções"** no modal de edição
4. Aguarde alguns segundos enquanto o sistema busca em múltiplas lojas

## 🔍 Fontes de Promoções

O sistema busca automaticamente em:

| Fonte | Cobertura | Velocidade |
|-------|-----------|-----------|
| **Mercado Livre** 🛍️ | Produtos brasileiros | ⚡ Rápido |
| **Amazon** 📦 | Milhões de produtos | ⚡⚡ Médio |
| **Magazine Luiza** 🏪 | Eletrônicos e móveis | ⚡⚡ Médio |

## 💡 Como Funciona

### Frontend → Backend → Lojas

```
┌─────────────────────────────────────────────┐
│ 1. Usuário clica "🔍 Buscar Promoções"      │
│    (Nome do item + Notas do usuário)        │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 2. Servidor Node.js processa                │
│    - Formata query: "Sofá azul em promoção" │
│    - Envia para 3 fontes simultane amente   │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 3. Resultados retornam                      │
│    - Preços                                  │
│    - Imagens                                 │
│    - Links (clicáveis)                       │
└──────────────────┬──────────────────────────┘
                   ▼
┌─────────────────────────────────────────────┐
│ 4. Modal exibe resultados organizados       │
└─────────────────────────────────────────────┘
```

## ⚙️ Configuração Avançada

### Mudar Porta do Servidor

No `backend.js`, procure por:
```javascript
const PORT = process.env.PORT || 3001;
```

Para usar outra porta (ex: 8080):
```bash
PORT=8080 npm start
```

### Desabilitar Fonte Específica

Para focar em apenas uma loja, edite `backend.js` na função `/api/buscar-promocoes` e comente as linhas desejadas:

```javascript
// Comente a linha para desabilitar uma fonte
const [mlResults, amazonResults, magazineResults] = await Promise.all([
    buscarMercadoLivre(query),           // Comente esta linha
    // buscarAmazon(query),              // Desabilita Amazon
    buscarMagazineLuiza(query)
]);
```

## 🐛 Troubleshooting

### ❌ "Erro ao buscar promoções" ou "Servidor não está rodando"

**Solução**: 
1. Verifique se abriu outro terminal com `npm start`
2. O servidor deve estar rodando em `http://localhost:3001`
3. Verifique o console do terminal para erros

### ❌ "Nenhuma promoção encontrada"

**Possíveis causas**:
- Termo muito específico (tente: "sofá" em vez de "sofá azul retrátil")
- Loja fora do estoque
- Problema de scraping (sites mudam HTML frequentemente)

**Solução**: Tente outra busca ou modifique as notas do item

### ❌ Imagens não aparecem

**Normal!** Algumas lojas bloqueiam imagens via scraping. Mas o link funciona (clique no item para ir à loja)

### ❌ Servidor dá erro "Address already in use"

Alguém já está usando a porta 3001:
```bash
# Use outra porta
PORT=3002 npm start
```

## 📊 Logs e Debug

Para ver logs detalhados, adicione no browser (F12 → Console):
```javascript
localStorage.debug = '*';
```

Para ver requisições no servidor, o Node.js já mostra tudo automaticamente.

## 🔐 Notas de Segurança

- ✅ Sem custos (APIs públicas)
- ✅ Sem credenciais armazenadas (open APIs)
- ✅ Dados do usuário não são enviados para nenhum lugar (apenas item name + notes para as lojas)
- ⚠️ Requisições podem ser lentas em conexões lentas (~3-5s)

## 📚 Estrutura do Projeto

```
/Users/victor/Documents/Home/
├── index.html              # Frontend
├── script.js               # Lógica + integração com promoções
├── styles.css              # Design
├── backend.js              # ⭐ Servidor de promoções
├── package.json            # Dependências
└── README.md               # Este arquivo
```

## 🎯 Próximas Features Possíveis

- [ ] Alertas de preço (notificar quando cai o preço)
- [ ] Histórico de promoções vistas
- [ ] Comparação de preços entre lojas
- [ ] Integração com mais lojas (Shopee, AliExpress, etc.)
- [ ] Salvar links favoritos

---

**Dúvidas?** Revise os logs do terminal onde `npm start` está rodando! 🚀
