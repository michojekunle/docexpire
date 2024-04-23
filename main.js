const { Menu, ipcMain } = require("electron");
const { app, BrowserWindow } = require("electron/main");
const path = require("node:path");
const url = require("url");

let main;
let addDocWin;

const mainMenu = [
  { label: "" },
  {
    label: "File",
    submenu: [
      {
        label: "Add Document",
        click() {
          addDocumentWindow();
        },
      },
      {
        label: "Clear documents",
        click() {
          main.webContents.send("doc:clear");
        },
      },
      // for cloud syncing for the future
      {
        label: "User Details",
      },
      {
        label: "Exit App",
        accelerator: process.platform == "darwin" ? "Command+E" : "Ctrl+E",
        click() {
          app.quit();
        },
      },
    ],
  },
];

function addWindow(name, params) {
  let win = new BrowserWindow(params);

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, `${name}.html`),
      protocol: "file",
      slashes: true,
    })
  );

  return win;
}

function menuMac() {
  if (process.platform == "darwin") {
    mainMenu.unshift({ label: "" });
  }
}

function enableDevTools() {
  if (
    process.env.NODE_ENV === undefined ||
    process.env.NODE_ENV !== "production"
  ) {
    mainMenu.push({
      label: "DevTools",
      submenu: [
        {
          label: "Toggle DevTools",
          accelerator: process.platform == "darwin" ? "Command+T" : "Ctrl+T",
          click(i, fw) {
            fw.toggleDevTools();
          },
        },
      ],
    });
  }
}

function displayMenu() {
  menuMac();
  enableDevTools();

  const menu = Menu.buildFromTemplate(mainMenu);

  Menu.setApplicationMenu(menu);
}

function addDocumentWindow() {
  addDocWin = addWindow("doc", {
    width: 200,
    height: 300,
    title: "Add Document",
  });

  // Garbage collection
  addDocWin.on("close", () => {
    addDocWin = null;
  });
}

ipcMain.on("doc:add", (e, item) => {
  console.log(item);
  main.webContents.send("doc:add", item);
  addDocWin.close();
});

app.on("ready", () => {
  // create browser window
  main = addWindow("main", {});

  displayMenu();

  main.on("closed", () => {
    app.quit();
  });
});

// function createWindow () {
//   const win = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       preload: path.join(__dirname, 'preload.js')
//     }
//   })

//   win.loadFile('index.html')
// }

// app.whenReady().then(() => {
//   createWindow()

//   app.on('activate', () => {
//     if (BrowserWindow.getAllWindows().length === 0) {
//       createWindow()
//     }
//   })
// })

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit()
//   }
// })
