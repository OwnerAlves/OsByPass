import { resetAndShow, handleCopy } from './utils.js';
import { logHistory } from './history.js';

const IMGUR_CLIENT_ID = '546c25a59c58ad7'; // Public, safe to use client-side

export function initImageUploader() {
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');
    const uploadPrompt = document.getElementById('upload-prompt');
    const previewContainer = document.getElementById('preview-container');
    const imagePreview = document.getElementById('image-preview');
    const fileNameDisplay = document.getElementById('file-name');
    const statusArea = document.getElementById('status-area');
    const resultArea = document.getElementById('result-area');
    const resultLinkInput = document.getElementById('result-link');
    const copyButton = document.getElementById('copy-button');

    const showStatus = (message, type = '') => {
        statusArea.textContent = message;
        statusArea.className = `status ${type}`;
    };

    const handleFile = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            showStatus('Tipo de arquivo inválido. Por favor, selecione uma imagem.', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = e => {
            imagePreview.src = e.target.result;
            fileNameDisplay.textContent = file.name;
            uploadPrompt.classList.add('hidden');
            previewContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
        resultArea.classList.add('hidden');
        uploadImage(file);
    };

    const uploadImage = async (file) => {
        showStatus('Enviando imagem...', 'loading');
        const formData = new FormData();
        formData.append('image', file);
        try {
            const response = await fetch('https://api.imgur.com/3/image', {
                method: 'POST',
                headers: { Authorization: `Client-ID ${IMGUR_CLIENT_ID}` },
                body: formData,
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Falha no upload: ${errorData.data.error}`);
            }
            const result = await response.json();
            if (result.success) {
                showStatus('');
                resultLinkInput.value = result.data.link;
                resetAndShow(resultArea);
                logHistory({
                    type: 'image',
                    title: 'Link de Imagem Gerado',
                    data: result.data.link,
                    details: `Arquivo: ${file.name}`
                });
            } else {
                throw new Error('A API do Imgur retornou um erro.');
            }
        } catch (error) {
            console.error('Erro ao enviar imagem:', error);
            showStatus(`Erro: ${error.message}`, 'error');
        }
    };

    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', e => handleFile(e.target.files[0]));
    ['dragover', 'dragleave', 'drop'].forEach(evName => {
        dropZone.addEventListener(evName, e => {
            e.preventDefault();
            e.stopPropagation();
            if (evName === 'dragover') dropZone.classList.add('dragover');
            else dropZone.classList.remove('dragover');
            if (evName === 'drop') handleFile(e.dataTransfer.files[0]);
        });
    });
    copyButton.addEventListener('click', () => handleCopy(copyButton, resultLinkInput));
}