// ==================== FIREBASE CONFIGURATION ====================

console.log('Firebase global:', typeof firebase);

const firebaseConfig = {
    apiKey: "AIzaSyDv7dvPDrKFHyXrO8YCLpt1dhaoDYK-5i8",
    authDomain: "home-dfe2e.firebaseapp.com",
    projectId: "home-dfe2e",
    storageBucket: "home-dfe2e.firebasestorage.app",
    messagingSenderId: "258813199907",
    appId: "1:258813199907:web:205004bd8c7b2124e0d396",
    measurementId: "G-LL5629TT07"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let firebaseReady = false;
let firestoreListener = null;

// ==================== APP DATA ====================

const APP_DATA = {
    items: [],
    isOnline: navigator.onLine
};

// Track if we've loaded from Firestore
let hasLoadedFromFirestore = false;

// ==================== UTILITY: SHOW MESSAGE ====================

function showMessage(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // Só mostra toast se o DOM estiver pronto
    if (document.body) {
        const messageEl = document.createElement('div');
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#22c55e' : type === 'warning' ? '#f97316' : '#667eea'};
            color: white;
            border-radius: 6px;
            z-index: 9999;
            font-weight: 500;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            animation: slideIn 0.3s ease;
        `;
        messageEl.textContent = message;
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => messageEl.remove(), 300);
        }, 3000);
    }
}

// ==================== INITIAL ITEMS DATA ====================

const INITIAL_ITEMS = [
    // REFORMA - Cozinha
    { id: 1, name: "Pintura das paredes", section: "reforma", comodo: "cozinha", priority: "urgente", responsavel: "ambos", notes: "Cor a definir", completed: false },
    { id: 2, name: "Azulejos para parede da pia", section: "reforma", comodo: "cozinha", priority: "urgente", responsavel: "ambos", notes: "Estilo moderno", completed: false },
    { id: 3, name: "Troca de piso", section: "reforma", comodo: "cozinha", priority: "importante", responsavel: "ambos", notes: "", completed: false },
    
    // REFORMA - Banheiro
    { id: 4, name: "Azulejos do box", section: "reforma", comodo: "banheiro", priority: "urgente", responsavel: "ambos", notes: "Tamanho 20x20", completed: false },
    { id: 5, name: "Pintura", section: "reforma", comodo: "banheiro", priority: "urgente", responsavel: "ambos", notes: "", completed: false },
    { id: 6, name: "Rejuntamento", section: "reforma", comodo: "banheiro", priority: "importante", responsavel: "ambos", notes: "", completed: false },
    
    // REFORMA - Quarto
    { id: 7, name: "Pintura", section: "reforma", comodo: "quarto", priority: "importante", responsavel: "ambos", notes: "Tom claro", completed: false },
    { id: 8, name: "Troca de piso", section: "reforma", comodo: "quarto", priority: "importante", responsavel: "ambos", notes: "", completed: false },
    
    // REFORMA - Escritório
    { id: 9, name: "Pintura", section: "reforma", comodo: "escritorio", priority: "normal", responsavel: "ambos", notes: "", completed: false },
    
    // REFORMA - Sacada
    { id: 10, name: "Impermeabilização", section: "reforma", comodo: "sacada", priority: "importante", responsavel: "ambos", notes: "", completed: false },
    
    // MÓVEIS - Cozinha
    { id: 11, name: "Armários planejados", section: "moveis", comodo: "cozinha", priority: "urgente", responsavel: "ambos", notes: "Branco com detalhes em cinza", completed: false },
    { id: 12, name: "Balcão", section: "moveis", comodo: "cozinha", priority: "urgente", responsavel: "ambos", notes: "", completed: false },
    { id: 13, name: "Bancada de granito/quartzo", section: "moveis", comodo: "cozinha", priority: "urgente", responsavel: "ambos", notes: "", completed: false },
    
    // MÓVEIS - Sala
    { id: 14, name: "Sofá", section: "moveis", comodo: "sala", priority: "urgente", responsavel: "ambos", notes: "Cinza claro, 3 lugares", completed: false },
    { id: 15, name: "Rack", section: "moveis", comodo: "sala", priority: "importante", responsavel: "ambos", notes: "", completed: false },
    { id: 16, name: "Mesa de centro", section: "moveis", comodo: "sala", priority: "importante", responsavel: "ambos", notes: "", completed: false },
    
    // MÓVEIS - Quarto
    { id: 17, name: "Cama Queen", section: "moveis", comodo: "quarto", priority: "urgente", responsavel: "ambos", notes: "Com ou sem estofado", completed: false },
    { id: 18, name: "Guarda-roupa", section: "moveis", comodo: "quarto", priority: "importante", responsavel: "ambos", notes: "Planejado", completed: false },
    { id: 19, name: "Criado mudo", section: "moveis", comodo: "quarto", priority: "importante", responsavel: "ambos", notes: "Um de cada lado da cama", completed: false },
    
    // MÓVEIS - Escritório
    { id: 20, name: "Escrivaninha", section: "moveis", comodo: "escritorio", priority: "importante", responsavel: "ambos", notes: "", completed: false },
    { id: 21, name: "Cadeira gamer", section: "moveis", comodo: "escritorio", priority: "importante", responsavel: "ambos", notes: "", completed: false },
    { id: 22, name: "Estante", section: "moveis", comodo: "escritorio", priority: "normal", responsavel: "ambos", notes: "", completed: false },
    
    // MÓVEIS - Banheiro
    { id: 23, name: "Armário com espelho", section: "moveis", comodo: "banheiro", priority: "importante", responsavel: "ambos", notes: "", completed: false },
    { id: 24, name: "Prateleiras", section: "moveis", comodo: "banheiro", priority: "normal", responsavel: "ambos", notes: "", completed: false },
    
    // ITENS - Cozinha
    { id: 25, name: "Geladeira", section: "itens", comodo: "cozinha", priority: "urgente", responsavel: "ambos", notes: "Frost Free", completed: false },
    { id: 26, name: "Fogão", section: "itens", comodo: "cozinha", priority: "urgente", responsavel: "ambos", notes: "5 bocas", completed: false },
    { id: 27, name: "Microondas", section: "itens", comodo: "cozinha", priority: "importante", responsavel: "ambos", notes: "", completed: false },
    { id: 28, name: "Liquidificador", section: "itens", comodo: "cozinha", priority: "normal", responsavel: "ambos", notes: "", completed: false },
    { id: 29, name: "Jogo de panelas", section: "itens", comodo: "cozinha", priority: "urgente", responsavel: "mulher", notes: "6 peças", completed: false },
    { id: 30, name: "Jogo de talheres", section: "itens", comodo: "cozinha", priority: "importante", responsavel: "mulher", notes: "", completed: false },
    
    // ITENS - Quarto
    { id: 31, name: "Colchão", section: "itens", comodo: "quarto", priority: "urgente", responsavel: "ambos", notes: "Queen size", completed: false },
    { id: 32, name: "Jogo de cama", section: "itens", comodo: "quarto", priority: "urgente", responsavel: "mulher", notes: "4 peças", completed: false },
    { id: 33, name: "Almofadas", section: "itens", comodo: "quarto", priority: "importante", responsavel: "mulher", notes: "", completed: false },
    { id: 34, name: "Cortinas", section: "itens", comodo: "quarto", priority: "importante", responsavel: "mulher", notes: "", completed: false },
    
    // ITENS - Sala
    { id: 35, name: "TV", section: "itens", comodo: "sala", priority: "importante", responsavel: "homem", notes: "55 polegadas", completed: false },
    { id: 36, name: "Rack para TV", section: "itens", comodo: "sala", priority: "importante", responsavel: "ambos", notes: "", completed: false },
    { id: 37, name: "Cortinas", section: "itens", comodo: "sala", priority: "importante", responsavel: "mulher", notes: "", completed: false },
    
    // ITENS - Banheiro
    { id: 38, name: "Chuveiro eletrônico", section: "itens", comodo: "banheiro", priority: "urgente", responsavel: "homem", notes: "", completed: false },
    { id: 39, name: "Espelho", section: "itens", comodo: "banheiro", priority: "importante", responsavel: "ambos", notes: "", completed: false },
    { id: 40, name: "Toalhas", section: "itens", comodo: "banheiro", priority: "importante", responsavel: "mulher", notes: "Jogo 3 peças", completed: false },
    
    // ITENS - Lavanderia
    { id: 41, name: "Máquina de lavar", section: "itens", comodo: "lavanderia", priority: "urgente", responsavel: "ambos", notes: "Automática", completed: false },
    { id: 42, name: "Secadora", section: "itens", comodo: "lavanderia", priority: "importante", responsavel: "ambos", notes: "", completed: false },
    { id: 43, name: "Tanque", section: "itens", comodo: "lavanderia", priority: "normal", responsavel: "ambos", notes: "", completed: false },
    
    // ITENS - Escritório
    { id: 44, name: "Computador", section: "itens", comodo: "escritorio", priority: "importante", responsavel: "homem", notes: "", completed: false },
    { id: 45, name: "Impressora", section: "itens", comodo: "escritorio", priority: "normal", responsavel: "ambos", notes: "", completed: false },
    { id: 46, name: "Luminária de mesa", section: "itens", comodo: "escritorio", priority: "importante", responsavel: "ambos", notes: "", completed: false },
    
    // ITENS - Sacada
    { id: 47, name: "Cadeiras de varanda", section: "itens", comodo: "sacada", priority: "normal", responsavel: "ambos", notes: "", completed: false },
    { id: 48, name: "Mesinha", section: "itens", comodo: "sacada", priority: "normal", responsavel: "ambos", notes: "", completed: false },
];

// ==================== FIRESTORE FUNCTIONS ====================

// Initialize Firestore listener
function initializeFirestoreListener() {
    if (firebaseReady && !firestoreListener) {
        firestoreListener = db.collection('items').onSnapshot((snapshot) => {
            APP_DATA.items = [];
            
            snapshot.forEach((doc) => {
                const item = {
                    id: doc.id,
                    ...doc.data()
                };
                APP_DATA.items.push(item);
            });
            
            hasLoadedFromFirestore = true;
            updateStats();
            renderAll();
            
            // Update localStorage as backup
            saveDataToLocalStorage();
        }, (error) => {
            console.error('Erro ao sincronizar com Firestore:', error);
            showMessage('⚠️ Offline: usando dados locais', 'warning');
        });
    }
}

// Check if Firestore is ready (delay for DOM ready)
setTimeout(() => {
    db.enableNetwork().then(() => {
        firebaseReady = true;
        console.log('✅ Firebase conectado');
        showMessage('✅ Conectado ao Firestore', 'success');
        
        // Check if items already exist in Firestore
        db.collection('items').get().then((snapshot) => {
            if (snapshot.empty) {
                // Populate initial items
                populateInitialItems();
            } else {
                // Initialize listener
                initializeFirestoreListener();
            }
        }).catch((error) => {
            console.error('Erro ao verificar items:', error);
            loadDataFromLocalStorage();
        });
    }).catch((error) => {
        console.error('Erro ao conectar ao Firebase:', error);
        firebaseReady = false;
        loadDataFromLocalStorage();
        showMessage('⚠️ Offline: usando dados locais', 'warning');
    });
}, 100);

// Populate initial items
async function populateInitialItems() {
    try {
        const batch = db.batch();
        let count = 0;
        
        INITIAL_ITEMS.forEach((item) => {
            const docRef = db.collection('items').doc();
            batch.set(docRef, {
                ...item,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            count++;
        });
        
        await batch.commit();
        console.log(`✅ ${count} itens iniciais adicionados ao Firestore`);
        
        // Now setup listener
        initializeFirestoreListener();
    } catch (error) {
        console.error('Erro ao popular itens iniciais:', error);
        loadDataFromLocalStorage();
    }
}

// Add item to Firestore
async function addItemToFirestore(itemData) {
    try {
        const docRef = await db.collection('items').add({
            ...itemData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Item adicionado com ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Erro ao adicionar item:', error);
        throw error;
    }
}

// Update item in Firestore
async function updateItemInFirestore(id, updates) {
    try {
        await db.collection('items').doc(id).update({
            ...updates,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Item atualizado:', id);
    } catch (error) {
        console.error('Erro ao atualizar item:', error);
        throw error;
    }
}

// Delete item from Firestore
async function deleteItemFromFirestore(id) {
    try {
        await db.collection('items').doc(id).delete();
        console.log('Item deletado:', id);
    } catch (error) {
        console.error('Erro ao deletar item:', error);
        throw error;
    }
}

// Toggle item completion in Firestore
async function toggleItemCompletionInFirestore(id, currentState) {
    try {
        await updateItemInFirestore(id, { completed: !currentState });
    } catch (error) {
        console.error('Erro ao atualizar conclusão do item:', error);
    }
}

// ==================== LOCAL STORAGE BACKUP ====================

function saveDataToLocalStorage() {
    localStorage.setItem('appHomeDataBackup', JSON.stringify(APP_DATA.items));
}

function loadDataFromLocalStorage() {
    const saved = localStorage.getItem('appHomeDataBackup');
    if (saved) {
        APP_DATA.items = JSON.parse(saved);
        console.log('Dados carregados do backup local');
    } else {
        // Use initial items
        APP_DATA.items = JSON.parse(JSON.stringify(INITIAL_ITEMS.map((item, index) => ({
            id: String(index + 1),
            ...item
        }))));
    }
    updateStats();
    renderAll();
}

// Render something immediately so mobile browsers don't sit on a blank screen
loadDataFromLocalStorage();

// Get item by ID
function getItemById(id) {
    return APP_DATA.items.find(item => item.id === id);
}

// Filter items
function filterItems(filterType) {
    if (filterType === 'all') return APP_DATA.items;
    if (filterType === 'comprado') return APP_DATA.items.filter(i => i.completed);
    if (filterType === 'pendente') return APP_DATA.items.filter(i => !i.completed);
    return APP_DATA.items.filter(i => i.priority === filterType);
}

// Get responsavel label
function getResponsavelLabel(responsavel) {
    const labels = {
        'ambos': '👫 Ambos',
        'homem': '👨 Homem',
        'mulher': '👩 Mulher'
    };
    return labels[responsavel] || responsavel;
}

// Get priority icon and label
function getPriorityInfo(priority) {
    const info = {
        'urgente': { icon: '🔴', label: 'Urgente' },
        'importante': { icon: '🟡', label: 'Importante' },
        'normal': { icon: '🟢', label: 'Normal' }
    };
    return info[priority] || { icon: '⭕', label: priority };
}

// Render item element
function createItemElement(item, currentFilter = 'all') {
    const li = document.createElement('li');
    li.className = `item ${item.priority} ${item.completed ? 'comprado' : ''}`;
    li.id = `item-${item.id}`;
    
    const priorityInfo = getPriorityInfo(item.priority);
    
    li.innerHTML = `
        <input type="checkbox" class="item-checkbox" ${item.completed ? 'checked' : ''} data-id="${item.id}">
        <div class="item-content">
            <div class="item-name">
                <span>${item.name}</span>
            </div>
            <div class="item-meta">
                <span class="item-priority ${item.priority}">${priorityInfo.icon} ${priorityInfo.label}</span>
                <span class="item-responsavel">${getResponsavelLabel(item.responsavel)}</span>
                ${item.notes ? `<span class="item-notes">📝 ${item.notes}</span>` : ''}
            </div>
        </div>
        <div class="item-actions">
            <button class="btn-action btn-promo" data-id="${item.id}" title="Buscar Promoções">🔍 Promo</button>
            <button class="btn-action btn-edit" data-id="${item.id}" title="Editar">✏️</button>
            <button class="btn-action btn-delete" data-id="${item.id}" title="Deletar">🗑️</button>
        </div>
    `;
    
    // Add event listeners
    li.querySelector('.item-checkbox').addEventListener('change', (e) => {
        const completed = e.target.checked;
        toggleItemCompletionInFirestore(item.id, item.completed);
    });
    
    li.querySelector('.btn-promo').addEventListener('click', () => {
        openPromocoesForItem(item.id);
    });

    li.querySelector('.btn-edit').addEventListener('click', () => {
        openEditModal(item.id);
    });
    
    li.querySelector('.btn-delete').addEventListener('click', () => {
        if (confirm(`Deletar "${item.name}"?`)) {
            deleteItemFromFirestore(item.id).catch(() => {
                alert('Erro ao deletar item');
            });
        }
    });
    
    return li;
}

// Render sections view
function renderSectionsView(currentFilter = 'all') {
    const sections = [
        { id: 'reforma', name: 'Reforma' },
        { id: 'moveis', name: 'Móveis' },
        { id: 'itens', name: 'Itens Gerais' }
    ];
    
    const comodos = [
        { id: 'cozinha', name: 'Cozinha Integrada' },
        { id: 'sala', name: 'Sala' },
        { id: 'quarto', name: 'Quarto Principal' },
        { id: 'banheiro', name: 'Banheiro' },
        { id: 'escritorio', name: 'Escritório' },
        { id: 'sacada', name: 'Sacada' },
        { id: 'lavanderia', name: 'Lavanderia' }
    ];
    
    sections.forEach(section => {
        comodos.forEach(comodo => {
            const listId = `${section.id}-${comodo.id}`;
            const ulElement = document.getElementById(listId);
            
            if (ulElement) {
                const items = APP_DATA.items.filter(item => 
                    item.section === section.id && 
                    item.comodo === comodo.id &&
                    filterItems(currentFilter).includes(item)
                );
                
                ulElement.innerHTML = '';
                
                if (items.length === 0) {
                    ulElement.innerHTML = '<div class="empty-state"><p>Nenhum item nesta seção</p></div>';
                } else {
                    items.forEach(item => {
                        ulElement.appendChild(createItemElement(item, currentFilter));
                    });
                }
            }
        });
    });
}

// Render comodos view
function renderComodosView(currentFilter = 'all') {
    const comodos = [
        { id: 'cozinha', displayId: 'comodo-cozinha-all' },
        { id: 'sala', displayId: 'comodo-sala-all' },
        { id: 'quarto', displayId: 'comodo-quarto-all' },
        { id: 'banheiro', displayId: 'comodo-banheiro-all' },
        { id: 'escritorio', displayId: 'comodo-escritorio-all' },
        { id: 'sacada', displayId: 'comodo-sacada-all' },
        { id: 'lavanderia', displayId: 'comodo-lavanderia-all' }
    ];
    
    comodos.forEach(comodo => {
        const ulElement = document.getElementById(comodo.displayId);
        
        if (ulElement) {
            const items = APP_DATA.items.filter(item => 
                item.comodo === comodo.id &&
                filterItems(currentFilter).includes(item)
            );
            
            ulElement.innerHTML = '';
            
            if (items.length === 0) {
                ulElement.innerHTML = '<div class="empty-state"><p>Nenhum item neste cômodo</p></div>';
            } else {
                items.forEach(item => {
                    ulElement.appendChild(createItemElement(item, currentFilter));
                });
            }
        }
    });
}

// Render priority view
function renderPriorityView(currentFilter = 'all') {
    const priorities = ['urgente', 'importante', 'normal'];
    
    priorities.forEach(priority => {
        const listId = `priority-${priority}`;
        const ulElement = document.getElementById(listId);
        
        if (ulElement) {
            const items = APP_DATA.items.filter(item => 
                item.priority === priority &&
                filterItems(currentFilter).includes(item)
            );
            
            ulElement.innerHTML = '';
            
            if (items.length === 0) {
                ulElement.innerHTML = '<div class="empty-state"><p>Nenhum item nesta prioridade</p></div>';
            } else {
                items.forEach(item => {
                    ulElement.appendChild(createItemElement(item, currentFilter));
                });
            }
        }
    });
}

// Render all views
function renderAll(currentFilter = 'all') {
    renderSectionsView(currentFilter);
    renderComodosView(currentFilter);
    renderPriorityView(currentFilter);
}

// Update statistics
function updateStats() {
    const totalItems = APP_DATA.items.length;
    const completedItems = APP_DATA.items.filter(i => i.completed).length;
    
    // Update overall progress
    const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    document.getElementById('progressFill').style.width = percentage + '%';
    document.getElementById('progressPercent').textContent = percentage;
    
    // Update section stats
    const sections = ['reforma', 'moveis', 'itens'];
    sections.forEach(section => {
        const sectionItems = APP_DATA.items.filter(i => i.section === section);
        const sectionCompleted = sectionItems.filter(i => i.completed).length;
        const statElement = document.getElementById(`stats-${section}`);
        if (statElement) {
            statElement.textContent = `${sectionCompleted}/${sectionItems.length}`;
        }
    });
    
    // Update comodo stats
    const comodos = ['cozinha', 'sala', 'quarto', 'banheiro', 'escritorio', 'sacada', 'lavanderia'];
    
    sections.forEach(section => {
        comodos.forEach(comodo => {
            const items = APP_DATA.items.filter(i => i.section === section && i.comodo === comodo);
            const completed = items.filter(i => i.completed).length;
            const statElement = document.getElementById(`stats-${section}-${comodo}`);
            if (statElement) {
                statElement.textContent = `${completed}/${items.length}`;
            }
        });
    });
    
    // Update comodo total stats
    comodos.forEach(comodo => {
        const items = APP_DATA.items.filter(i => i.comodo === comodo);
        const completed = items.filter(i => i.completed).length;
        const statElement = document.getElementById(`stats-${comodo}-total`);
        if (statElement) {
            statElement.textContent = `${completed}/${items.length}`;
        }
    });
    
    // Update priority stats
    ['urgente', 'importante', 'normal'].forEach(priority => {
        const items = APP_DATA.items.filter(i => i.priority === priority);
        const completed = items.filter(i => i.completed).length;
        const statElement = document.getElementById(`stats-${priority}-total`);
        if (statElement) {
            statElement.textContent = `${completed}/${items.length}`;
        }
    });
}

// ==================== FORM HANDLERS ====================

document.getElementById('addItemForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const itemData = {
        name: document.getElementById('itemName').value,
        section: document.getElementById('itemSection').value,
        comodo: document.getElementById('itemComodo').value,
        priority: document.getElementById('itemPriority').value,
        responsavel: document.getElementById('itemResponsavel').value,
        notes: document.getElementById('itemNotes').value,
        completed: false
    };
    
    if (itemData.name && itemData.section && itemData.comodo && itemData.responsavel) {
        addItemToFirestore(itemData)
            .then(() => {
                document.getElementById('addItemForm').reset();
                showMessage('✅ Item adicionado com sucesso!', 'success');
            })
            .catch((error) => {
                showMessage('❌ Erro ao adicionar item', 'warning');
                console.error(error);
            });
    } else {
        showMessage('⚠️ Por favor, preencha todos os campos obrigatórios!', 'warning');
    }
});

// ==================== FILTER & VIEW HANDLERS ====================

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        renderAll(filter);
    });
});

document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const view = btn.dataset.view;
        document.querySelectorAll('.view-container').forEach(v => v.style.display = 'none');
        
        if (view === 'sections') {
            document.getElementById('sectionsView').style.display = 'flex';
        } else if (view === 'comodos') {
            document.getElementById('comodosView').style.display = 'flex';
        } else if (view === 'prioridade') {
            document.getElementById('prioridadeView').style.display = 'flex';
        }
    });
});

// ==================== MODAL HANDLERS ====================

let editingItemId = null;

function openEditModal(id) {
    const item = getItemById(id);
    if (item) {
        editingItemId = id;
        document.getElementById('editItemName').value = item.name;
        document.getElementById('editItemNotes').value = item.notes;
        document.getElementById('editItemResponsavel').value = item.responsavel;
        document.getElementById('editModal').classList.add('show');
    }
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('show');
    editingItemId = null;
}

document.querySelector('.close').addEventListener('click', closeEditModal);

document.getElementById('editItemForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (editingItemId) {
        const updates = {
            name: document.getElementById('editItemName').value,
            notes: document.getElementById('editItemNotes').value,
            responsavel: document.getElementById('editItemResponsavel').value
        };
        
        updateItemInFirestore(editingItemId, updates)
            .then(() => {
                showMessage('✅ Item atualizado!', 'success');
                closeEditModal();
            })
            .catch(() => {
                showMessage('❌ Erro ao atualizar item', 'warning');
            });
    }
});

window.addEventListener('click', (e) => {
    const modal = document.getElementById('editModal');
    if (e.target === modal) {
        closeEditModal();
    }
});

// ==================== PROMOÇÕES MODAL ====================

function getPromoApiUrl() {
    if (window.location.protocol === 'file:') {
        return 'http://localhost:3001/api/buscar-promocoes';
    }

    return '/api/buscar-promocoes';
}

let currentItemForPromo = null;

function openPromocoesForItem(itemId) {
    const item = getItemById(itemId);
    if (!item) return;

    currentItemForPromo = item;

    const modal = document.getElementById('promocoesModal');
    const content = document.getElementById('promocoesContent');
    const loading = document.getElementById('loadingPromo');

    loading.style.display = 'block';
    content.innerHTML = '';
    modal.classList.add('show');

    buscarPromocoes(item.name, item.notes);
}

function openPromocoesModal() {
    if (!editingItemId) {
        showMessage('⚠️ Selecione um item primeiro', 'warning');
        return;
    }
    
    openPromocoesForItem(editingItemId);
}

function closePromocoesModal() {
    document.getElementById('promocoesModal').classList.remove('show');
    currentItemForPromo = null;
}

async function buscarPromocoes(itemName, notes) {
    try {
        const response = await fetch(getPromoApiUrl(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                itemName: itemName,
                notes: notes
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        exibirResultadosPromocoes(data);
    } catch (error) {
        console.error('Erro ao buscar promoções:', error);
        document.getElementById('loadingPromo').style.display = 'none';
        document.getElementById('promocoesContent').innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <p>⚠️ Erro ao buscar promoções</p>
                <p style="font-size: 0.9rem;">Se estiver testando localmente com arquivo aberto, rode o backend com <code>npm start</code>.</p>
                <p style="font-size: 0.85rem; margin-top: 1rem;">Em deploy, a API roda junto com o site na mesma origem.</p>
            </div>
        `;
    }
}

function exibirResultadosPromocoes(data) {
    document.getElementById('loadingPromo').style.display = 'none';
    const content = document.getElementById('promocoesContent');
    
    if (!data.sources || data.sources.length === 0) {
        content.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <p>😔 Nenhuma promoção encontrada para "${data.query}"</p>
                <p style="font-size: 0.9rem;">Tente abrir de novo com um nome mais curto ou usar só o nome do item</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    data.sources.forEach(source => {
        if (!source.results || source.results.length === 0) return;
        
        html += `
            <div class="promocoes-source">
                <h3>${source.source === 'Mercado Livre' ? '🛍️' : source.source === 'Amazon' ? '📦' : '🏪'} ${source.source}${source.searchUsed ? ` <span class="promo-search-used">(${source.searchUsed})</span>` : ''}</h3>
                <div class="promocoes-grid">
        `;
        
        source.results.forEach(item => {
            const price = typeof item.price === 'number' 
                ? `R$ ${item.price.toFixed(2).replace('.', ',')}`
                : item.price;
            
            const image = item.thumbnail || item.image || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22150%22%3E%3Crect fill=%22%23ddd%22 width=%22200%22 height=%22150%22/%3E%3C/svg%3E';
            
            html += `
                <a href="${item.permalink || item.link}" target="_blank" class="promo-item">
                    <img src="${image}" alt="${item.title}" class="promo-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22150%22%3E%3Crect fill=%22%23ddd%22 width=%22200%22 height=%22150%22/%3E%3C/svg%3E'">
                    <div class="promo-info">
                        <div class="promo-title">${item.title}</div>
                        <div class="promo-price">${price}</div>
                        ${item.seller_name ? `<div class="promo-meta">👤 ${item.seller_name}</div>` : ''}
                        ${item.shipping ? `<div class="promo-meta">📦 ${item.shipping}</div>` : ''}
                        ${item.condition ? `<div class="promo-meta">📌 ${item.condition}</div>` : ''}
                    </div>
                </a>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    content.innerHTML = html;
}

// Event listeners para modal de promoções
document.getElementById('buscarPromocoesBtn').addEventListener('click', (e) => {
    e.preventDefault();
    openPromocoesModal();
});

// Fechar modal de promoções
const promocoesModal = document.getElementById('promocoesModal');
const closePromoBtn = promocoesModal.querySelector('.close');
closePromoBtn.addEventListener('click', closePromocoesModal);

window.addEventListener('click', (e) => {
    if (e.target === promocoesModal) {
        closePromocoesModal();
    }
});

// ==================== ONLINE/OFFLINE HANDLER ====================

window.addEventListener('online', () => {
    APP_DATA.isOnline = true;
    showMessage('✅ Conectado novamente!', 'success');
    db.enableNetwork().then(() => {
        initializeFirestoreListener();
    });
});

window.addEventListener('offline', () => {
    APP_DATA.isOnline = false;
    showMessage('⚠️ Modo offline - dados salvos localmente', 'warning');
});

// ==================== CSS ANIMATIONS ====================

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ==================== INITIALIZE ====================

document.addEventListener('DOMContentLoaded', () => {
    console.log('App inicializada, aguardando conexão com Firestore...');
    // Firestore will initialize automatically when ready
});
