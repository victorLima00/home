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
// Intencionalmente carregado no DOMContentLoaded para evitar TDZ das constantes de UI.

// Get item by ID
function getItemById(id) {
    return APP_DATA.items.find(item => item.id === id);
}

const COMODOS_META = (window.FRONTEND_META && Array.isArray(window.FRONTEND_META.comodos) && window.FRONTEND_META.comodos.length > 0)
    ? window.FRONTEND_META.comodos
    : [
        { id: 'cozinha', icon: '👨‍🍳', nome: 'Cozinha Integrada', descricao: 'Integra cozinha, sala e lavanderia no mesmo fluxo.' },
        { id: 'sala', icon: '🛋️', nome: 'Sala', descricao: 'Conforto, convivência e eletrônicos.' },
        { id: 'quarto', icon: '🛏️', nome: 'Quarto Principal', descricao: 'Descanso, organização e iluminação.' },
        { id: 'banheiro', icon: '🚿', nome: 'Banheiro', descricao: 'Acabamentos, funcionalidade e bem-estar.' },
        { id: 'escritorio', icon: '💼', nome: 'Escritório', descricao: 'Produtividade e ergonomia do ambiente.' },
        { id: 'sacada', icon: '🌳', nome: 'Sacada', descricao: 'Lazer, ventilação e área externa.' },
        { id: 'lavanderia', icon: '🧺', nome: 'Lavanderia', descricao: 'Rotina prática de limpeza e organização.' }
    ];

const TOPICOS_META = (window.FRONTEND_META && Array.isArray(window.FRONTEND_META.topicos) && window.FRONTEND_META.topicos.length > 0)
    ? window.FRONTEND_META.topicos
    : [
        { id: 'reforma', titulo: '🔨 Reforma', modelLabel: 'Estrutura e obra' },
        { id: 'moveis', titulo: '🛋️ Planejados', modelLabel: 'Layout e marcenaria' },
        { id: 'itens', titulo: '📦 Itens', modelLabel: 'Objetos e utilidades' }
    ];

let selectedRoomPage = 'cozinha';
let currentFilter = 'all';
let currentView = 'roompages';
let currentSearchTerm = '';
const roomThreeScenes = [];
let roomThreeAnimationId = null;

function isValidComodo(comodoId) {
    return COMODOS_META.some((comodo) => comodo.id === comodoId);
}

function getUrlState() {
    const params = new URLSearchParams(window.location.search);
    const comodo = params.get('comodo');
    const view = params.get('view');

    return {
        comodo: isValidComodo(comodo) ? comodo : null,
        view: ['roompages', 'sections', 'comodos', 'prioridade'].includes(view) ? view : null
    };
}

