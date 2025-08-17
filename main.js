import { initImageUploader } from './image-uploader.js';
import { initFileUploader } from './file-uploader.js';
import { initFileRenamer } from './file-renamer.js';
import { initHistory } from './history.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- WELCOME SCREEN ---
    const startButton = document.getElementById('start-button');
    const welcomeScreen = document.getElementById('welcome-screen');
    const verificationScreen = document.getElementById('verification-screen');
    const mainContainer = document.getElementById('main-container');

    startButton.addEventListener('click', () => {
        welcomeScreen.classList.add('fade-out');
        
        welcomeScreen.addEventListener('transitionend', () => {
            welcomeScreen.classList.add('hidden');
            // Show verification screen
            verificationScreen.classList.remove('hidden');
            verificationScreen.classList.add('visible');

            // Simulate verification
            setTimeout(() => {
                verificationScreen.classList.remove('visible'); // Fade out
                verificationScreen.addEventListener('transitionend', () => {
                    verificationScreen.classList.add('hidden');
                    // Show main container
                    mainContainer.classList.remove('hidden');
                    mainContainer.classList.add('visible');
                }, { once: true });
            }, 1500); // 1.5 second verification animation
            
        }, { once: true });
    });

    // --- TAB MANAGEMENT ---
    const tabs = document.querySelectorAll('.tab-button');
    const panels = document.querySelectorAll('.tab-panel');
    const headerSubtitle = document.getElementById('header-subtitle');
    tabs.forEach(btn => btn.addEventListener('click', () => {
        tabs.forEach(b => b.classList.remove('active'));
        panels.forEach(p => p.classList.add('hidden'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.remove('hidden');
        if (headerSubtitle && btn.dataset.subtitle) {
            headerSubtitle.textContent = btn.dataset.subtitle;
        }
    }));

    // --- INITIALIZE MODULES ---
    initImageUploader();
    initFileUploader();
    initFileRenamer();
    initHistory();
});