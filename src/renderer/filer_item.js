"use strict"

const path = require('path')
const fs = require('fs')

global.Rx = require('rx')
global.wx = require('webrx')

class FilerItem {
	constructor(name, filerViewModel) {
		this.filerViewModel = filerViewModel
		this.filename = wx.property(name)
		this.st = wx.property(null)
		this.checked = wx.property(false)
		this.isSlective = wx.whenAny(this.filename, this.filerViewModel.currentFile, this.filerViewModel.isFocused, (filename, currentFile, isFocused) => {
			return isFocused && filename == currentFile
		})
		this.fullpath = path.join(this.filerViewModel.currentPath(), this.filename())
		fs.stat(this.fullpath, (err, st) => {
			this.st(st)
		})
	}
}

module.exports = FilerItem
