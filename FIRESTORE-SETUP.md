# 🔧 Configuração: HOME + Firestore

## ✅ O que foi feito

Seu projeto HOME foi **integrado com o Firestore**! Agora os dados persistem na nuvem do Firebase.

### Mudanças realizadas:

✅ **index.html**
- Adicionados scripts do Firebase SDK (versão 10.7.0)

✅ **script.js**
- Integração completa com Firestore
- Sincronização em tempo real (realtime listener)
- CRUD operations (Create, Read, Update, Delete)
- Fallback para localStorage (modo offline)
- Notificações toast melhoradas

---

## 📋 Verificação: Passos completados no Firebase

### ✅ 1. Credenciais (já fornecidas por você)
```javascript
apiKey: "AIzaSyDv7dvPDrKFHyXrO8YCLpt1dhaoDYK-5i8"
authDomain: "home-dfe2e.firebaseapp.com"
projectId: "home-dfe2e"
storageBucket: "home-dfe2e.firebasestorage.app"
messagingSenderId: "258813199907"
appId: "1:258813199907:web:205004bd8c7b2124e0d396"
measurementId: "G-LL5629TT07"
```

### ✅ 2. Collection (você criou)
- **Nome**: `items`
- **Campos**: name, section, comodo, priority, responsavel, notes, completed
- **Status**: ✅ Pronta para usar

---

## 🔑 IMPORTANTE: Regras de Segurança

### ⚠️ Você PRECISA fazer isso no Firebase Console:

1. **Abra**: [Firestore Database → Regras](https://console.firebase.google.com/project/home-dfe2e/firestore/rules?hl=pt-br)

2. **Substitua o conteúdo** por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura e escrita para todos (desenvolvimento)
    // ⚠️ Em produção, implemente autenticação!
    match /items/{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. **Clique em "Publicar"**

### ⚠️ Segurança em Produção (Recomendado futuramente):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Autenticação via usuário
    match /users/{uid}/items/{document=**} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

---

## 🚀 Como Funciona Agora

### 1️⃣ **Primeira vez que abrir**
- App detecta coleção vazia
- Automaticamente carrega os 48 itens iniciais **para o Firestore**
- Exibe: ✅ "Conectado ao Firestore"

### 2️⃣ **Adições e Edições**
- Quando você **adiciona um item** → vai direto para Firestore
- Quando você **edita um item** → atualiza no Firestore
- Quando você **deleta um item** → remove do Firestore
- Quando você **marca como comprado** → sincroniza no Firestore

### 3️⃣ **Sincronização em Tempo Real**
- App fica "escutando" mudanças no Firestore
- Se outro dispositivo adiciona item → aparece automaticamente
- Se internet cair → continua usando dados locais (localStorage)
- Quando volta online → sincroniza tudo

### 4️⃣ **Modo Offline**
- Dados salvos automaticamente em `localStorage` como backup
- Se Firestore cair, app continua 100% funcional
- Quando volta online, sincroniza com Firestore

---

## 📊 Estrutura no Firestore

Seus documentos agora têm este formato:

```json
{
  "name": "Sofá",
  "section": "moveis",
  "comodo": "sala",
  "priority": "urgente",
  "responsavel": "ambos",
  "notes": "Cinza claro, 3 lugares",
  "completed": false,
  "createdAt": 2026-07-01T10:30:00Z,
  "updatedAt": 2026-07-01T10:35:00Z
}
```

---

## 🧪 Testando

### Para verificar se está funcionando:

1. **Abra o app** em `index.html`
2. **Console do navegador** (F12) deve mostrar:
   ```
   ✅ Firebase conectado
   ✅ 48 itens iniciais adicionados ao Firestore
   ```

3. **Adicione um item** e verifique no Firebase Console:
   - Vá para: Firestore Database
   - Clique em `items`
   - Novo documento deve aparecer em tempo real

4. **Teste offline**:
   - Abra DevTools (F12)
   - Vá em "Network" e marque "Offline"
   - App deve continuar funcionando
   - Adicione/edite itens
   - Desmarque "Offline"
   - Itens devem sincronizar automaticamente

---

## 📱 Dados em Múltiplos Dispositivos

Como os dados estão no Firestore agora, você pode:

✅ Usar em **desktop** e **celular** simultaneamente  
✅ Abrir em **duas abas diferentes** - atualizações em tempo real  
✅ Compartilhar com outro usuário (depois implementamos autenticação)

---

## 🔐 Próximos Passos (Opcionais)

1. **Implementar Login/Senha** ou **Google Sign-In**
2. **Regras mais seguras** por usuário
3. **Backup automático** para Google Drive
4. **Histórico de mudanças** (quem editou e quando)
5. **Compartilhar com o casal** (outro login)

---

## ⚠️ Troubleshooting

### App não conecta ao Firestore?
- Verifique se as **credenciais** estão corretas
- Verifique se as **regras de segurança** foram publicadas
- Abra DevTools (F12) → Console, procure por erros

### Dados não sincronizam?
- Verifique conexão de internet
- Abra DevTools → Network → veja se há chamadas para `firebaseio.com`
- Limpe o cache: `Ctrl+Shift+Del` (ou `Cmd+Shift+Del` no Mac)

### Quero resetar tudo?
- Abra DevTools (F12) → Console
- Digite: `db.collection('items').get().then(snapshot => { snapshot.forEach(doc => doc.ref.delete()); })`
- Recarregue a página

---

## 📞 Suporte

Se tiver problemas:

1. Verifique o **Console do navegador** (F12)
2. Verifique o **Firebase Console** se items estão sendo salvos
3. Tente limpar cache e recarregar
4. Teste em modo **incógnito** para descartar extensões do navegador

---

**Pronto! Seu app HOME está integrado com o Firestore! 🎉**

Os dados agora persistem na nuvem e sincronizam em tempo real. 🚀
