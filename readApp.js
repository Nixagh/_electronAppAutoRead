const {app, BrowserWindow} = require('electron');
const path = require('node:path');

const settings = require('./settings.json');

// if any dialog is opened, close it
app.on('before-quit', () => {
    BrowserWindow.getAllWindows().forEach(win => win.close());
});

function createWindow(x, y, width, height, url, devTools, autoHideMenuBar, resizable) {
    const win = new BrowserWindow({
        width: width,
        height: height,
        autoHideMenuBar: autoHideMenuBar,
        // cant change size
        resizable: resizable,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
        x: x,
        y: y
    })

    // this url read from file
    // const url = "https://www.nettruyenus.com/";
    try {
        win.loadURL(url).then();
    } catch (e) {
        console.log(e);
    }

    if (devTools) {
        win.webContents.openDevTools();
    }
}

app.whenReady().then(() => {
    // get height and width of screen
    const {width, height} = require('electron').screen.getPrimaryDisplay().workAreaSize;

    // get other window
    let i = 0;

    const randomIndex = Math.floor(Math.random() * settings.urls.length);

    createWindow(i++, height - settings.height, settings.width, settings.height, settings.urls[randomIndex], settings.devTools, settings.autoHideMenuBar, settings.resizable);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow(i++, height - settings.height, settings.width, settings.height, settings.urls[randomIndex], settings.devTools, settings.autoHideMenuBar, settings.resizable);
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

