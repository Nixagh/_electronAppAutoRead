const {app, BrowserWindow} = require('electron');
const path = require('node:path');

const settings = require('./settings.json');

// if any dialog is opened, close it
app.on('before-quit', () => {
    BrowserWindow.getAllWindows().forEach(win => win.close());
});

function createWindow(x, y, width, height, url, devTools, autoHideMenuBar, resizable, hide) {
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

    if (hide) {
        win.hide();
    }

    if (devTools) {
        win.webContents.openDevTools();
    }

    collectEvent(win);

    // this url read from file
    // const url = "https://www.nettruyenus.com/";
    try {
        // add Cookie header to request
        addCookie(win);

        win.loadURL(url).then();
    } catch (e) {
        console.log(e);
    }
}

const addCookie = (win) => {
    win.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
        details.requestHeaders['Cookie'] = settings.cookie;
        callback({cancel: false, requestHeaders: details.requestHeaders});
    });
}

const loadNewUrlIfReadDone = (win) => {
    const randomIndex = Math.floor(Math.random() * settings.urls.length);
    win.loadURL(settings.urls[randomIndex]).then();

}

const collectEvent = (win) => {
    win.webContents.on('ipc-message', (event, channel, ...args) => {
        switch (channel) {
            case 'read-done':
                loadNewUrlIfReadDone(win);
                break;
            case 'next':
                console.log(args[0]);
                break;
            default:
                break;
        }
    });
}

app.whenReady().then(() => {
    const hide = process.env.HIDE === 'true';

    // get height and width of screen
    const {width, height} = require('electron').screen.getPrimaryDisplay().workAreaSize;

    // get other window
    let i = 0;

    const randomIndex = Math.floor(Math.random() * settings.urls.length);

    createWindow(i++, height - settings.height, settings.width, settings.height, settings.urls[randomIndex], settings.devTools, settings.autoHideMenuBar, settings.resizable, hide);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow(i++, height - settings.height, settings.width, settings.height, settings.urls[randomIndex], settings.devTools, settings.autoHideMenuBar, settings.resizable, hide);
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