function syncUrlState() {
    const params = new URLSearchParams(window.location.search);
    params.set('view', currentView);

    if (currentView === 'roompages') {
        params.set('comodo', selectedRoomPage);
    } else {
        params.delete('comodo');
    }

    const nextQuery = params.toString();
    const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}`;
    window.history.replaceState({}, '', nextUrl);
}

function setActiveView(view) {
    currentView = view;

    document.querySelectorAll('.view-btn').forEach((button) => {
        button.classList.toggle('active', button.dataset.view === view);
    });

    document.querySelectorAll('.view-container').forEach((container) => {
        container.style.display = 'none';
    });

    if (view === 'roompages') {
        document.getElementById('roomPagesView').style.display = 'flex';
    } else if (view === 'sections') {
        document.getElementById('sectionsView').style.display = 'flex';
    } else if (view === 'comodos') {
        document.getElementById('comodosView').style.display = 'flex';
    } else if (view === 'prioridade') {
        document.getElementById('prioridadeView').style.display = 'flex';
    }

    if (view !== 'roompages') {
        disposeRoomThreeScenes();
    }

    syncUrlState();
}

function disposeRoomThreeScenes() {
    while (roomThreeScenes.length > 0) {
        const sceneRef = roomThreeScenes.pop();

        if (sceneRef.renderer) {
            sceneRef.renderer.dispose();
            if (sceneRef.renderer.domElement && sceneRef.renderer.domElement.parentNode) {
                sceneRef.renderer.domElement.parentNode.removeChild(sceneRef.renderer.domElement);
            }
        }

        if (sceneRef.geometry) sceneRef.geometry.dispose();
        if (sceneRef.material) sceneRef.material.dispose();
        if (sceneRef.floorGeometry) sceneRef.floorGeometry.dispose();
        if (sceneRef.floorMaterial) sceneRef.floorMaterial.dispose();
    }

    if (roomThreeAnimationId) {
        cancelAnimationFrame(roomThreeAnimationId);
        roomThreeAnimationId = null;
    }
}

function getTopicColor(topicId) {
    if (topicId === 'reforma') return 0xef4444;
    if (topicId === 'moveis') return 0xf59e0b;
    return 0x22c55e;
}

function initRoomThreeScenes() {
    disposeRoomThreeScenes();

    if (!window.THREE) {
        return;
    }

    const canvases = document.querySelectorAll('.room-3d-canvas');

    canvases.forEach((container) => {
        const topicId = container.dataset.topic || 'itens';
        const width = 160;
        const height = 110;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
        camera.position.set(0, 1.6, 3.3);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        container.innerHTML = '';
        container.appendChild(renderer.domElement);

        const ambient = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambient);

        const dir = new THREE.DirectionalLight(0xffffff, 1);
        dir.position.set(1.8, 2.2, 1.2);
        scene.add(dir);

        const floorGeometry = new THREE.BoxGeometry(3.2, 0.2, 2.2);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: getTopicColor(topicId),
            roughness: 0.45,
            metalness: 0.1
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.position.y = -0.7;
        scene.add(floor);

        const geometry = new THREE.BoxGeometry(1.1, 0.9, 0.9);
        const material = new THREE.MeshStandardMaterial({
            color: 0xf8fafc,
            roughness: 0.25,
            metalness: 0.05
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.rotation.set(0.25, 0.55, 0.05);
        scene.add(cube);

        roomThreeScenes.push({
            renderer,
            scene,
            camera,
            cube,
            geometry,
            material,
            floorGeometry,
            floorMaterial
        });
    });

    if (roomThreeScenes.length > 0) {
        const animate = () => {
            roomThreeAnimationId = requestAnimationFrame(animate);
            roomThreeScenes.forEach((ref) => {
                ref.cube.rotation.y += 0.01;
                ref.renderer.render(ref.scene, ref.camera);
            });
        };

        animate();
    }
}

function getComodoMeta(comodoId) {
    return COMODOS_META.find((comodo) => comodo.id === comodoId) || COMODOS_META[0];
}

function buildRoom3D(topicId, label) {
    return `
        <div class="room-3d-wrap">
            <div class="room-3d-canvas" data-topic="${topicId}">
                <div class="room-3d-model" data-topic="${topicId}">
                    <div class="room-3d-floor"></div>
                    <div class="room-3d-wall-left"></div>
                    <div class="room-3d-wall-right"></div>
                    <div class="room-3d-core"></div>
                </div>
            </div>
            <div class="room-3d-label">${label}</div>
        </div>
    `;
}

function renderRoomPagesNav(currentFilter = 'all') {
    const nav = document.getElementById('roomPagesNav');
    if (!nav) return;

    nav.innerHTML = '';

    COMODOS_META.forEach((comodo) => {
        const items = APP_DATA.items.filter((item) =>
            item.comodo === comodo.id &&
            filterItems(currentFilter).includes(item)
        );
        const completed = items.filter((item) => item.completed).length;

        const link = document.createElement('a');
        link.className = `room-page-btn ${selectedRoomPage === comodo.id ? 'active' : ''}`;
        link.dataset.comodo = comodo.id;
        link.href = `?view=roompages&comodo=${encodeURIComponent(comodo.id)}`;
        link.innerHTML = `
            <strong>${comodo.icon} ${comodo.nome}</strong>
            <span>${completed}/${items.length} concluídos</span>
        `;

        link.addEventListener('click', (event) => {
            event.preventDefault();
            selectedRoomPage = comodo.id;
            renderRoomPagesView(currentFilter);
            syncUrlState();
        });

        nav.appendChild(link);
    });
}

function renderRoomPagesView(currentFilter = 'all') {
    const content = document.getElementById('roomPageContent');
    if (!content) return;

    const comodo = getComodoMeta(selectedRoomPage);
    const allRoomItems = APP_DATA.items.filter((item) =>
        item.comodo === selectedRoomPage &&
        filterItems(currentFilter).includes(item)
    );
    const totalDone = allRoomItems.filter((item) => item.completed).length;

    renderRoomPagesNav(currentFilter);

    let html = `
        <section class="room-page-hero">
            <div>
                <h3>${comodo.icon} ${comodo.nome}</h3>
                <p>${comodo.descricao}</p>
            </div>
            <span class="room-page-total">${totalDone}/${allRoomItems.length} concluídos</span>
        </section>
    `;

    TOPICOS_META.forEach((topico) => {
        const topicItems = APP_DATA.items.filter((item) =>
            item.comodo === selectedRoomPage &&
            item.section === topico.id &&
            filterItems(currentFilter).includes(item)
        );

        const done = topicItems.filter((item) => item.completed).length;

        html += `
            <section class="room-topic-card">
                <div class="room-topic-header">
                    <h4>${topico.titulo}</h4>
                    <span class="room-topic-stats">${done}/${topicItems.length}</span>
                </div>
                <div class="room-topic-body">
                    ${buildRoom3D(topico.id, topico.modelLabel)}
                    <ul class="items-list room-items-list" id="room-${selectedRoomPage}-${topico.id}"></ul>
                </div>
            </section>
        `;
    });

    content.innerHTML = html;

    TOPICOS_META.forEach((topico) => {
        const ul = document.getElementById(`room-${selectedRoomPage}-${topico.id}`);
        if (!ul) return;

        const topicItems = APP_DATA.items.filter((item) =>
            item.comodo === selectedRoomPage &&
            item.section === topico.id &&
            filterItems(currentFilter).includes(item)
        );

        ul.innerHTML = '';

        if (topicItems.length === 0) {
            ul.innerHTML = '<div class="empty-state"><p>Nenhum item neste tópico para este cômodo</p></div>';
        } else {
            topicItems.forEach((item) => {
                ul.appendChild(createItemElement(item, currentFilter));
            });
        }
    });

    if (currentView === 'roompages') {
        initRoomThreeScenes();
    }
}

// Filter items
function filterItems(filterType) {
    let filtered = APP_DATA.items;

    if (filterType === 'comprado') {
        filtered = filtered.filter(i => i.completed);
    } else if (filterType === 'pendente') {
        filtered = filtered.filter(i => !i.completed);
    } else if (filterType !== 'all') {
        filtered = filtered.filter(i => i.priority === filterType);
    }

    if (!currentSearchTerm) {
        return filtered;
    }

    const term = currentSearchTerm.toLowerCase();
    return filtered.filter((item) => {
        const haystack = [item.name, item.notes, item.comodo, item.section, item.priority, item.responsavel]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        return haystack.includes(term);
    });
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
function renderAll(filterType = currentFilter) {
    currentFilter = filterType;
    renderRoomPagesView(filterType);
    renderSectionsView(filterType);
    renderComodosView(filterType);
    renderPriorityView(filterType);
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
        currentFilter = filter;
        renderAll(filter);
    });
});

const searchInput = document.getElementById('itemSearchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');

if (searchInput) {
    searchInput.addEventListener('input', () => {
        currentSearchTerm = searchInput.value.trim();
        renderAll(currentFilter);
    });
}

if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
        currentSearchTerm = '';
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
        }
        renderAll(currentFilter);
    });
}

const addItemPanel = document.getElementById('addItemPanel');
const openAddItemBtn = document.getElementById('openAddItemBtn');
const closeAddItemBtn = document.getElementById('closeAddItemBtn');

function openAddPanel() {
    if (addItemPanel) addItemPanel.classList.add('open');
}

function closeAddPanel() {
    if (addItemPanel) addItemPanel.classList.remove('open');
}

if (openAddItemBtn) {
    openAddItemBtn.addEventListener('click', openAddPanel);
}

if (closeAddItemBtn) {
    closeAddItemBtn.addEventListener('click', closeAddPanel);
}

document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        setActiveView(view);
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

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function buildPromoError(response) {
    let payload = null;
    let rawText = '';

    try {
        payload = await response.json();
    } catch (jsonError) {
        try {
            rawText = await response.text();
        } catch (textError) {
            rawText = '';
        }
    }

    const error = new Error(`HTTP error! status: ${response.status}`);
    error.status = response.status;
    error.payload = payload;
    error.rawText = rawText;
    return error;
}

function getPromoErrorDetails(error) {
    if (error.status === 401 && error.payload && error.payload.error && error.payload.error.message === 'Protected deployment') {
        return {
            title: '🔒 API de promoções bloqueada no Vercel',
            message: 'O deploy atual está protegido e a rota /api/buscar-promocoes está retornando 401 antes de executar a busca.',
            action: 'Libere a Deployment Protection desse projeto no Vercel ou teste localmente com o comando abaixo.'
        };
    }

    if (error.status) {
        const backendMessage = error.payload && (error.payload.message || error.payload.error);

        return {
            title: `⚠️ Erro ao buscar promoções (${error.status})`,
            message: backendMessage || 'A API respondeu com erro e não conseguiu processar a busca.',
            action: 'Rode o teste local automatizado para validar se o backend está respondendo corretamente fora do deploy.'
        };
    }

    if (error instanceof TypeError) {
        return {
            title: '⚠️ Não foi possível conectar à API de promoções',
            message: window.location.protocol === 'file:'
                ? 'Ao abrir o index.html direto no navegador, a busca depende do backend local em http://localhost:3001.'
                : 'A página não conseguiu alcançar a API na mesma origem do site.',
            action: 'Execute o teste local automatizado para subir o backend, validar o endpoint e encerrá-lo sozinho.'
        };
    }

    return {
        title: '⚠️ Erro ao buscar promoções',
        message: error.message || 'Falha inesperada ao consultar as promoções.',
        action: 'Execute o teste local automatizado para validar o backend e isolar se o problema é do deploy ou da API.'
    };
}

function renderPromoError(error) {
    const details = getPromoErrorDetails(error);

    document.getElementById('loadingPromo').style.display = 'none';
    document.getElementById('promocoesContent').innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
            <p>${escapeHtml(details.title)}</p>
            <p style="font-size: 0.95rem; line-height: 1.5;">${escapeHtml(details.message)}</p>
            <p style="font-size: 0.9rem; margin-top: 1rem;">${escapeHtml(details.action)}</p>
            <p style="font-size: 0.85rem; margin-top: 1rem; color: var(--text-muted);">Comando: npm run test:promo-local</p>
        </div>
    `;
}

