import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { DisableMinimize } from 'electron-disable-minimize';
import main from './requests';

const isDev = false;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = (): BrowserWindow => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    x: 810,
    y: 0,
    width: 300,
    height: 125,
    /* height: 800,
    width: 600, */
    transparent: !isDev,
    frame: isDev,
    resizable: isDev,
    /* type: `desktop`, */
    skipTaskbar: !isDev,
    minimizable: true,
    focusable: isDev,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  mainWindow.setIgnoreMouseEvents(!isDev);
  const handle = mainWindow.getNativeWindowHandle();
  // disable minimize perfectly!
  const isSuccess = DisableMinimize(handle);

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '../src/index.html'));

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  return mainWindow;

  
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  let win = createWindow();
  const data = await main();

  win.webContents.on('did-finish-load', () => {
    win.webContents.send("message", data);
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
