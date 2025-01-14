// ./public/electron.js
const path = require("path");
const contextMenu = require("electron-context-menu");
const {
	app,
	BrowserWindow,
	Menu,
	dialog,
	session,
	ipcMain,
	screen,
} = require("electron");
const isDev = require("electron-is-dev");
const si = require("systeminformation");
const { autoUpdater } = require("electron-updater");
si.baseboard()
	.then((data) => {
		const motherboardId = data.serial;
		console.log("Motherboard ID:", motherboardId);
		// Send the motherboard ID to the renderer process
		mainWindow.webContents.send("motherboardId", motherboardId);
	})
	.catch((error) => {
		console.error("Error retrieving motherboard information:", error);
	});
function createMainWindow() {
	// Create the browser window.
	const { width, height } = screen.getPrimaryDisplay().workAreaSize;
	const win = new BrowserWindow({
		title: "شركة النفط اليمنية-المهرة",
		width: Math.min(1366, width), // Adjust the width based on screen width
		height: Math.min(600, height), // Adjust the height based on screen height
		// autoHideMenuBar: true,
		webPreferences: {
			contextIsolation: false,
			nodeIntegration: true,
			preload: path.join(__dirname, "../preload.js"),
		},
		icon: path.join(__dirname, "../src/assets/logo.png"),
	});
	win.maximize();
	const template = [
		{
			label: "File",
			submenu: [{ role: "quit" }],
		},
	];
	const menu = Menu.buildFromTemplate(template);

	Menu.setApplicationMenu(menu);
	session.defaultSession.clearStorageData();
	win.loadURL(
		isDev ? "http://localhost:5173" : `file://${__dirname}/../build/index.html`
	);
}
contextMenu({
	showLearnSpelling: false,
	showLookUpSelection: false,
	showSearchWithGoogle: false,
	showCopyImage: false,
	showCopyLink: false,
	showSelectAll: false,
});
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	createMainWindow();
	app.setLocale("en-US");
	autoUpdater.checkForUpdates();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bars to stay active until the user quits
// explicitly with Cmd + Q.
ipcMain.on("open-pdf", (event, filePath) => {
	// Use the shell module to open the PDF file
	let win = new BrowserWindow({
		webPreferences: {
			plugins: true,
		},
	});
	win.loadURL(filePath);
});
autoUpdater.on("update-downloaded", (_event, releaseNote, releaseName) => {
	const dialogObj = {
		type: "info",
		buttons: ["إعادة التشغيل", "لاحقاً"],
		title: "تحديث النظام",
		message: process.platform === "win32" ? releaseNote : releaseName,
		detail:
			"تم تنزيل التحديثات بنجاح.الرجاء اعادة تشغيل البرنامج لتتم عملية التثبيت",
	};
	dialog.showMessageBox(dialogObj).then((returnValue) => {
		if (returnValue.response === 0) {
			autoUpdater.quitAndInstall();
		}
	});
});
autoUpdater.on("update-available", (_event, releaseNote, releaseName) => {
	const dialogObj = {
		type: "info",
		buttons: ["حسناً"],
		title: "تحديث النظام",
		message: process.platform === "win32" ? releaseNote : releaseName,
		detail: "يوجد تحديث للنظام.جاري تنزيل التحديثات في الخلفية",
	};
	dialog.showMessageBox(dialogObj, (response) => {});
});
autoUpdater.on("error", (_event, releaseNote, releaseName) => {
	const dialogObj = {
		type: "info",
		buttons: ["حسناً"],
		title: "خطأ",
		message: process.platform === "win32" ? releaseNote : releaseName,
		detail: "حصل خطأ اثناء عملية التحديث.الرجاء المحاولة مرة اخرى",
	};
	dialog.showMessageBox(dialogObj, (response) => {});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createMainWindow();
	}
});
