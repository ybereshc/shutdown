const electron = require('electron');
const path = require('path');
const url = require('url');
const exec = require('child_process').execSync;
const {app, BrowserWindow, Menu, ipcMain} = electron;

process.env.NODE_ENV = 'production';
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;

var mainWindow;

app.on('ready', e => {
	mainWindow = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true
		},
		resizable: false,
		width: 550,
		height: 260,
		backgroundColor: '#000000'
	});

	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'mainWindow.html'),
		protocol: 'file',
		slashes: true
	}));

	if (process.env.NODE_ENV === 'production')
		mainWindow.removeMenu();
});

ipcMain.on('shutdown', () => {
	if (process.env.NODE_ENV === 'production')
		exec('shutdown /s /f /t 0');
	else
		console.log('shutdown /s /f /t 0');
});

ipcMain.on('progress', (e, progress, mode = 'normal') => {
	mainWindow.setProgressBar(progress, {mode: mode});
});
