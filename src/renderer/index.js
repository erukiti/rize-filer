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
const shell = require('electron').shell
const spawn = require('child_process').spawn
const app = remote.app
const win = remote.getCurrentWindow()
const fs = require('fs')
const path = require('path')
const assert = require('power-assert')
// const posix = require('posix')

const uuidv4 = require('uuid-v4')


const appEnv = remote.getGlobal('appEnv')

global.Rx = require('rx')
global.wx = require('webrx')

// if (appEnv.isDebug) {
	global.require('stringify').registerWithRequire({extensions: ['.html']})
// }


const readComponents = () => {
	// let files = fs.readdirSync(`${__dirname}/component/`)
	// files.filter((file) => file.match(/.js$/) !== null).forEach((file) => {
	// 	let name = file.split('.')[0]
	// 	wx.app.component(name, {
	// 		viewModel: require(`./component/${name}.js`),
	// 		template: global.require(`./component/${name}.html`)
	// 	})
	// })

	wx.app.component('navi', {
		viewModel: require('./component/navi.js'),
		template: require('./component/navi.html')
	})

	wx.app.component('filer', {
		viewModel: require('./component/filer.js'),
		template: require('./component/filer.html')
	})
}

readComponents()

const ComponentViewModel = require('./component.js')



if (appEnv.isDebug) {
	require('electron-connect').client.create()
}

require('./key_event.js')

wx.app.component('filer-item-name', {
	viewModel: function(params) {
		this.filename = params.filename
	},
	template: `
	<span data-bind="text: filename"></span>
	`
})

wx.app.component('filer-item-size', {
	viewModel: function(params) {
		this.size = wx.whenAny(params.st, (st) => {
			if (!st) {
				return '....'
			} else if (st.isDirectory()) {
				return '[Directory]'
			} else {
				return st.size
			}
		}).toProperty()
	},
	template: `
	<div data-bind="text: size" style="text-align: right;"></div>
	`
})

wx.app.component('filer-item-ctime', {
	viewModel: function(params) {
		this.ctime = wx.whenAny(params.st, (st) => {
			return st ? st.ctime.toLocaleString() : '....'
		})
	},
	template: `
	<span data-bind="text: ctime"></span>
	`
})

wx.app.component('filer-item-check', {
	viewModel: function(params) {
		this.checked = params.checked
		this.click = (obj, ev) => {
			this.checked(!this.checked())
			ev.preventDefault()
		}
		this.isVisible = wx.whenAny(params.filename, (filename) => {
			return filename !== '..'
		})
	},
	template: `
	<div data-bind="event: {click: click}, visible: isVisible">
		<span data-bind="css: checked ? 'fa fa-check-square-o' : 'fa fa-square-o'"></span>
	</div>
	`
})

wx.app.component('filer-item-uid', {
	viewModel: function(params) {
		this.uid = wx.whenAny(params.st, (st) => {
			if (st) {
				return st.uid
				// return posix.getpwnam(st.uid).name
			} else {
				return '...'
			}
		}).toProperty()
	},
	template: `
	<span data-bind="text: uid"></span>
	`
})

wx.app.component('filer-item-gid', {
	viewModel: function(params) {
		this.gid = wx.whenAny(params.st, (st) => {
			if (st) {
				return st.gid
				// return posix.getgrnam(st.gid).name
			} else {
				return '...'
			}
		}).toProperty()
	},
	template: `
	<span data-bind="text: gid"></span>
	`
})

class MainViewModel {
	constructor() {
		this.title = wx.property(appEnv.titleWithPostfix)
		this.panes = wx.list()
		this.createPane('navi', 'pane-sm')
		this.filer1 = this.createPane('filer', 'pane')
		this.createPane('filer', 'pane')
		this.ev = (ctx, ev) => {
			console.log("body: keyevent")
			// ev.preventDefault()
		}
		this.focused = (ctx, ev) => {
			console.log('body focused')
			this.focusDefault()
		}
	}

	focusDefault() {
		let elem = document.getElementById(this.filer1)
		console.dir(elem)
		if (elem) {
			elem.focus()
		}
	}

	createPane(name, klass, opt) {
		let id = uuidv4()
		let viewModelProperty = wx.property(null)
		opt = opt || {}
		opt.id = id
		this.panes.push({id: id, name: name, viewModel: viewModelProperty, klass: klass, opt: opt})
		viewModelProperty.changed.subscribe((viewModel) => {
			console.log('set viewModel')
			console.dir(viewModel)
		})

		return id
	}
}

wx.app.defaultExceptionHandler = new Rx.Subject()
wx.app.defaultExceptionHandler.subscribe((err) => {
	console.error(err)
})

let mainViewModel = new MainViewModel()

wx.applyBindings(mainViewModel)

win.openDevTools()

mainViewModel.focusDefault()

