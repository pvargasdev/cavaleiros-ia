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
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:5173';
  
  win.loadURL(startUrl);
}

app.whenReady().then(() => {
  ipcMain.handle('calcular-jogo', async (event, csvString, configPersonalizada) => {
    try {
      const resultado = processarDadosDoJogo(csvString, configPersonalizada);
      return resultado;
    } catch (erro) {
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