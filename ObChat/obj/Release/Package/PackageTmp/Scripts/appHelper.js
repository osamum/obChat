/**
 * document.getElementById の短縮関数
 * @param {string} id エレメントの id
 */
let $id = (id) => { return document.getElementById(id); };


class appHelper {
    static getCrrentDatetime() {
        let dt = new Date();
        return dt.getFullYear() + '/' + (dt.getMonth() + 1) + '/' + dt.getDay() + " "
            + dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds();
    }

    static uuid() {
        let uuid = '', i, random;
        for (i = 0; i < 32; i++) {
            random = Math.random() * 16 | 0;
            if (i === 8 || i === 12 || i === 16 || i === 20) {
                uuid += '-';
            }
            uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
        }
        return uuid;
    }
}


class uploadPicture {
    /**
     * uploadPicture クラスのコンストラクタ
     * @param {HTMLElement} fileCtrl input type='file' のエレメント
     * @param {HTMLElement} canvas canvas
     * @param {number} picSize 画像のサイズ
     */
    constructor(fileCtrl, canvas, picSize) {
        this.ctx = canvas.getContext('2d');
        this.canvas = canvas;
        this.image = new Image();
        this.fr = new FileReader();
        this.imageData = '';
        fileCtrl.addEventListener('change', () => {
            // 選択ファイルの有無をチェック
            if (fileCtrl.files.length === 0) return;
            // Formからファイルを取得
            let file = fileCtrl.files[0];
            if (!file.type.match(/^image\/(png|jpeg|gif)$/)) return;
            let ctx = this.ctx,
                image = this.image,
                canvas = this.canvas;
            this.fr.readAsDataURL(file);
            this.fr.onload = (evt) => {
                image.onload = () => {
                    canvas.style.display = 'block';
                    if (this.image.width > picSize) {
                        let dstWidth = picSize;
                        let dstHeight = picSize / image.width * image.height;
                        canvas.width = dstWidth;
                        canvas.height = dstHeight;
                        ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, dstWidth, dstHeight);
                    } else {
                        canvas.width = image.width;
                        canvas.height = image.height;
                        ctx.drawImage(image, 0, 0);
                    }
                    this.imageData = canvas.toDataURL();
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
    clearPcture(afterWidth, afterHeight) {
        let ctx = this.ctx,
            canvas = this.canvas;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (afterWidth !== null) { canvas.width = afterWidth; }
        if (afterHeight !== null) { canvas.height = afterHeight; }
    }
}