"use strict"

global.Rx = require('rx')
const wx = require('../../../node_modules/webrx/dist/web.rx')

const ComponentViewModel = require('../component.js')

class NaviViewModel {
	constructor(params) {
		params.viewModel(this)
	}
}

module.exports = NaviViewModel
