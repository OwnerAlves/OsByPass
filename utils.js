/**
 * Resets the animation on an element and makes it visible.
 * Useful for re-triggering CSS animations.
 * @param {HTMLElement} element The element to reset and show.
 */
export function resetAndShow(element) {
    element.classList.add('hidden');
    element.style.animation = 'none';
    element.offsetHeight; // Trigger reflow to restart animation
    element.style.animation = '';
    element.classList.remove('hidden');
}

/**
 * Handles the clipboard copy functionality for a button and input field.
 * @param {HTMLButtonElement} button The button that was clicked.
 * @param {HTMLInputElement} input The input field with the text to copy.
 */
export function handleCopy(button, input) {
    const textSpan = button.querySelector('.copy-button-text');
    const iconCopy = button.querySelector('.icon-copy');
    const iconCopied = button.querySelector('.icon-copied');

    navigator.clipboard.writeText(input.value).then(() => {
        textSpan.textContent = 'Copiado!';
        iconCopy.classList.add('hidden');
        iconCopied.classList.remove('hidden');
        setTimeout(() => {
            textSpan.textContent = 'Copiar';
            iconCopy.classList.remove('hidden');
            iconCopied.classList.add('hidden');
        }, 2000);
    }).catch(err => {
        console.error('Falha ao copiar: ', err);
        textSpan.textContent = 'Falhou!';
        setTimeout(() => {
            textSpan.textContent = 'Copiar';
        }, 2000);
    });
}