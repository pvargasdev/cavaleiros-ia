const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { processarDadosDoJogo } = require('../src/logica/controlador');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    win.loadURL('http://localhost:5173');
  }
}

app.whenReady().then(createWindow);

ipcMain.handle('calcular-jogo', async (event, csv, config) => {
  return processarDadosDoJogo(csv, config);
});