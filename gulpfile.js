"use strict"
const gulp = require('gulp')
const sass = require('gulp-sass')
const browserify = require('browserify')
const stringify = require('stringify')
const source = require('vinyl-source-stream')
const shell = require('gulp-shell')
const packager = require('electron-packager')
const buffer = require('vinyl-buffer')
const childProcess = require('child_process')
const conf = require('./package.json')
const fs = require("fs")
const archiver = require('archiver')

const git_hash = childProcess.execSync('git rev-parse HEAD').toString().trim()

gulp.task('build:sass', () => {
	gulp.src('./src/style/*.scss')
		.pipe(sass())
		.pipe(gulp.dest('./build/style/'))

	gulp.src('./vendor/photon/fonts/*')
		.pipe(gulp.dest('./build/fonts/'))

	gulp.src('./vendor/font-awesome/fonts/*')
		.pipe(gulp.dest('./build/fonts/'))
})

gulp.task('build:js:browser', () => {
	browserify({
		entries: ['src/browser/app.js'],
		extensions: ['.js'],
    	ignoreMissing: true,
    	detectGlobals: false,
    	builtins: [],
    	debug: true,
	})
	.transform({
		NODE_ENV: 'production',
		GIT_HASH: git_hash,
		NAME: conf.name,
		VERSION: conf.version,
		ROOT: __dirname,
	}, 'envify')
	.transform('unassertify')
	.bundle()
	.pipe(source('app.js'))
	.pipe(buffer())
	.pipe(gulp.dest('build/browser'))
})

gulp.task('build:js:renderer', () => {
	browserify({
		transform: stringify({
			extensions: ['.html'],
			minify: true,
		}),
		entries: [
			'src/renderer/index.js',
			'src/renderer/about.js',
			'src/renderer/preferences.js',
		],
    	ignoreMissing: true,
    	detectGlobals: false,
    	builtins: [],
	    	debug: true,
	})
	.transform('unassertify')
	.bundle()
	.pipe(source('index.js'))
	.pipe(buffer())
	.pipe(gulp.dest('build/renderer'))
})

gulp.task('build:cp', () => {
	gulp.src('./src/renderer/*.html')
		.pipe(gulp.dest('./build/renderer'))
	gulp.src('./src/package.json')
		.pipe(gulp.dest('./build/'))
})

gulp.task('build:icon', shell.task([
		'mkdir -p build/tmp build/tmp/app.iconset/',
		'curl ls8h.com/yosemite-icon/api -F "icon_image=@icon/rabbit-base.png" -F "base_color=#8877c0" > build/tmp/icon.png',
		'sips -Z 16 build/tmp/icon.png --out build/tmp/app.iconset/icon_16x16.png',
		'sips -Z 32 build/tmp/icon.png --out build/tmp/app.iconset/icon_16x16@2x.png',
		'sips -Z 32 build/tmp/icon.png --out build/tmp/app.iconset/icon_32x32.png',
		'sips -Z 64 build/tmp/icon.png --out build/tmp/app.iconset/icon_32x32@2x.png',
		'sips -Z 128 build/tmp/icon.png --out build/tmp/app.iconset/icon_128x128.png',
		'sips -Z 256 build/tmp/icon.png --out build/tmp/app.iconset/icon_128x128@2x.png',
		'sips -Z 256 build/tmp/icon.png --out build/tmp/app.iconset/icon_256x256.png',
		'sips -Z 512 build/tmp/icon.png --out build/tmp/app.iconset/icon_256x256@2x.png',
		'sips -Z 512 build/tmp/icon.png --out build/tmp/app.iconset/icon_512x512.png',
		'sips -Z 1024 build/tmp/icon.png --out build/tmp/app.iconset/icon_512x512@2x.png',
		'(cd build && iconutil -c icns tmp/app.iconset)',
]))

gulp.task('build', ['build:cp', 'build:js:browser', 'build:js:renderer', 'build:sass', 'build:icon'])

gulp.task('release:osx', ['build'], (done) => {
	let packagerConf = {
		dir: 'build',
		out: 'build/release/',
		name: conf.name,
		arch: 'x64',
		platform: 'darwin',
		version: '0.36.1',
		icon: 'build/tmp/app.icns',
		ignore: ['tmp', 'release'],
		overwrite: true,
	}

	if (process.env.ELECTRON_SIGN) {
		packagerConf['sign'] = process.env.ELECTRON_SIGN
	}

	packager(packagerConf, (err, path) => {
		let archive = archiver.create('zip', {})
		let output = fs.createWriteStream(`build/release/${conf.name}-${conf.version}.zip`)
		output.on('end', () => {
			done()
		})
		archive.pipe(output)
		archive.directory(`build/release/${conf.name}-darwin-x64/`, false)
		archive.finalize()
	})

})

gulp.task('release', ['release:osx'])

gulp.task('serve', ['build:sass'], () => {
	const electron = require('electron-connect').server.create({path: 'src/', spawnOpt: {env: {
		GIT_HASH: git_hash,
		ROOT: __dirname,
		NAME: conf.name,
		VERSION: conf.version,
	}}})
	electron.start()
	gulp.watch('src/browser/**/*', electron.restart)
	gulp.watch('src/renderer/**/*', electron.reload)
	gulp.watch('src/style/*.scss', ['build:sass', electron.reload])
	electron.on('quit', () => {process.exit(0)})
	// electron.on('changeBounds', (arg) => console.dir(arg))
})

gulp.task('default', ['serve'])
