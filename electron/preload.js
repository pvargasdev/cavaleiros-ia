const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  calcularJogo: (csvString, config) => ipcRenderer.invoke('calcular-jogo', csvString, config)
});