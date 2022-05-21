// Пользовательские настройки

const baseDirs = { // Дирктории для файлов
    // Директория для разработки, в ней базируется сервер для хотрелоада (Скрипты и стили не сжимаются)
    default: `dist`,
    build: `docs`, // Директория для продакшена, в ней проект уже готов к выгрузке
    server: `/xampp/htdocs` // Диркетория для сервера (нужна для работы с php, указывается путь до папки в корне вашего apache сервера)
}

const otherFilesExtnames = [`json`, `txt`, `md`, `htaccess`, 'png', 'xml', 'ico'] // Расширения файлов которые не участвуют в сборке, но должны быть в продакшене

const path = { // Пути файлов
    // Генерация путей для вставки файлов в директории
    default: getDirs(baseDirs.default), // Рабочая
    build: getDirs(baseDirs.build), // Продакшн
    server: getDirs(baseDirs.server), // Сервер
    src: {
        // Пути до исходников
        html: [`src/**/*{html,php,pug}`, `!src/assets/**/*{html,pug}`],
        js: [`src/assets/js/*.js`],
        css: [`src/assets/sass/style.{scss,sass}`],
        images: [`src/assets/img/**/*.{jpg,png,svg,gif,ico,webp,jpeg}`],
        fonts: [`src/assets/fonts/**/*.*`],
        data: [`src/**/*.{${ otherFilesExtnames.join(`,`) }}`, `!src/img/**/*.*`]
    },
    watch: {
        html: ["src/**/*.{html,php,pug}"],
        js: [`src/assets/js/**/*.js`],
        css: ["src/assets/sass/**/*.{scss,sass,css}"],
        images: [`src/assets/img/**/*.{jpg,png,svg,gif,ico,webp,jpeg}`],
        fonts: [`src/assets/fonts/**/*.*`],
        data: [`src/**/*.{${ otherFilesExtnames.join(`,`) }}`, `!src/img/**/*.*`]
    }
}

// подключение плагинов

const {src, dest} = require(`gulp`), // подключение фукций gulp'а в отдельные переменные
    gulp = require(`gulp`), // подключение gulp'а
    browsersync = require(`browser-sync`).create(), // создание хотрелоад сервера
    del = require(`del`), // Подключение плагина удаления
    cleancss = require(`gulp-clean-css`), // плагин очистки css
    plumber = require(`gulp-plumber`), // плагин для сохранения потока в случае ошибки
    rigger = require(`gulp-rigger`), // плагин соединения файлов
    sass = require(`gulp-sass`)(require(`sass`)), // плагин компиляции sass/scss
    removecomments = require(`gulp-strip-css-comments`), // плагин удаления комментариев из css
    uglify = require(`gulp-uglify`), // плагин сжатия js
    autoprefixer = require(`gulp-autoprefixer`), // плагин добавления префиксов css
    gcmq = require(`gulp-group-css-media-queries`), // плагин группировки media запросов css
    htmlmin = require(`gulp-htmlmin`), // плагин сжатия css
    pug = require(`gulp-pug`), // плагин компиляции pug
    gulpif = require(`gulp-if`) // плагин для проверки условий

const check = { // Функции проверки для плагина gulpif
    notPHP: file => (file.extname != `.php`), // Возвращает true если файл не php
    isPug: file => (file.extname == `.pug`) // true если файл pug
}

const dev = { // Функции сборки для разработки
    browserSync(done) { // Функция запуска хотрелоад сервера
        browsersync.init({
            server: {
                baseDir: `./${ baseDirs.default }`
            },
            port: 8000,
            notify: false
        })
    },
    html() {
        return src(path.src.html)
            .pipe(plumber())
            .pipe(gulpif(check.isPug, pug())) // компиляция pug
            .pipe(gulpif(check.notPHP, dest(path.default.base))) // Вставить в рабочуу папку если это не php
            .pipe(browsersync.stream()) // перезагрузить браузеры
    },
    css() {
        return src(path.src.css)
            .pipe(plumber())
            .pipe(sass({
                outputStyle: `expanded`
            })) // компиляция sass,scss в несжатом виде
            .pipe(dest(path.default.css)) // вставка
            .pipe(browsersync.stream()) // перезагрузить браузеры
    },
    js() {
        return src(path.src.js)
            .pipe(plumber())
            .pipe(rigger()) // соеденить JS скрипты
            .pipe(dest(path.default.js)) // вставить
            .pipe(browsersync.stream()) // перезагрузить браузеры
    },
    images() { // вставить изображения и перезагрузить браузеры
        return src(path.src.images)
            .pipe(dest(path.default.images))
            .pipe(browsersync.stream())
    },
    fonts() { // вставить шрифты
        return src(path.src.fonts)
            .pipe(gulp.dest(path.default.fonts))
    },
    data() {
        return src(path.src.data, {dot: true})
            .pipe(dest(path.default.base))
    },
    watch() { // наблюдения за изменением файлов
        gulp.watch(path.watch.html, dev.html)
        gulp.watch(path.watch.js, dev.js)
        gulp.watch(path.watch.css, dev.css)
        gulp.watch(path.watch.images, dev.images)
        gulp.watch(path.watch.fonts, dev.fonts)
    },
    clear() { // очистка рабочей директории перед запуском сборки
        return del(path.default.base)
    }
}

