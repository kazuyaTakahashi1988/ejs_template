/* eslint-disable no-console */
/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
/* eslint-disable linebreak-style */

/* --------------------------------
  ★ node.js v10.x ★
  [ npm i ] → [ npx gulp ] or [ npm start ]

  コードフォーマッターとしてVS codeのプラグイン：EJS Beautify
  を入れて作業することをお勧めします。
-------------------------------- */

/*--------------------------------------------------*/
/* 必須
/*--------------------------------------------------*/
const gulp = require("gulp");
// Sassのコンパイル
const ejs = require("gulp-ejs");
// ejs のコンパイル
const sass = require("gulp-sass");
const htmlbeautify = require("gulp-html-beautify");
// Watchを中断させない
const plumber = require("gulp-plumber");
// デスクトップにエラー通知
const notify = require("gulp-notify");
// ソースマップ
const sourcemaps = require("gulp-sourcemaps");
// autoprefixer
const autoprefixer = require("gulp-autoprefixer");

// js圧縮 / バベル / リネーム
const uglify = require("gulp-uglify");
const babel = require("gulp-babel");
const rename = require("gulp-rename");

/*--------------------------------------------------*/
/* 必要あれば
/*--------------------------------------------------*/
// cssの見た目を整える
const csscomb = require("gulp-csscomb");
// csv→json
const csv2json = require("gulp-csv2json");
// ブラウザの自動リロード
const browserSync = require("browser-sync");

const path = ""; // Vホスト名（例：'http://01_test' or '01_test' ...etc）


/*-------------------------*/
/* sass
/*-------------------------*/
gulp.task("sass", () => {
    console.log("--------- sass task ----------");
    return gulp.
        src("assets/scss/*.scss").
        pipe(plumber({"errorHandler": notify.onError("Error: <%= error.message %>")})). // error message
        pipe(sourcemaps.init()).
        pipe(sass()).
        pipe(sass({"outputStyle": "expanded"})).
        pipe(autoprefixer({
            // browsers: ['last 2 version', 'iOS >= 8.1', 'Android >= 4.4'],
            "cascade": false,
            "grid": true
        })).
        pipe(sourcemaps.write("maps/")).
        pipe(gulp.dest("assets/css"));
});

/*-------------------------*/
/* js
/*-------------------------*/
gulp.task("js", () => {
    return gulp.
        src(["assets/js/*.js", "!js/min/*.js"]).
        pipe(babel({"presets": ["@babel/env"]})).
        pipe(uglify()).
        pipe(rename({"suffix": ".min"})).
        pipe(gulp.dest("assets/js/min/"));
});

/*-------------------------*/
/* ejs
/*-------------------------*/
gulp.task("ejs-compile", () => {
    return gulp.
        src(["./**/*.ejs", "!./**/_*.ejs"]).
        pipe(plumber({"errorHandler": notify.onError("Error: <%= error.message %>")})). // エラーチェック
        pipe(ejs()).
        pipe(htmlbeautify({
            "indent_size": 2, // インデントサイズ
            "indent_char": " ", // インデントに使う文字列はスペース1こ
            "max_preserve_newlines": 0, // 許容する連続改行数
            "preserve_newlines": false, // コンパイル前のコードの改行
            "indent_inner_html": false, // head,bodyをインデント
            "extra_liners": [], // 終了タグの前に改行を入れるタグ。配列で指定。head,body,htmlにはデフォで改行を入れたくない場合は[]。
        })).
        pipe(rename({"extname": ".html"})).
        pipe(gulp.dest("./")); // 出力先
});

/*-------------------------*/
/* styles
/*-------------------------*/
gulp.task("styles", () => {
    return gulp.
        src(["assets/css/*.css", "!assets/css/reset.css"]).
        pipe(csscomb()).
        pipe(gulp.dest("assets/css/style"));
});

/*-------------------------*/
/* csv→json
/*-------------------------*/
gulp.task("convertcsvtojson", () => {
    const csvParseOptions = {};
    return gulp.
        src("./json/**/*.csv").
        pipe(csv2json(csvParseOptions)).
        pipe(rename({"extname": ".json"})).
        pipe(gulp.dest("./json"));
});

/*-------------------------*/
/* browser-sync
/*-------------------------*/
gulp.task("browser-sync", () => {
    browserSync({"proxy": path});
});
gulp.task("bs-reload", (done) => {
    browserSync.reload();
    done();
});

/*--------------------------------------------------*/
/* Watch
/*--------------------------------------------------*/
gulp.task("watch", () => {
    console.log("--------- watch task ----------");
    // sass
    gulp.watch(["assets/scss/*.scss"], gulp.task("sass"));
    // js圧縮 / バベル / リネーム
    gulp.watch("assets/js/*.js", gulp.task("js"));
    // ejs
    gulp.watch("./**/*.ejs", gulp.task("ejs-compile"));

    // sass / js / その他ファイル群 (自動リロード用)
    // gulp.watch('assets/js/*.js', gulp.series(gulp.parallel('bs-reload', 'js')));
    // gulp.watch('assets/scss/*.scss', gulp.series(gulp.parallel('bs-reload', 'sass')));
    // gulp.watch(['./**/*.ejs', '!./**/_*.ejs'], gulp.series(gulp.parallel('bs-reload', 'ejs-compile')));
    // gulp.watch('**/*.+(html|php|css|ico|htaccess|txt|xml|otf|ttf|woff|woff2|eot)', gulp.series(gulp.parallel('bs-reload')));
});

/*--------------------------------------------------*/
/* 起動時 デフォルトで実行
/*--------------------------------------------------*/
gulp.task("default", gulp.series(gulp.parallel(
    "watch",
    "sass",
    "js",
    "ejs-compile",
    // 'browser-sync',
)));
