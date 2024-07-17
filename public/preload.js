const { 
    contextBridge, 
    ipcRenderer 
} = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    // openPartWindow: () => ipcRenderer.send('open-part-window'),
    reloadWindow: () => ipcRenderer.send('reload'),
    setTitle: (title) => ipcRenderer.send('set-title', title),
    selectFile: () => ipcRenderer.invoke('dialog:openFile'),
    openWindow: (params) => ipcRenderer.send('openWindow', params),
    openFile: (filepath) => ipcRenderer.send('open-file', filepath),
    saveCsv: (selected) => ipcRenderer.invoke('saveCsv', selected),
    openTab: (url) => ipcRenderer.send('openNewTab', url),
    sendVrfq: (param) => ipcRenderer.send('sendVrfq', param),
    createCrfq: (param) => ipcRenderer.invoke('createCrfq', param),
    readExcel: (param) => ipcRenderer.invoke('readExcel', param),
    readClipboard: () => ipcRenderer.invoke('readClipboard')
})