'use strict';

const gulp = require('gulp'),
    pug = require('gulp-pug'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync').create(),
    autoprefixer = require('gulp-autoprefixer'),
    notify = require("gulp-notify"),
    sourcemaps = require('gulp-sourcemaps'),
    concat = require('gulp-concat'),
    cssmin = require('gulp-cssmin'),
    terser = require('gulp-terser'),
    svgmin = require('gulp-svgmin'),
    svgSprite = require('gulp-svg-sprite'),
    cheerio = require('gulp-cheerio'),
    replace = require('gulp-replace'),
    webp = require('gulp-webp');


//подключение pug, компиляция в html
gulp.task('pug', function () {
    return gulp.src('src/pug/pages/*.pug')
        .pipe(pug({
            pretty: true
        }))
        .pipe(gulp.dest('build'))
        .on('end', browserSync.reload);
});


// автообновление страницы Browsersync
gulp.task('serve', function () {
    browserSync.init({
        server: {
            baseDir: './build'
        }
    });
});

//подключение sass, компиляция в css + автопрефиксер + минификация css
gulp.task('sass', function () {
    return gulp.src('src/static/scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({'include css': true}).on("error", notify.onError()))
        .pipe(autoprefixer(['last 10 versions']))
        .pipe(cssmin())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('build/css'))
        .pipe(browserSync.reload({stream: true}));
});

//подключение библиотек CSS
//    gulp.task('styles', function () {
//        return gulp.src([
//            'node_modules/slick-carousel/slick/slick.css',
//            'node_modules/slick-carousel/slick/slick-theme.css',
//        ])
//            .pipe(concat('libs.min.css'))
//            .pipe(cssmin())
//            .pipe(gulp.dest('build/css'))
//    });

//подключение библиотек JS
//    gulp.task('scripts', function () {
//        return gulp.src([
//            'node_modules/jquery/dist/jquery.slim.min.js',
//            'node_modules/slick-carousel/slick/slick.min.js',
//        ])
//            .pipe(concat('libs.min.js'))
//            .pipe(terser())
//            .pipe(gulp.dest('build/js'))
//            .pipe(browserSync.reload({stream: true}));
//    });

//минификация js
gulp.task('js', function () {
    return gulp.src('src/static/js/main.js')
        .pipe(terser())
        .pipe(gulp.dest('build/js'))
        .pipe(browserSync.reload({stream: true}));
});

//конвертируем изображения в webP

gulp.task('webP', () =>
    gulp.src('src/static/img/**/*.{png,jpg,jpeg}')
        .pipe(webp({quality: 50}))
        .pipe(gulp.dest('build/img'))
);

//svg-спрайт
gulp.task('svg', function () {

    return gulp.src('src/static/img/svg/*.svg')
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
            },
            parserOptions: {xmlMode : true}
        }))
        .pipe(replace('&gt', '>'))
        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: 'sprites.svg'
                }
            }
        }))
        .pipe(gulp.dest('build/img/svg/'));

});

//Следим за изменениями в файлах

gulp.task('watch', function () {
    gulp.watch('src/pug/**/*.pug', gulp.series('pug'));
    gulp.watch('src/static/scss/**/*.scss', gulp.series('sass'));
    gulp.watch('src/static/js/main.js', gulp.series('js'));
    gulp.watch('src/static/img/**/*', gulp.series('webP'));
    gulp.watch('src/static/img/svg/*.svg', gulp.series('svg'));
});


//дефолт-таск
gulp.task('default', gulp.series(
    gulp.parallel('pug', 'sass', 'js', 'webP', 'svg'),
    gulp.parallel('watch', 'serve')
));