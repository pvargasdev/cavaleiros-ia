/**
 * electron/main.js
 */
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { processarDadosDoJogo } = require('../src/logica/controlador'); 

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      // Importante: Preload conecta o Node.js ao Navegador de forma segura
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Em desenvolvimento, carrega a URL do Vite. Em produção, o index.html.
  // Ajuste a porta se o seu Vite rodar em outra (ex: 3000 ou 5173)
  const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:5173';
  
  // Se for build de produção (arquivo local), usa loadFile
  // win.loadFile(path.join(__dirname, '../dist/index.html'));
  win.loadURL(startUrl);
}

app.whenReady().then(() => {
  // CONFIGURAÇÃO DO IPC
  // O React chama 'calcular-jogo', nós respondemos aqui.
  ipcMain.handle('calcular-jogo', async (event, csvString) => {
    try {
      console.log("--- NOVO PEDIDO ---");
      console.log("Tamanho do CSV recebido:", csvString ? csvString.length : "NULO");
      
      const resultado = processarDadosDoJogo(csvString);
      
      console.log("Cálculo efetuado. Sucesso:", resultado.sucesso);
      return resultado;
    } catch (erro) {
      console.error("ERRO FATAL NO MAIN:", erro); // Isso vai aparecer no seu terminal
      throw erro;
    }
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});