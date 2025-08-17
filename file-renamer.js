import { logHistory } from './history.js';

export function initFileRenamer() {
    const rFileInput = document.getElementById('rename-file-input');
    const rDropZone = document.getElementById('rename-drop-zone');
    const rPrompt = document.getElementById('rename-upload-prompt');
    const rPreview = document.getElementById('rename-preview-container');
    const rOrigName = document.getElementById('rename-original-name');
    const rBase = document.getElementById('rename-base');
    const rExt = document.getElementById('rename-ext');
    const rExtCustom = document.getElementById('rename-ext-custom');
    const rNewName = document.getElementById('rename-newname');
    const rUploadBtn = document.getElementById('rename-upload-button');
    const rStatus = document.getElementById('rename-status-area');
    
    let rCurrentFile = null;

    const showStatusRename = (message, type = '') => {
        rStatus.textContent = message;
        rStatus.className = `status ${type}`;
    };

    const validateCustomExtension = () => {
        if (rExt.value !== 'custom') {
            rUploadBtn.disabled = false;
            showStatusRename('');
            return true;
        }
        const customExt = rExtCustom.value.trim();
        if (!customExt) {
            showStatusRename('A extensão personalizada não pode estar vazia.', 'error');
            rUploadBtn.disabled = true;
            return false;
        }
        if (!customExt.startsWith('.')) {
            showStatusRename('A extensão deve começar com um ponto (ex: .zip).', 'error');
            rUploadBtn.disabled = true;
            return false;
        }
        if (customExt.length < 2) {
            showStatusRename('A extensão deve ter pelo menos um caractere após o ponto.', 'error');
            rUploadBtn.disabled = true;
            return false;
        }
        const invalidChars = /[\\/:*?"<>|]/;
        if (invalidChars.test(customExt.substring(1))) {
            showStatusRename('A extensão contém caracteres inválidos.', 'error');
            rUploadBtn.disabled = true;
            return false;
        }

        rUploadBtn.disabled = false;
        showStatusRename('');
        return true;
    };
    
    const updateNewName = () => {
      let ext = '';
      if (rExt.value === 'custom') {
          validateCustomExtension();
          ext = rExtCustom.value.trim();
      } else {
          ext = rExt.value;
      }
      const base = rBase.value.trim() || 'arquivo';
      rNewName.textContent = 'Novo nome: ' + base + (ext || '');
    };

    const initRename = (file) => {
      if(!file) return;
      rCurrentFile = file;
      rOrigName.textContent = `Arquivo: ${file.name} (${Math.ceil(file.size/1024)} KB)`;
      const base = file.name.includes('.') ? file.name.substring(0, file.name.lastIndexOf('.')) : file.name;
      const ext = file.name.includes('.') ? file.name.substring(file.name.lastIndexOf('.')) : '';
      
      rBase.value = base;
      const hasOption = [...rExt.options].some(opt => opt.value === ext);
      rExt.value = hasOption ? ext : 'custom';
      rExtCustom.value = hasOption ? '' : ext;
      rExtCustom.classList.toggle('hidden', rExt.value !== 'custom');

      updateNewName();
      rPrompt.classList.add('hidden');
      rPreview.classList.remove('hidden');
      validateCustomExtension(); // Validate on file load
      showStatusRename('');
    };
    
    rUploadBtn.addEventListener('click', () => {
        if(!rCurrentFile) return;

        if (rExt.value === 'custom' && !validateCustomExtension()) {
            return; // Stop if custom extension is invalid
        }
        
        let ext = rExt.value === 'custom' ? rExtCustom.value.trim() : rExt.value;
        const base = (rBase.value || '').trim();

        if(!base) { showStatusRename('Informe um nome válido.', 'error'); return; }
        if(!ext) { showStatusRename('Informe uma extensão.', 'error'); return; }
        
        showStatusRename('Preparando download...', 'loading');
        try {
            const newName = base + ext;
            const url = URL.createObjectURL(rCurrentFile);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = newName;
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
            a.remove();
            showStatusRename('Download iniciado!', 'success');
            logHistory({
                type: 'rename',
                title: 'Arquivo Renomeado',
                data: `De: ${rCurrentFile.name}`,
                details: `Para: ${newName}`
            });
            setTimeout(() => showStatusRename(''), 2000);
        } catch (err) {
            console.error('Download error:', err);
            showStatusRename('Falha ao iniciar o download.', 'error');
        }
    });
    
    rDropZone.addEventListener('click', (e) => {
        if (!e.target.closest('input, select, button')) {
            rFileInput.click();
        }
    });
    rFileInput.addEventListener('change', e => initRename(e.target.files[0]));
    ['dragover', 'dragleave', 'drop'].forEach(evName => {
        rDropZone.addEventListener(evName, e => {
            e.preventDefault();
            e.stopPropagation();
            if (evName === 'dragover') rDropZone.classList.add('dragover');
            else rDropZone.classList.remove('dragover');
            if (evName === 'drop') initRename(e.dataTransfer.files[0]);
        });
    });

    [rBase, rExtCustom].forEach(el => el.addEventListener('input', updateNewName));
    rExt.addEventListener('change', () => {
        rExtCustom.classList.toggle('hidden', rExt.value !== 'custom');
        updateNewName();
        validateCustomExtension();
    });
}