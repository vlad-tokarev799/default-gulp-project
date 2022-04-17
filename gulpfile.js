const {src, dest} = require('gulp'),
	gulp = require('gulp'),
	browsersync = require('browser-sync').create(),
	del = require('del'),
	cleancss = require('gulp-clean-css'),
	plumber = require('gulp-plumber'),
	rigger = require('gulp-rigger'),
	sass = require('gulp-sass')(require('sass')),
	removecomments = require('gulp-strip-css-comments'),
	uglify = require('gulp-uglify'),
	autoprefixer = require('gulp-autoprefixer'),
	gcmq = require('gulp-group-css-media-queries'),
	htmlmin = require('gulp-htmlmin'),
	pug = require('gulp-pug'),
	gulpif = require('gulp-if')

const baseDirs = {
	default: 'dist',
	build: 'docs',
	server: 'server'
}

function getDirs(dir) {
	return {
		base: `${dir}/`,
		js: `${dir}/assets/js`,
		css: `${dir}/assets/css/`,
		images: `${dir}/assets/img/`,
		fonts: `${dir}/assets/fonts/`
	}
}

const path = {
	default: getDirs(baseDirs.default),
	build: getDirs(baseDirs.build),
	server: getDirs(baseDirs.server),
	src: {
		html: 'src/**/*{html,php,pug}',
		js: 'src/assets/js/*.js',
		css: 'src/assets/sass/style.{scss,sass}',
		images: 'src/assets/img/**/*.{jpg,png,svg,gif,ico,webp,jpeg}',
		fonts: 'src/assets/fonts/**/*.*',
		data: 'src/**/*.{json,txt,md,htaccess}'
	},
	watch: {
		html: "src/**/*.{html,php,pug}",
		js: 'src/assets/js/**/*.js',
		css: "src/assets/sass/**/*.{scss,sass,css}",
		images: 'src/assets/img/**/*.{jpg,png,svg,gif,ico,webp,jpeg}',
		fonts: 'src/assets/fonts/**/*.*',
		data: 'src/**/*.{json,txt,md,htaccess}'
	}
}

function browserSync(done) {
	browsersync.init({
		server: {
			baseDir: "./dist"
		},
		port: 3000,
		notify: false
	})
}

const check = {
	notPHP: file => (file.extname != '.php'),
	isPug: file => (file.extname == '.pug')
}

const dev = {
	html: () => {
		return src(path.src.html)
			.pipe(plumber())
			.pipe(gulpif(check.isPug, pug()))
			.pipe(gulpif(check.notPHP, dest(path.default.base)))
			.pipe(browsersync.stream())
	},
	css: () => {
		return src(path.src.css)
			.pipe(plumber())
			.pipe(sass({outputStyle: 'expanded'}))
			.pipe(dest(path.default.css))
			.pipe(browsersync.stream())
	},
	js: () => {
		return src(path.src.js)
			.pipe(plumber())
			.pipe(rigger())
			.pipe(dest(path.default.js))
			.pipe(browsersync.stream())
	},
	images: () => {
		return src(path.src.images)
			.pipe(dest(path.default.images))
			.pipe(browsersync.stream())
	},
	fonts: () => {
		return src(path.src.fonts)
			.pipe(gulp.dest(path.default.fonts))
	},
	watch: () => {
		gulp.watch([path.watch.html], this.html)
		gulp.watch([path.watch.js], this.js)
		gulp.watch([path.watch.css], this.css)
		gulp.watch([path.watch.images], this.images)
		gulp.watch([path.watch.fonts], this.fonts)
	},
	clear: () => {
		return del(path.default.base)
	}
}

const build = {
	html: () => {
		return src(path.src.html)
			.pipe(plumber())
			.pipe(gulpif(check.isPug, pug()))
			.pipe(gulpif(check.notPHP, htmlmin({
				collapseWhitespace: true,
				removeComments: true
			})))
			.pipe(dest(path.build.base))
	},
	css: () => {
		return src(path.src.css)
			.pipe(plumber())
			.pipe(sass({outputStyle: 'compressed'}))
			.pipe(autoprefixer({
				overrideBrowserslist: ['last 15 versions', '> 1%', 'ie 8', 'ie 7'],
				cascade: true
			}))
			.pipe(gcmq())
			.pipe(cleancss())
			.pipe(removecomments())
			.pipe(dest(path.build.css))
	},
	js: () => {
		return src(path.src.js)
			.pipe(plumber())
			.pipe(rigger())
			.pipe(uglify())
			.pipe(dest(path.build.js))
	},
	images: () => {
		return src(path.src.images)
			.pipe(dest(path.build.images))
	},
	data: () => {
		return src(path.src.data)
			.pipe(dest(path.build.base))
	},
	fonts: () => {
		return src(path.src.fonts)
			.pipe(gulp.dest(path.build.fonts))
	},
	clear: () => {
		return del(path.build.base)
	}
}

const server = {
	html: () => {
		return src(path.src.html)
			.pipe(plumber())
			.pipe(gulpif(check.isPug, pug()))
			.pipe(dest(path.server.base))
	},
	css: () => {
		return src(path.src.css)
			.pipe(plumber())
			.pipe(sass({outputStyle: 'expanded'}))
			.pipe(dest(path.server.css))
	},
	js: () => {
		return src(path.src.js)
			.pipe(plumber())
			.pipe(rigger())
			.pipe(dest(path.server.js))
	},
	images: () => {
		return src(path.src.images)
			.pipe(dest(path.server.images))
	},
	fonts: () => {
		return src(path.src.fonts)
			.pipe(dest(path.server.fonts))
	},
	data: () => {
		return src(path.src.data)
			.pipe(dest(path.server.base))
	},
	clear: () => {
		return del(path.server.base)
	},
	watch: () => {
		gulp.watch([path.watch.html], this.html)
		gulp.watch([path.watch.js], this.js)
		gulp.watch([path.watch.css], this.css)
		gulp.watch([path.watch.images], this.images)
		gulp.watch([path.watch.fonts], this.fonts)
		gulp.watch([path.watch.data], this.data)
	}
}

const main = gulp.series(dev.clear, gulp.parallel([dev.html, dev.css, dev.js, dev.images, dev.fonts]))
const prod = gulp.parallel([build.html, build.css, build.js, build.images, build.fonts, build.data])
const serv = gulp.series(server.clear, gulp.parallel(server.html, server.css, server.js, server.images, server.fonts, server.data), server.watch)


module.exports = {
	default: gulp.parallel(main, dev.watch, browserSync), 
	build: gulp.series(build.clear, prod),
	server: serv
}