function getPromoSourceIcon(sourceName) {
    if (sourceName === 'Zoom') return '🔎';
    if (sourceName === 'KaBuM') return '🧰';
    return '🏪';
}

function getPromoSourceStatus(source) {
    if (source.status === 'success' && source.results && source.results.length > 0) {
        return {
            label: `${source.results.length} resultado(s) encontrados`,
            cssClass: 'promo-status-success'
        };
    }

    if (source.error && /timeout/i.test(source.error)) {
        return {
            label: 'Tempo limite excedido ao consultar esta loja',
            cssClass: 'promo-status-warning'
        };
    }

    if (source.error) {
        return {
            label: source.error,
            cssClass: 'promo-status-error'
        };
    }

    return {
        label: 'Nenhum resultado para as consultas tentadas',
        cssClass: 'promo-status-empty'
    };
}

function renderPromoAttempts(source) {
    if (!Array.isArray(source.attempts) || source.attempts.length === 0) {
        return '';
    }

    const attemptsHtml = source.attempts.map((attempt) => {
        const suffix = attempt.total > 0
            ? `: ${attempt.total} resultado(s)`
            : attempt.error
                ? `: ${escapeHtml(attempt.error)}`
                : ': sem resultados';

        return `<li>${escapeHtml(attempt.query)}${suffix}</li>`;
    }).join('');

    return `
        <div class="promo-attempts">
            <p class="promo-attempts-title">Consultas testadas</p>
            <ul class="promo-attempts-list">${attemptsHtml}</ul>
        </div>
    `;
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
            throw await buildPromoError(response);
        }
        
        const data = await response.json();
        exibirResultadosPromocoes(data);
    } catch (error) {
        console.error('Erro ao buscar promoções:', error);
        renderPromoError(error);
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

    const hasResults = data.sources.some((source) => Array.isArray(source.results) && source.results.length > 0);

    if (!hasResults) {
        let emptyHtml = `
            <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                <p>😔 Nenhuma promoção encontrada para "${escapeHtml(data.query)}"</p>
                <p style="font-size: 0.9rem;">Abaixo está o status de cada loja e das consultas tentadas.</p>
            </div>
        `;

        data.sources.forEach((source) => {
            const status = getPromoSourceStatus(source);
            emptyHtml += `
                <div class="promocoes-source promocoes-source-empty">
                    <h3>${getPromoSourceIcon(source.source)} ${escapeHtml(source.source)}${source.searchUsed ? ` <span class="promo-search-used">(${escapeHtml(source.searchUsed)})</span>` : ''}</h3>
                    <div class="promo-empty-state">
                        <p class="${status.cssClass}">${escapeHtml(status.label)}</p>
                        ${renderPromoAttempts(source)}
                    </div>
                </div>
            `;
        });

        content.innerHTML = emptyHtml;
        return;
    }
    
    let html = '';
    
    data.sources.forEach(source => {
        if (!source.results || source.results.length === 0) {
            const status = getPromoSourceStatus(source);
            html += `
                <div class="promocoes-source promocoes-source-empty">
                    <h3>${getPromoSourceIcon(source.source)} ${escapeHtml(source.source)}${source.searchUsed ? ` <span class="promo-search-used">(${escapeHtml(source.searchUsed)})</span>` : ''}</h3>
                    <div class="promo-empty-state">
                        <p class="${status.cssClass}">${escapeHtml(status.label)}</p>
                        ${renderPromoAttempts(source)}
                    </div>
                </div>
            `;
            return;
        }
        
        html += `
            <div class="promocoes-source">
                <h3>${getPromoSourceIcon(source.source)} ${escapeHtml(source.source)}${source.searchUsed ? ` <span class="promo-search-used">(${escapeHtml(source.searchUsed)})</span>` : ''}</h3>
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
    const state = getUrlState();
    if (state.comodo) {
        selectedRoomPage = state.comodo;
    }

    setActiveView(state.view || 'roompages');
    loadDataFromLocalStorage();

    console.log('App inicializada, aguardando conexão com Firestore...');
    // Firestore will initialize automatically when ready
});

window.addEventListener('popstate', () => {
    const state = getUrlState();

    if (state.comodo) {
        selectedRoomPage = state.comodo;
    }

    setActiveView(state.view || 'roompages');
    renderAll(currentFilter);
});
