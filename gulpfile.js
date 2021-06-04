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
    tinypng = require('gulp-tinypng-compress'),
    svgmin = require('gulp-svgmin'),
    svgSprite = require('gulp-svg-sprite'),
    cheerio = require('gulp-cheerio'),
    replace = require('gulp-replace');


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

//сжатие PNG изображений
gulp.task('compressImg:dev', function () {

    return gulp.src('src/static/img/**/*.{png,jpg,jpeg}')
        .pipe(gulp.dest('build/img'));

});

gulp.task('compressImg:build', function () {

    return gulp.src('src/static/img/**/*.{png,jpg,jpeg}')
        .pipe(tinypng({
            key: 'VXwdMlXrzKG0GdtrM7Z2s4RcsqKjK0zp',
            sigFile: 'build/img/.tinypng-sigs',
            log: true
        }))
        .pipe(gulp.dest('build/img'));

});

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
    gulp.watch('src/static/img/**/*', gulp.series('compressImg:dev'));
    gulp.watch('src/static/img/svg/*.svg', gulp.series('svg'));
});


//дефолт-таск
gulp.task('default', gulp.series(
    gulp.parallel('pug', 'sass', 'js', 'compressImg:dev', 'svg'),
    gulp.parallel('watch', 'serve')
));

//билд-таск
gulp.task('build', gulp.series(
    gulp.parallel('pug', 'sass', 'js', 'compressImg:build', 'svg'),
    gulp.parallel('watch', 'serve')
));