const build = { // функции сборки для продакшена
    html() {
        return src(path.src.html)
            .pipe(plumber())
            .pipe(gulpif(check.isPug, pug())) // компиляция pug
            .pipe(gulpif(check.notPHP, htmlmin({ // сжатие html
                collapseWhitespace: true,
                removeComments: true
            })))
            .pipe(dest(path.build.base)) // вставка
    },
    css() {
        return src(path.src.css)
            .pipe(plumber())
            .pipe(sass({ // компиляция sass,scss с сжатием
                outputStyle: `compressed`
            }))
            .pipe(autoprefixer({
                overrideBrowserslist: [`last 15 versions`, `> 1%`, `ie 8`, `ie 7`], // добавление префиксов
                cascade: true
            }))
            .pipe(gcmq()) // соединение media запросов
            .pipe(cleancss()) // очистка css
            .pipe(removecomments()) // удаление комментариев
            .pipe(dest(path.build.css)) // вставка
    },
    js() {
        return src(path.src.js)
            .pipe(plumber())
            .pipe(rigger()) // соединение скриптов
            .pipe(uglify()) // сжатие
            .pipe(dest(path.build.js)) // вставка
    },
    images() {
        return src(path.src.images)
        .pipe(dest(path.build.images))
    },
    data() {
        return src(path.src.data, {dot: true})
            .pipe(dest(path.build.base))
    },
    fonts() {
        return src(path.src.fonts)
            .pipe(gulp.dest(path.build.fonts))
    },
    clear() { // очистка папки перед сборкой на продакшен
        return del(path.build.base)
    }
}

const server = { // задачи для сервера
    html() {
        return src(path.src.html)
            .pipe(plumber())
            .pipe(gulpif(check.isPug, pug())) // компиляция pug
            .pipe(dest(path.server.base)) // вставка
    },
    css() {
        return src(path.src.css)
            .pipe(plumber())
            .pipe(sass({
                outputStyle: `expanded`
            })) // компиляция sass,scss
            .pipe(dest(path.server.css)) // вставка
    },
    js() {
        return src(path.src.js)
            .pipe(plumber())
            .pipe(rigger()) // соединение
            .pipe(dest(path.server.js)) // вставка
    },
    images() {
        return src(path.src.images)
            .pipe(dest(path.server.images))
    },
    fonts() {
        return src(path.src.fonts)
            .pipe(dest(path.server.fonts))
    },
    data() {
        return src(path.src.data, {dot: true})
            .pipe(dest(path.server.base))
    },
    clear() { // очистка сервера перед стартом задачи
        return del(path.server.base, {force: true})
    },
    watch() { // наблюдение за изменением
        gulp.watch(path.watch.html, server.html)
        gulp.watch(path.watch.js, server.js)
        gulp.watch(path.watch.css, server.css)
        gulp.watch(path.watch.images, server.images)
        gulp.watch(path.watch.fonts, server.fonts)
        gulp.watch(path.watch.data, server.data)
    }
}

// Рабочая сборка
const main = gulp.series(
    dev.clear,
    gulp.parallel([
        dev.html,
        dev.css,
        dev.js,
        dev.images,
        dev.fonts,
        dev.data
    ]
))
// продакшн сборка
const prod = gulp.parallel([
    build.html,
    build.css,
    build.js,
    build.images,
    build.fonts,
    build.data
])

// Сервер
const serv = gulp.series(
    server.clear,
    gulp.parallel(
        server.html,
        server.css,
        server.js,
        server.images,
        server.fonts,
        server.data
    ),
    server.watch
)

module.exports = {
    default: gulp.parallel(main, dev.watch, dev.browserSync), // Задача для разработки
    build: gulp.series(build.clear, prod), // для сборки продакшена
    server: serv // сервер
}

function getDirs(dir) { // функция генерации путей
    return {
        base: `${dir}/`,
        js: `${dir}/assets/js`,
        css: `${dir}/assets/css/`,
        images: `${dir}/assets/img/`,
        fonts: `${dir}/assets/fonts/`
    }
}