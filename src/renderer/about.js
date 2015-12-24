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

const ipc = require('electron').ipcRenderer
const remote = require('electron').remote

const appEnv = remote.getGlobal('appEnv')

global.Rx = require('rx')
const wx = require('webrx')

if (appEnv.isDebug) {
	require('electron-connect').client.create()
}

class MainViewModel {
	constructor() {
		this.title = wx.property(appEnv.title)
		this.version = wx.property(appEnv.version)
		this.gitHash = wx.property(appEnv.gitHash)
	}
}

let mainViewModel = new MainViewModel()

wx.applyBindings(mainViewModel)
