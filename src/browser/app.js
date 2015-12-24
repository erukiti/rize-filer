/*
Copyright 2015 SASAKI, Shunsuke. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

"use strict"

const app = require('electron').app
const BrowserWindow = require('electron').BrowserWindow
const Menu = require('electron').Menu
const ipc = require('electron').ipcMain
const client = require('electron-connect').client

global.appEnv = {
	title: process.env.NAME,
	version: process.env.VERSION,
	env: process.env.NODE_ENV || 'development',
	isDebug: process.env.NODE_ENV !== 'production',
	gitHash: process.env.GIT_HASH,
	root: process.env.ROOT,
}

appEnv['titleWithPostfix'] = `${appEnv.title} (${appEnv.env})`

app.on('window-all-closed', () => {
	app.quit()
})

let win = null
let winAbout = null
let winPreferences = null

let template = []

if (process.platform == 'darwin') {
	template.push({
		label: appEnv.title,
		submenu: [{
			label: `About ${appEnv.title}`,
			click: (item, focusedWindow) => {
				if (!winAbout) {
					winAbout = new BrowserWindow({
						width: 640,
						height: 400,
						'title-bar-style': 'hidden'
					})
					winAbout.loadURL(`file://${__dirname}/../renderer/about.html`)
					winAbout.on('close', () => winAbout = null)
				}
			},
		}, {
			type: 'separator'
		}, {
			label: 'Preferences',
			accelerator: 'Command+,',
			click: (item, focusedWindow) => {
				if (!winPreferences) {
					winPreferences = new BrowserWindow({
						width: 640,
						height: 400,
						'title-bar-style': 'hidden'
					})
					winPreferences.loadURL(`file://${__dirname}/../renderer/preferences.html`)
					winPreferences.on('close', () => winPreferences = null)
				}
			}
		}, {
			type: 'separator'
		}, {
			label: 'Services',
			role: 'services',
			submenu: []
		}, {
			type: 'separator'
		}, {
			label: 'Hide ' + appEnv.title,
			accelerator: 'Command+H',
			role: 'hide'
		}, {
			label: 'Hide Others',
			accelerator: 'Command+Shift+H',
			role: 'hideothers'
		}, {
			label: 'Show All',
			role: 'unhide'
		}, {
			type: 'separator'
		}, {
			label: 'Quit',
			accelerator: 'Command+Q',
			click: () => {
				app.quit()
			}
		}]
	})
}

template.push({
	label: 'Edit',
	submenu: [{
		label: 'Undo',
		accelerator: 'CmdOrCtrl+Z',
		role: 'undo'
	}, {
		label: 'Redo',
		accelerator: 'Shift+CmdOrCtrl+Z',
		role: 'redo'
	}, {
		type: 'separator'
	}, {
		label: 'Cut',
		accelerator: 'CmdOrCtrl+X',
		role: 'cut'
	}, {
		label: 'Copy',
		accelerator: 'CmdOrCtrl+C',
		role: 'copy'
	}, {
		label: 'Paste',
		accelerator: 'CmdOrCtrl+V',
		role: 'paste'
	}, {
		label: 'Select All',
		accelerator: 'CmdOrCtrl+A',
		role: 'selectall'
	}]
})

template.push({
	label: 'View',
	submenu: [{
		label: 'Toggle Full Screen',
		accelerator: process.platform == 'darwin' ? 'Ctrl+Command+F' : 'F11',
		click: (item, focusedWindow) => {
			if (focusedWindow) {
				focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
			}
		}
	}, {
		label: 'Toggle Developer Tools',
		accelerator: process.platform == 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
		click: (item, focusedWindow) => {
			if (focusedWindow) {
				focusedWindow.toggleDevTools();
			}
		}
	}]
})

template.push({
	label: 'Window',
	role: 'window',
	submenu: [{
		label: 'Minimize',
		accelerator: 'CmdOrCtrl+M',
		role: 'minimize'
	}, {
		label: 'Close',
		accelerator: 'CmdOrCtrl+W',
		role: 'close'
	}, {
		type: 'separator'
	}, {
		label: 'Bring All to Front',
		role: 'front'
	}]
})

let menu = Menu.buildFromTemplate(template);

app.on('ready', () => {
	win = new BrowserWindow({
		width: 1024,
		height: 800,
		'title-bar-style': 'hidden',
		title: 'hoge',
	})
	win.loadURL(`file://${__dirname}/../renderer/index.html`)
	win.on('close', () => win = null)
	Menu.setApplicationMenu(menu)
	win.webContents.on('did-finish-load', () => {
	})
	if (appEnv.isDebug) {
		let cl = client.create(win)
		app.on('quit', () => {
			cl.sendMessage('quit')
		})
	}
})
