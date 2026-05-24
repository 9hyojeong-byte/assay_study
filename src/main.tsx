import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Dynamic PNG pre-rendering and caching for PWA installability
async function preCachePngIcons() {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  
  try {
    const BASE_URL = (import.meta as any).env?.BASE_URL || '/';
    const trimBase = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

    const iconSvgPath = `${trimBase}/icon.svg`;
    const icon192Path = `${trimBase}/icon-192.png`;
    const icon512Path = `${trimBase}/icon-512.png`;

    const cache = await caches.open('linguist-app-v2');
    const has192 = await cache.match(icon192Path);
    const has512 = await cache.match(icon512Path);
    
    // If both PNGs are cached already, skip regeneration
    if (has192 && has512) {
      return;
    }
    
    // Fetch the high-quality SVG source we created
    const response = await fetch(iconSvgPath);
    if (!response.ok) return;
    const svgText = await response.text();
    
    // Convert to safe base64 Data URL
    const svgBase64 = btoa(unescape(encodeURIComponent(svgText)));
    const img = new Image();
    
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load SVG icon image'));
      img.src = `data:image/svg+xml;base64,${svgBase64}`;
    });
    
    const sizes = [192, 512];
    for (const size of sizes) {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
        if (blob) {
          const path = size === 192 ? icon192Path : icon512Path;
          await cache.put(path, new Response(blob, {
            headers: { 'Content-Type': 'image/png' }
          }));
          console.log(`Pre-cached dynamically rendered PNG: ${path}`);
        }
      }
    }
  } catch (error) {
    console.warn('Failed to pre-cache PWA PNG icons:', error);
  }
}

// Trigger pre-caching and register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    preCachePngIcons().finally(() => {
      const BASE_URL = (import.meta as any).env?.BASE_URL || '/';
      const trimBase = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
      const swPath = `${trimBase}/sw.js`;

      navigator.serviceWorker.register(swPath)
        .then((reg) => console.log('PWA Service Worker registered:', reg.scope))
        .catch((err) => console.error('PWA Service Worker registration failed:', err));
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
