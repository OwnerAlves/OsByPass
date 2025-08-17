const HISTORY_KEY = 'multiConvertHistory';
const historyList = document.getElementById('history-list');
const clearHistoryButton = document.getElementById('clear-history-button');

const icons = {
    image: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-image" viewBox="0 0 16 16"><path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/><path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/></svg>`,
    file: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-zip" viewBox="0 0 16 16"><path d="M5 7.5a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v.938l.4 1.599a1 1 0 0 1-.416 1.074l-.93.62a1 1 0 0 1-1.109 0l-.93-.62a1 1 0 0 1-.415-1.074l.4-1.599V7.5zm1 0v.938a.5.5 0 0 0-.029.118l-.386 1.546a.5.5 0 0 0 .208.537l.93.62a.5.5 0 0 0 .554 0l.93-.62a.5.5 0 0 0 .208-.537l-.385-1.546A.5.5 0 0 0 8 8.438V7.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5z"/><path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/></svg>`,
    rename: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16"><path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/><path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/></svg>`
};

function getHistory() {
    try {
        const history = localStorage.getItem(HISTORY_KEY);
        return history ? JSON.parse(history) : [];
    } catch (e) {
        console.error('Failed to parse history from localStorage', e);
        return [];
    }
}

function saveHistory(history) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function renderHistory() {
    const history = getHistory();
    historyList.innerHTML = '';
    
    if (history.length === 0) {
        historyList.innerHTML = '<li class="history-item-empty">Seu histórico está vazio.</li>';
        return;
    }

    history.forEach(item => {
        const li = document.createElement('li');
        li.className = 'history-item';

        const dataContent = (item.type === 'image' || item.type === 'file') 
            ? `<a href="${item.data}" target="_blank" rel="noopener noreferrer">${item.data}</a>`
            : item.data;

        li.innerHTML = `
            <div class="history-item-icon ${item.type}">
                ${icons[item.type] || ''}
            </div>
            <div class="history-item-content">
                <div class="history-item-title">${item.title}</div>
                <div class="history-item-data">${dataContent}</div>
                <div class="history-item-details">
                    <span>${item.details} &bull; ${new Date(item.timestamp).toLocaleString()}</span>
                </div>
            </div>
        `;
        historyList.appendChild(li);
    });
}

export function logHistory(item) {
    const history = getHistory();
    const newEntry = {
        ...item,
        timestamp: new Date().toISOString()
    };
    // Add to the beginning of the array
    history.unshift(newEntry);
    // Optional: Limit history size
    if (history.length > 50) {
        history.pop();
    }
    saveHistory(history);
    renderHistory();
}

export function initHistory() {
    clearHistoryButton.addEventListener('click', () => {
        if (confirm('Tem certeza de que deseja limpar todo o histórico? Esta ação não pode ser desfeita.')) {
            localStorage.removeItem(HISTORY_KEY);
            renderHistory();
        }
    });

    // Initial render
    renderHistory();
}