import { resetAndShow, handleCopy } from './utils.js';
import { logHistory } from './history.js';

export function initFileUploader() {
    const anyFileInput = document.getElementById('any-file-input');
    const anyDropZone = document.getElementById('any-drop-zone');
    const anyUploadPrompt = document.getElementById('any-upload-prompt');
    const anyPreviewContainer = document.getElementById('any-preview-container');
    const anyFileNameDisplay = document.getElementById('any-file-name');
    const anyStatusArea = document.getElementById('any-status-area');
    const anyResultArea = document.getElementById('any-result-area');
    const anyResultLinkInput = document.getElementById('any-result-link');
    const anyCopyButton = document.getElementById('any-copy-button');

    const showStatusAny = (message, type = '') => {
        anyStatusArea.textContent = message;
        anyStatusArea.className = `status ${type}`;
    };

    const handleAnyFile = (file) => {
        if (!file) return;
        anyFileNameDisplay.textContent = `${file.name} (${Math.ceil(file.size / 1024)} KB)`;
        anyUploadPrompt.classList.add('hidden');
        anyPreviewContainer.classList.remove('hidden');
        anyResultArea.classList.add('hidden');
        uploadAnyFile(file);
    };
    
    const uploadAnyFile = async (file) => {
        showStatusAny('Enviando arquivo...', 'loading');
        try {
            const srvRes = await fetch('https://api.gofile.io/servers');
            const srvJson = await srvRes.json();
            if (srvJson.status !== 'ok' || !srvJson.data?.servers?.length) {
                throw new Error('Falha ao obter servidor de upload.');
            }
            const server = srvJson.data.servers[0].name;

            const fd = new FormData();
            fd.append('file', file);

            const upRes = await fetch(`https://${server}.gofile.io/uploadFile`, { method: 'POST', body: fd });
            const upJson = await upRes.json();
            if (upJson.status !== 'ok' || !upJson.data) {
                throw new Error(upJson?.data?.error || 'Falha no upload do arquivo.');
            }

            showStatusAny('');
            const link = upJson.data.downloadPage || (upJson.data.code ? `https://gofile.io/d/${upJson.data.code}` : '');
            if (!link) throw new Error('Resposta inesperada da API.');
            anyResultLinkInput.value = link;
            resetAndShow(anyResultArea);
            logHistory({
                type: 'file',
                title: 'Link de Arquivo Gerado',
                data: link,
                details: `Arquivo: ${file.name}`
            });
        } catch (err) {
            console.error(err);
            showStatusAny(`Erro: ${err.message}`, 'error');
        }
    };

    anyDropZone.addEventListener('click', () => anyFileInput.click());
    anyFileInput.addEventListener('change', e => handleAnyFile(e.target.files[0]));
    ['dragover', 'dragleave', 'drop'].forEach(evName => {
        anyDropZone.addEventListener(evName, e => {
            e.preventDefault();
            e.stopPropagation();
            if (evName === 'dragover') anyDropZone.classList.add('dragover');
            else anyDropZone.classList.remove('dragover');
            if (evName === 'drop') handleAnyFile(e.dataTransfer.files[0]);
        });
    });
    anyCopyButton.addEventListener('click', () => handleCopy(anyCopyButton, anyResultLinkInput));
}