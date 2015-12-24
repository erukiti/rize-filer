"use strict"

class ComponentViewModel {
	constructor(params) {
		try {
			params.viewModel(this)
		} catch (e) {
			console.error(e)
		}
	}
}

module.exports = ComponentViewModel
