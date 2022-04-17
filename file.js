'use strict'
const {src, dest} = require('gulp'); 
const gulp = require('gulp');
const browsersync = require('browser-sync').create();
const del = require('del');
const cleancss = require('gulp-clean-css');
const plumber = require('gulp-plumber');
const rigger = require('gulp-rigger');
const sass = require("gulp-sass")(require('sass'));
const removecomments = require("gulp-strip-css-comments");
const uglify = require("gulp-uglify");
const autoprefixer = require('gulp-autoprefixer');
const gcmq = require('gulp-group-css-media-queries');
const htmlmin = require('gulp-htmlmin');
const pug = require('gulp-pug');
const gulpif = require('gulp-if')

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
        fonts: 'prod/assets/fonts/',
        data: 'prod/'
    },
    src: {
        html: "src/**/*.{html,php}",
        js: "src/assets/js/*.js",
        css: "src/assets/sass/style.+(scss|sass)",
        images: "src/assets/img/**/*.{jpg,png,svg,gif,ico,webp,jpeg}",
        fonts: "src/assets/fonts/**/*.*",
        pug: "src/*.pug",
        htaccess: 'src/.htaccess',
        data: 'src/**/*.{json,txt,md}'
    },
    watch: {
        html: "src/**/*.{html, php}",
        js: "src/assets/js/**/*.js",
        css: "src/assets/sass/**/*.+(scss|sass)",
        images: "src/assets/img/**/*.{jpg,png,svg,gif,ico,webp,jpeg}",
        fonts: "src/assets/fonts/**/*.*",
        pug: "src/*.pug",
        htaccess: 'src/.htaccess',
        data: 'src/*.*'
    },
    server: {
        html: '/OpenServer/domains/renta.loc',
        js: '/OpenServer/domains/renta.loc/assets/js/',
        css: '/OpenServer/domains/renta.loc/assets/css/',
        images: '/OpenServer/domains/renta.loc/assets/img/',
        fonts: '/OpenServer/domains/renta.loc/assets/fonts/',
        data: '/OpenServer/domains/renta.loc'
    },
    cleanDist: "./dist",
    cleanProd: "./prod",
    cleanServer: '/OpenServer/domains/renta.loc'
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

function pugTask() {
    return src(path.src.pug, {base: 'src/'})
        .pipe(plumber())
        .pipe(pug())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
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
function cleanServer() {
    return del(path.cleanServer, {force: true});
}

function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.images], images);
    gulp.watch([path.watch.fonts], fonts);
    gulp.watch([path.watch.pug], pugTask);
}

// prod build

function prodHtml() {
    const condition = function(file) {
        if (file.extname == '.php') {
            return false
        }
    }

    return src(path.src.html, { base: "src/"})
        .pipe(plumber())
        .pipe(gulpif(condition, htmlmin({
            collapseWhitespace: true,
            removeComments: true
        })))
        .pipe(dest(path.prod.html));
}

function prodPug() {
    return src(path.src.pug, {base: 'src/'})
        .pipe(plumber())
        .pipe(pug())
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(dest(path.prod.html))
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
    .pipe(cleancss())
    .pipe(removecomments())
    .pipe(dest(path.prod.css));
}

function prodJs() {
    return src(path.src.js, {base: "./src/assets/js/"})
        .pipe(plumber())
        .pipe(rigger())
        .pipe(uglify())
        .pipe(dest(path.prod.js));
}

function prodImages() {
    return src(path.src.images)
        .pipe(dest(path.prod.images));
}

function prodHtaccess() {
    return src(path.src.htaccess)
        .pipe(gulp.dest(path.prod.data))
}

function prodData() {
    return src(path.src.data)
        .pipe(gulp.dest(path.prod.data))
}

function prodFonts() {
    return src(path.src.fonts)
        .pipe(gulp.dest(path.prod.fonts))
}

// server build 

function ServBrowser() {
    browsersync.init({
        proxy: 'renta.loc'
    });
}

function ServHtml() {
    return src(path.src.html, { base: "src/"})
        .pipe(plumber())
        .pipe(dest(path.server.html))
        .pipe(browsersync.stream());
}

function ServPug() {
    return src(path.src.pug, {base: 'src/'})
        .pipe(plumber())
        .pipe(pug())
        .pipe(dest(path.server.html))
        .pipe(browsersync.stream())
}

function ServCss() {
    return src(path.src.css, { base: "src/assets/sass/"})
    .pipe(plumber())
    .pipe(sass({outputStyle: 'expanded'}))
    .pipe(dest(path.server.css))
    .pipe(browsersync.stream());
}

function ServJs() {
    return src(path.src.js, {base: "./src/assets/js/"})
        .pipe(plumber())
        .pipe(rigger())
        .pipe(dest(path.server.js))
        .pipe(browsersync.stream());
}

function ServImages() {
    return src(path.src.images)
        .pipe(dest(path.server.images))
        .pipe(browsersync.stream());
}

function ServFonts() {
    return src(path.src.fonts)
        .pipe(gulp.dest(path.server.fonts));
}

function ServHtaccess() {
    return src(path.src.htaccess)
        .pipe(gulp.dest(path.server.data))
}

function ServData() {
    return src(path.src.data)
        .pipe(gulp.dest(path.server.data))
}

function watchServerFiles() {
    gulp.watch([path.watch.html], ServHtml);
    gulp.watch([path.watch.css], ServCss);
    gulp.watch([path.watch.js], ServJs);
    gulp.watch([path.watch.images], ServImages);
    gulp.watch([path.watch.fonts], ServFonts);
    gulp.watch([path.watch.pug], ServPug);
    gulp.watch([path.watch.htaccess], ServHtaccess)
    gulp.watch([path.watch.data], ServData)
}

const prod = gulp.series(cleanProd, gulp.parallel(prodPug, prodHtml, prodCss, prodJs, prodImages, prodFonts, prodHtaccess, prodData));
const build = gulp.series(cleanDist, gulp.parallel(pugTask, html, css, js, images, fonts));
const serverTask = gulp.series(cleanServer, gulp.parallel(ServPug, ServHtml, ServCss, ServJs, ServImages, ServFonts, ServHtaccess, ServData))

const watch = gulp.parallel(build, watchFiles, browserSync);
const wathcServer = gulp.parallel(serverTask, watchServerFiles, ServBrowser)



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
exports.server = wathcServer;