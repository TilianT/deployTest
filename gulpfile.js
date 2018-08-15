"use strict";

var	gulp 					= require('gulp'),              // Сам gulp
    cssnano				= require('gulp-cssnano'),      // Минификатор
		autoprefixer	= require('gulp-autoprefixer'), // Префиксер
		sass 					= require('gulp-sass'),         // Scss компилятор
		rigger 				= require('gulp-rigger'),       // Для конкатенации html файлов
    concat				= require('gulp-concat'),       // Для конкатенации js файлов
		imagemin			= require('gulp-imagemin'),     // Сжатие изображений
		pngquant			= require('imagemin-pngquant'), // Сжатие png
		notify				= require('gulp-notify'),       // Уведомления об ошибках
		uglify				= require('gulp-uglifyjs'),     // Минификатор для js
		rename				= require('gulp-rename'),       // Переименование файлов
		del						= require('del'),               // Удаление файлов и директорий
		browserSync 	= require('browser-sync'),      // Локальный сервер
    plumber = require('gulp-plumber'),            // Отлавливает исключения, но не прерывает выполнение gulp
    fs   = require('fs');                         // Файловая система node.js
    
	// ПУТИ
	var path = {
    base: './build',       // Папка продакшена
    dev: './src',       // Папка разработки
		src  : {                            // Путь файлов разработки
			html : './src/*.html',         // html
			scss : './src/scss/main.scss', // scss
			js   : './src/js/**.js',            // js
      img  : './src/img/**/*.*',     // img
      libs : './src/libs/**.*',      // Библиотеки
			fonts: './src/fonts/**.*'      // Шрифты
		},
		build  : {                           // Путь файлов продакшена
			html : './build/',                // html
      css  : './build/css/',            // css
			js   : './build/js/',             // js
			img  : './build/img/',            // img
			fonts: './build/fonts/',          // Шрифты
			libs: './build/libs/'             // Библиотеки
		},
  };
  
  // Инициализация проекта
  gulp.task('project-create', function() {

    return () => {
      var folders = [
        path.dev,
        path.dev+'/templates',
        path.dev+'/scss',
        path.dev+'/img',
        path.dev+'/scss/templates',
        path.dev+'/js',
        path.dev+'/js/templates',
        path.dev+'/libs',
        path.dev+'/fonts',
      ];

      folders.forEach(dir => {
        if(!fs.existsSync(dir))     
            fs.mkdirSync(dir);   
      });

      fs.appendFile(path.dev+'/index.html',
                    `<html>
                      <head>
                        <title></title>
                        <meta charset="utf-8">
                      </head>
                      <body></body>
                    </html>`);
      fs.appendFile(path.dev+'/scss/main.scss');
      fs.appendFile(path.dev+'/js/main.js');

    }
    
  });

  // HTML
  gulp.task('html', function() {
    return gulp.src(path.src.html)
    .pipe(rigger())
    .pipe(gulp.dest(path.build.html))
    .pipe(plumber())
    .pipe(browserSync.reload({stream: true}));
  });

  // СТИЛИ
  gulp.task('sass', function() {
    return gulp.src(path.src.scss)
    .pipe(sass({outputStyle: 'expanded'})
      .on('error', notify.onError({
        message: "<%= error.message %>",
        title  : "Sass ERROR!"
      })))
    .pipe(rename({suffix: '.min', prefix : ''}))
    .pipe(autoprefixer(['last 15 versions']))
    .pipe(cssnano())
    .pipe(gulp.dest(path.build.css))
    .pipe(plumber())
    .pipe(browserSync.reload({stream: true}));
  });

  // СКРИПТЫ
  gulp.task('js', function() {
    return gulp.src(path.src.js)
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(path.build.js))
    .pipe(plumber())
    .pipe(browserSync.reload({stream: true}));
  });

  // ИЗОБРАЖЕНИЯ
  gulp.task('img', function() {
    return gulp.src(path.src.img)
    // .pipe(cache(imagemin())) // Cache Images
    .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
          }))
    .pipe(plumber())
    .pipe(gulp.dest(path.build.img));
  });

  // ШРИФТЫ
  gulp.task('fonts', function() {
    return gulp.src(path.src.fonts)
    .pipe(gulp.dest(path.build.fonts));
  });

  // БИБЛИОТЕКИ	
  gulp.task('libs', function() {
    return gulp.src(path.src.libs)
    .pipe(gulp.dest(path.build.libs));
  });

  // СЕРВЕР
  gulp.task('browser-sync', function() {
    browserSync({
      server: {
        baseDir: path.base
      },
      notify: false
    });
  });		

  // WATCH - отслеживание изменений + сервер
  gulp.task('watch', ['img', 'sass', 'html', 'js', 'fonts', 'libs', 'browser-sync'], function() {
    gulp.watch('src/img/**/*.*', ['img']);
    gulp.watch('src/scss/**/*.scss', ['sass']);
    gulp.watch('src/js/**/*.js', ['js']);
    gulp.watch('src/**/*.html', ['html']);
    gulp.watch('src/fonts/**/*.*', ['fonts']);
    gulp.watch('src/lib/**/*.*', ['libs']);
  });

  // Очистка папки на продакшен
  gulp.task('removedist', function() { return del.sync(path.base); });

  // По-дефолту запускается watch
  gulp.task('default', ['watch']);

  // BUIDL - очищается папкп 'build' и создаётся новая сборка
  gulp.task('build', ['removedist', 'html', 'sass', 'js', 'img', 'fonts', 'libs']);
