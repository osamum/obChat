/**
* document.getElementById の短縮関数
* @param {string} id エレメントの id
*/
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var $id = function $id(id) {
    return document.getElementById(id);
};

var appHelper = (function () {
    function appHelper() {
        _classCallCheck(this, appHelper);
    }

    _createClass(appHelper, null, [{
        key: 'getCrrentDatetime',
        value: function getCrrentDatetime() {
            var dt = new Date();
            return dt.getFullYear() + '/' + (dt.getMonth() + 1) + '/' + dt.getDay() + " " + dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds();
        }
    }, {
        key: 'uuid',
        value: function uuid() {
            var uuid = '',
                i = undefined,
                random = undefined;
            for (i = 0; i < 32; i++) {
                random = Math.random() * 16 | 0;
                if (i === 8 || i === 12 || i === 16 || i === 20) {
                    uuid += '-';
                }
                uuid += (i === 12 ? 4 : i === 16 ? random & 3 | 8 : random).toString(16);
            }
            return uuid;
        }
    }]);

    return appHelper;
})();

var uploadPicture = (function () {
    /**
     * uploadPicture クラスのコンストラクタ
     * @param {HTMLElement} fileCtrl input type='file' のエレメント
     * @param {HTMLElement} canvas canvas
     */

    function uploadPicture(fileCtrl, canvas) {
        var _this = this;

        _classCallCheck(this, uploadPicture);

        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.image = new Image();
        this.fr = new FileReader();
        this.imageData = '';
        fileCtrl.addEventListener('change', function () {
            // 選択ファイルの有無をチェック
            if (fileCtrl.files.length === 0) return;
            // Formからファイルを取得
            var file = fileCtrl.files[0];
            if (!file.type.match(/^image\/(png|jpeg|gif)$/)) return;
            var ctx = _this.ctx,
                image = _this.image,
                canvas = _this.canvas;
            _this.fr.readAsDataURL(file);
            _this.fr.onload = function (evt) {
                image.onload = function () {
                    if (_this.image.width > 400) {
                        var dstWidth = 400;
                        var dstHeight = 400 / image.width * image.height;
                        canvas.width = dstWidth;
                        canvas.height = dstHeight;
                        ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, dstWidth, dstHeight);
                    } else {
                        canvas.width = image.width;
                        canvas.height = image.height;
                        ctx.drawImage(image, 0, 0);
                    }
                    _this.imageData = canvas.toDataURL();
                };
                // 読み込んだ画像をimageのソースに設定
                image.src = evt.target.result;
            };
            fileCtrl.value = '';
        });
    }

    /**
     * uploadPicture クラスが使用した Canvas の指定範囲をクリアする
     * @param {number} afterWidth 消去する範囲の幅
     * @param {number} afterHeight 消去する範囲の高さ
     */

    _createClass(uploadPicture, [{
        key: 'clearPcture',
        value: function clearPcture(afterWidth, afterHeight) {
            var ctx = this.ctx,
                canvas = this.canvas;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (afterWidth !== null) {
                canvas.width = afterWidth;
            }
            if (afterHeight !== null) {
                canvas.height = afterHeight;
            }
        }
    }]);

    return uploadPicture;
})();

