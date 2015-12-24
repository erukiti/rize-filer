"use strict"

const remote = require('electron').remote
const app = remote.app
const fs = require('fs')

global.Rx = require('rx')
global.wx = require('webrx')

const FilerItem = require('../filer_item.js')

const ComponentViewModel = require('../component.js')

class FilerViewModel {
	constructor (params) {
		params.viewModel(this)
		this.id = params.opt.id

		this.columns = wx.list(['check', 'name', 'size', 'ctime', 'uid', 'gid'])
		this.currentPath = wx.property(params.opt.path || app.getPath('home'))
		this.currentFile = wx.property(null)
		this.currentFile.changed.subscribe(
			(currentFile) => console.log(currentFile),
			(err) => console.dir(err)
		)

		this.files = wx.list()

		this.dblclick = (obj, ev) => {
			let filename = obj.$parent.filename()
			let st = obj.$parent.st()

			this.enter(filename, st)
		}

		this.click = (obj, ev) => {
			if (obj.$data !== 'check') {
				this.currentFile(obj.$parent.filename())
				ev.preventDefault()
			}
		}
		this.isFocused = wx.property(false)

		this.focused = (obj, ev) => {
			this.isFocused(true)
		}
		this.blured = (obj, ev) => {
			this.isFocused(false)
		}


		this.keydown = (obj, ev) => {
			switch (ev.keyCode) {
				case KeyEvent.DOM_VK_UP:
					this.up()
					ev.preventDefault()
					break

				case KeyEvent.DOM_VK_DOWN:
					this.down()
					ev.preventDefault()
					break

				case KeyEvent.DOM_VK_RETURN:
					let filename = this.currentFile()
					let ar = this.files.filter((file) => file.filename() == filename)
					if (ar.length > 0) {
						let st = ar[0].st()
						this.enter(filename, st)
					}
					ev.preventDefault()
					break
			}
		}

		wx.whenAny(this.currentPath, (currentPath) => {
			this.files.clear()
			fs.readdir(currentPath, (err, files) => {
				['..', ...files].forEach((filename) => {
					// console.log(filename)
					if (!this.currentFile()) {
						this.currentFile(filename)
					}

					let filerItem = new FilerItem(filename, this)
					this.files.push(filerItem)
				})
			})
		}).toProperty()



		// FIXME: polling でディレクトリ状態の変更を検出する
	}

	enter(filename, st) {
		if (st && st.isFile()) {
			let ch = spawn('open', [filename], {
				cwd: this.currentPath(),
			})
			ch.on('close', (code) => {
				console.log(`child process exit code ${code}`)
			})
			ch.stderr.on('data', (data) => {
				console.error(data.toString())
			})
			ch.stdout.on('data', (data) => {
				console.log(data.toString())
			})
		} else if (st && st.isDirectory()) {
			this.currentPath(path.join(this.currentPath(), filename))
			this.currentFile('..')
		}
	}

	up() {
		let ar = this.files.filter((value) => value.filename() == this.currentFile())
		console.dir(ar)

		if (ar.length > 0) {
			let n = this.files.indexOf(ar[0])
			if (n > 0) {
				n--
			}
			let item = this.files.get(n)
			if (item && item.filename()) {
				this.currentFile(item.filename())
			}
		}
	}

	down() {
		let ar = this.files.filter((value) => value.filename() == this.currentFile())
		console.dir(ar)

		if (ar.length > 0) {
			let n = this.files.indexOf(ar[0])
			if (n < this.files.length() - 1) {
				n++
			}
			let item = this.files.get(n)
			if (item && item.filename()) {
				this.currentFile(item.filename())
			}
		}
	}


}

module.exports = FilerViewModel
