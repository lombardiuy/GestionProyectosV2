import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';
import { existsSync } from 'fs';
import http from 'http';

let splash: BrowserWindow | null = null;
let mainWin: BrowserWindow | null = null;
let subprocess: ChildProcess | null = null; // <--- guarda el proceso backend

const serve = process.argv.includes('--serve');

function startBackend(): Promise<void> {
  return new Promise((resolve) => {
    console.log('🔵 Iniciando backend...');
    const backendPath = path.join(__dirname, 'backend', 'index.js');
    subprocess = spawn('node', [backendPath], { stdio: 'inherit', windowsHide: true });

    const check = () => {
      http.get('http://localhost:3000/app/status', res => {
        console.log(`🔍 Backend status code: ${res.statusCode}`);
        if (res.statusCode === 200) {
          console.log('✅ Backend listo');
          resolve();
        } else {
          setTimeout(check, 500);
        }
      }).on('error', () => {
        setTimeout(check, 500);
      });
    };

    setTimeout(check, 500); // esperamos que levante
  });
}

function waitForFrontend(): Promise<void> {
  return new Promise((resolve) => {
    const indexPath = path.join(__dirname, 'frontend', 'index.html');
    console.log(`🔵 Esperando archivo frontend en: ${indexPath}`);

    const check = () => {
      if (existsSync(indexPath)) {
        console.log('✅ Archivo frontend encontrado');
        resolve();
      } else {
        setTimeout(check, 300);
      }
    };

    check();
  });
}

function createSplash(): void {
  console.log('🔵 Creando ventana splash');
  splash = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    show: false,
  });

  splash.loadFile(path.join(__dirname, 'splash.html'));
  splash.once('ready-to-show', () => {
    console.log('✅ Splash listo para mostrar');
    splash?.show();
  });
}

function createMainWindow(): void {
  console.log('🔵 Creando ventana principal');
  mainWin = new BrowserWindow({
    width: 1000,
    height: 700,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (serve) {
    console.log('🔵 Cargando URL de desarrollo');
    mainWin.loadURL('http://localhost:4200');
    mainWin.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, 'frontend', 'index.html');
    console.log(`🔵 Cargando archivo frontend: ${indexPath}`);
    mainWin.loadFile(indexPath);
  }

  mainWin.once('ready-to-show', () => {
    console.log('✅ Ventana principal lista para mostrar');
    if (splash) {
      console.log('🔵 Cerrando ventana splash');
      splash.close();
      splash = null;
    }
    mainWin?.show();
  });

  // Aquí agregamos un listener para cuando la ventana principal se cierra:
  mainWin.on('closed', () => {
    console.log('🔵 Ventana principal cerrada');
    mainWin = null;

    // Si hay proceso backend, matarlo:
    if (subprocess) {
      console.log('🔵 Cerrando backend...');
      subprocess.kill();
      subprocess = null;
    }

    // Salir de la app
    app.quit();
  });
}

app.whenReady().then(async () => {
  console.log('🔵 App lista, creando splash y esperando backend/frontend');
  createSplash();

  if (!serve) {
    await Promise.all([
      startBackend(),
      waitForFrontend(),
    ]);
  }

  createMainWindow();
});

app.on('window-all-closed', () => {
  console.log('🔵 Todas las ventanas cerradas');
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  console.log('🔵 Activando app');
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});
