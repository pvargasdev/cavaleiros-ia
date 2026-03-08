/**
 * electron/preload.js
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Expõe a função calcularJogo para o objeto window do navegador
  calcularJogo: (csvString) => ipcRenderer.invoke('calcular-jogo', csvString)
});