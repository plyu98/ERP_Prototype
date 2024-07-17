const { 
  app, 
  BrowserWindow, 
  ipcMain, 
  protocol,
  shell,
  dialog,
  clipboard
} = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');
const XLSX = require('xlsx');
const nodemailer = require('nodemailer');
const ExcelJS = require('exceljs');

const bgColor = '#E5E8EB'; // blueprintjs's light-gray3

// window height and width
const winWidth = 1425;
const winHeight = 925;

// handle copying values into clipboard
async function handleReadClipboard() {
  return clipboard.readText();
}

// handle reading excel file at the given path
async function handleReadExcel(e, args) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(args);
  const worksheet = workbook.getWorksheet('Sheet1');

  // Iterate over all rows with non-null cell values
  const rows = []
  worksheet.eachRow(function(row, rowNumber) {
    if (rowNumber > 1) {
      const curRow = []
      row.eachCell(function(cell, colNumber) {
        curRow.push(cell.value)
      })
      rows.push(curRow)
    }
  });
  return rows;

}

// handle launching file open dialog
async function handleFileOpenDialog() {
  // console.log('handlefileopen triggered!');
  const {canceled, filePaths} = await dialog.showOpenDialog({properties:['openFile']});
  
  if (!canceled) {
    return filePaths[0];
  } else {
    return ""
  }
};

// handle saving the given array to excel file
async function handleSaveCsv(e, args) {
  const {canceled, filePath} = await dialog.showSaveDialog({
    title: 'Save file as',
    defaultPath: args.filename,
    filters: [{
      name: "Spreadsheets",
      extensions: ["xlsx", "xls", "xlsb"]
    }]
  });

  if (!canceled) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet');
    worksheet.addRows(args.array);
    await workbook.xlsx.writeFile(filePath);
    return true;

  } else {
    return false;
  }
}

// create crfq excel file
async function handleCreateCrfq(e, args) {
  const {canceled, filePath} = await dialog.showSaveDialog({
    title: 'Save file as',
    defaultPath: args.filename,
    filters: [{
      name: "Spreadsheets",
      extensions: ["xlsx", "xls", "xlsb"]
    }]
  });
  if (!canceled) {
    const imagePath = path.join(__dirname, "../src/letterhead_cropped.jpg");
    const workbook = new ExcelJS.Workbook();
    const letterhead = workbook.addImage({
      filename: imagePath,
      extension: 'jpeg'
    });
    const worksheet = workbook.addWorksheet('Sheet1');
    worksheet.addImage(letterhead, 'A1:H5')
    worksheet.addRows(args.array);
    await workbook.xlsx.writeFile(filePath);
    
    return true;
  } else {
    return false;
  }
}

// open default mail client
async function handleSendVrfq(e, args) {
  const {canceled, filePath} = await dialog.showSaveDialog({
    title: 'Save file as',
    filters: [{
      name: "Spreadsheets",
      extensions: ["xlsx", "xls", "xlsb"]
    }]
  });
  if (!canceled) {
    const imagePath = path.join(__dirname, "../src/letterhead_cropped.jpg");
    const workbook = new ExcelJS.Workbook();
    const letterhead = workbook.addImage({
      filename: imagePath,
      extension: 'jpeg'
    });
    const worksheet = workbook.addWorksheet('Sheet1');
    worksheet.addImage(letterhead, 'A1:H5')
    worksheet.addRows(args.array);
    await workbook.xlsx.writeFile(filePath);
    
    return true;
  } else {
    return false;
  }
}

// open a file at the given filepath
function handleOpenFile(e, filepath) {
  shell.openPath(filepath)
}

// open a new tab in the default browser given the url
function handleNewTab(e, url) {
  shell.openExternal(url)
}

// parameter e is event but not used
function createNewWindow(e, args) {
  const [url, title] = args;
  // e.preventDefault(); // testing
  const win = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: title,
    backgroundColor: bgColor,
    autoHideMenuBar: true
  })
  win.loadURL(url);
}


function handleSetTitle(event, title) {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  win.setTitle(title);
}

function reloadWindow(event) {

  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  win.reload();
}

function createWindow () {

  // Create the browser window.
  const win = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'New TM Prototype',
    backgroundColor: bgColor,
    autoHideMenuBar: true
  })

  if (isDev) {

    win.loadURL('http://127.0.0.1:3000');
    // win.webContents.openDevTools();
  } else {
    // protocol.registerFileProtocal('custom', (request, callback) => {
    //   const url = request.url.replace('custom://', '');
    //   const filePath = path.join(__dirname, url);
    //   callback({path: filePath});
    // })
    // win.loadURL('custom://index.html');
    const url = `file://${path.join(__dirname, '../build/index.html')}`;
    win.loadURL(url);
    // win.loadURL(url.format({
    //   pathname: path.join(__dirname, "./index.html"),
    //   protocol: "file:",
    //   slashes: true
    // }));
  }

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // ipcMain.on('open-part-window', openPartWindow);
  // ipcMain.handle('reload', reloadWindow);
  // ipcMain.handle('set-title', handleSetTitle);
  ipcMain.on('open-file', handleOpenFile);
  ipcMain.handle('dialog:openFile', handleFileOpenDialog);
  ipcMain.on('openWindow', createNewWindow);
  ipcMain.handle('saveCsv', handleSaveCsv);
  ipcMain.on('openNewTab', handleNewTab);
  ipcMain.on('sendVrfq', handleSendVrfq);
  ipcMain.handle('createCrfq', handleCreateCrfq);
  ipcMain.handle('readExcel', handleReadExcel);
  ipcMain.handle('readClipboard', handleReadClipboard);
  // const server = expressApp.listen(port, () => {
  //   console.log(`Server is running on port ${port}`);
  // });
  createWindow();
})
  

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // server.close();
    app.quit();
  };
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
})
