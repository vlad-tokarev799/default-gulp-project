'use strict'
const {src, dest} = require('gulp'); 
const gulp = require('gulp');
const browsersync = require('browser-sync').create();
const del = require('del');
const cleancss = require('gulp-clean-css');
const imagemin= require('gulp-imagemin');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const rigger = require('gulp-rigger');
const sass = require("gulp-sass")(require('sass'));
const removecomments = require("gulp-strip-css-comments");
const uglify = require("gulp-uglify");
const panini = require("panini");
const autoprefixer = require('gulp-autoprefixer');
const gcmq = require('gulp-group-css-media-queries');
const htmlmin = require('gulp-htmlmin');
const G = require('glob');

var path = {
    build: {
        html: 'dist/',
        js: 'dist/assets/js/',
        css: 'dist/assets/css/',
        images: 'dist/assets/img/',
        fonts: 'dist/assets/fonts/'
    },
    prod: {
        html: 'prod/',
        js: 'prod/assets/js/',
        css: 'prod/assets/css/',
        images: 'prod/assets/img/',
        fonts: 'prod/assets/fonts/'
    },
    src: {
        html: "src/*.html",
        js: "src/assets/js/*.js",
        css: "src/assets/sass/style.scss",
        images: "src/assets/img/**/*.{jpg,png,svg,gif,ico}",
        fonts: "src/assets/fonts/**/*.*"
    },
    watch: {
        html: "src/**/*.html",
        js: "src/assets/js/**/*.js",
        css: "src/assets/sass/**/*.scss",
        images: "src/assets/img/**/*.{jpg,png,svg,gif,ico}",
        fonts: "src/assets/fonts/**/*.*"
    },
    cleanDist: "./dist",
    cleanProd: "./prod"
}



function browserSync(done) {
    browsersync.init({
        server: {
            baseDir: "./dist/"
        },
        port: 3000,
        notify: false
    });
}
function browserSyncReload(done) {
    browsersync.reload();
}

// dev build

function html() {
    return src(path.src.html, { base: "src/"})
        .pipe(plumber())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream());
}

function css() {
    return src(path.src.css, { base: "src/assets/sass/"})
    .pipe(plumber())
    .pipe(sass({outputStyle: 'expanded'}))
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream());
}

function js() {
    return src(path.src.js, {base: "./src/assets/js/"})
        .pipe(plumber())
        .pipe(rigger())
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream());
}

function images() {
    return src(path.src.images)
        .pipe(dest(path.build.images))
        .pipe(browsersync.stream());
}

function fonts() {
    return src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
}

function cleanDist() {
    return del(path.cleanDist);
}
function cleanProd() {
    return del(path.cleanProd);
}

function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.images], images);
    gulp.watch([path.watch.fonts], fonts);
}

// prod build

function prodHtml() {
    return src(path.src.html, { base: "src/"})
        .pipe(plumber())
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(dest(path.prod.html));
}

function prodCss() {
    return src(path.src.css, { base: "src/assets/sass/"})
    .pipe(plumber())
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(autoprefixer({
        overrideBrowserslist: ['last 15 versions', '> 1%', 'ie 8', 'ie 7'],
        cascade: true
    }))
    .pipe(gcmq())
    .pipe(dest(path.prod.css))
    .pipe(cleancss())
    .pipe(removecomments())
    .pipe(rename({
        suffix: ".min",
        extname: ".css"
    }))
    .pipe(dest(path.prod.css));
}

function prodJs() {
    return src(path.src.js, {base: "./src/assets/js/"})
        .pipe(plumber())
        .pipe(rigger())
        .pipe(gulp.dest(path.prod.js))
        .pipe(uglify())
        .pipe(rename({
            suffix: ".min",
            extname: ".js"
        }))
        .pipe(dest(path.prod.js));
}

function prodImages() {
    return src(path.src.images)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            interlaced: true,
            optimizationLevel: 3 // 0 to 7
        }))
        .pipe(dest(path.prod.images));
}

const prod = gulp.series(cleanProd, gulp.parallel(prodHtml, prodCss, prodJs, prodImages, fonts));
const build = gulp.series(cleanDist, gulp.parallel(html, css, js, images, fonts));
const watch = gulp.parallel(build, watchFiles, browserSync);



exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.fonts = fonts;
exports.cleanDist = cleanDist;
exports.cleanProd = cleanProd;
exports.build = build;
exports.watch = watch;
exports.default = watch;
exports.prod = prod;