class ObChat {
    /**
     * アプリケーションクラスの初期化メソッド
     * @return {object} 自クラスのインスタンス
     */
    static init() {
        this.threadArray = [];
        this.accInfo = { 'name': '', 'id': '',img:'' };
        this.ctrl = {
            fileUpload : $id('imgfile'),
            sendButton: $id('sendmessage'),
            canvas: $id('imgCanvas'),
            textArea: $id('message'),
            statusMsg: $id('status'),
            userImageList: $id('userImgList'),
            container: $id('container')
        };

        this.DATA_TYPE = {
            LOGON: 'logon',
            LOGOFF: 'logoff',
            RECEVE_USER_ACCOUNT: 'resAcc',
            MESSAGE: 'msg',
            EVALUATE : 'eval'
        };
        this.chat = $.connection.ecohHub;
        //image 関連
        this.imageData = '';
        return this;
    }

    /**
    * メインの投稿フォームのコントロールのイベントハンドラをセット
    * @return {object} 自クラスのインスタンス
    */
    static setHandlers() {
        //メッセージ送信時のイベントハンドラー
        this.chat.client.broadcastMessage = function (message) {
            if (ObChat.accInfo.id !== '') {
                let messageInfo = JSON.parse(message);
                ObChat.routingJob(messageInfo);
            }
        };
        //コネクション確率時のイベントハンドラー
        $.connection.hub.start().done(function () {
            //投稿ボタンクリック時のイベントハンドラー
            ObChat.ctrl.sendButton.addEventListener('click', () => {
                let content = ObChat.ctrl.textArea.value;
                if (content !== '' || ObChat.uploadPictureObj.imageData) {
                    let threadId = appHelper.uuid().substr(0, 8),
                        newThread = {
                            'threadId': threadId,
                            'userName': ObChat.accInfo.name,
                            'userId': ObChat.accInfo.id,
                            'profImg': ObChat.accInfo.img,
                            'content': content,
                            'imgData': ObChat.uploadPictureObj.imageData,
                            'type': ObChat.DATA_TYPE.MESSAGE
                        };

                    let jsonString = JSON.stringify(newThread);
                    ObChat.post(jsonString);
                }
                ObChat.uploadPictureObj.clearPcture(null, 0);
                ObChat.uploadPictureObj.imageData = '';
                ObChat.ctrl.textArea.value = '';
            });

            let loginInfo = {
                name: ObChat.accInfo.name,
                id: ObChat.accInfo.id,
                img: ObChat.accInfo.img,
                'type': ObChat.DATA_TYPE.LOGON
            };
            let jsonString = JSON.stringify(loginInfo);
            ObChat.post(jsonString);
            ObChat.ctrl.textArea.focus();
        });
        this.uploadPictureObj = new uploadPicture(this.ctrl.fileUpload, this.ctrl.canvas,400);
        return this;
    }

    /**
     * 記事を投稿する
     * @param {string} jsonString 送信する記事データ
     */
    static post(jsonString) {
        try {
            ObChat.chat.server.send(jsonString);
        } catch (exp){
            ObChat.ctrl.statusMsg.innerText = 'メッセージを送信できませんでした。ページをリフレッシュしてみてください。';
        }
    }


    /**
    * ステータスバーの内容のリセット 
    */
    static resetStatudBar() {
        setTimeout(() => {
            ObChat.ctrl.statusMsg.innerText = '';
            ObChat.ctrl.statusMsg.className = '.status-notice-normal';
        }, 3000);
    }

    /**
     * 現在のユーザー情報をセットする(認証メソッドから呼ばれる)
     * setAccInfo
     * @param {string} accountName ユーザー名
     * @param {string} accountId ユーザー ID
     * @param {string} profilePic プロファイル画像
     *
     */
    static setAccInfo(accountName, accountId, profilePic) {
        ObChat.accInfo.name = accountName;
        ObChat.accInfo.id = accountId;
        ObChat.accInfo.img = profilePic;
        //let fbLinks = mkSNSLink(accountId);
        let ctrl = $id('profilePic');
        ctrl.src = profilePic; //fbLinks.imgUrl;
        ctrl.title = accountName;
        ObChat.ctrl.fileUpload.disabled = false;
        ObChat.ctrl.sendButton.disabled = false;
        ObChat.ctrl.textArea.disabled = false;
        ObChat.resetStatudBar();
        $id('userImgListArea').style.display = 'block';
        $id('inputBox').style.display = 'block';
        ObChat.ctrl.statusMsg.className = 'status-notice-normal';
        ObChat.ctrl.statusMsg.innerText = `${accountName} さん、ようこそ。`
        ObChat.setHandlers();
    }

    /**
     * ユーザーログオフを通知する
     * notifyLogoff
     */
    static notifyLogoff() {
        if ((ObChat.accInfo.id === null) || (ObChat.accInfo.id === '')) return;
            let logoffInfo = {
                name: ObChat.accInfo.name,
                id: ObChat.accInfo.id,
                'type': ObChat.DATA_TYPE.LOGOFF
            };
            let jsonString = JSON.stringify(logoffInfo);
            ObChat.post(jsonString);
        
    }

    /**
    * 他のユーザーのログインを通知する
    * notifyLoginOtherUser
    * @param {Object} accInfo アカウント情報
    */
    static notifyLoginOtherUser(accInfo) {
        let msg = `${accInfo.name} さんが ObChat にログインしました。`;
        //let fbLink = mkSNSLink(accInfo.id);
        ObChat.ctrl.statusMsg.innerText = msg;
        ObChat.ctrl.statusMsg.className = 'status-notice-login';
        ObChat.resetStatudBar();
    }

    /**
     * 新しくユーザーがログインした際に存在を返す
     */
    static responseAccountInfo() {
        let accInfo = this.accInfo;
        accInfo.type = ObChat.DATA_TYPE.RECEVE_USER_ACCOUNT;
        let jsonString = JSON.stringify(accInfo);
        ObChat.post(jsonString);
    }

    /**
     * ログインしたユーザーのアイコンを追加する
     * @param {object} receveAccInfo アカウント情報
     */
    static addUserImage(
        /**@type{{name:string, id:string; profImg: string}}*/
        receveAccInfo) {
        //let fbLink = mkSNSLink(receveAccInfo.id),
            let userPicId = 'img' + receveAccInfo.id;
        if ($id(userPicId)) return;
        let userImageInfo = {
            'userId': userPicId,
            'userName': receveAccInfo.name,
            'imgUrl': receveAccInfo.img,  //fbLink.imgUrl,
            'fbUrl': '@'
        };
        DOMTemplate.bindTemplate(ObChat.ctrl.userImageList, userImageInfo, DOMTemplate.oderBy.ASC);
    }

   
    /**
     * ログインユーザーのアイコンリストをリセットする
     */
    static resetUserImageList() {
        let imageList = this.ctrl.userImageList;
        if (imageList.childNodes.length) { 
            let child;
            while (child = imageList.lastChild) imageList.removeChild(child);
        }
    }

    /**
     * ユーザーのアイコンをリストから削除する
     * @param {object} receveAccInfo ログオフしてたユーザーのアカウント情報
     */
    static removeUserImage(
        /** @type {{id: string, name: string}} */
        receveAccInfo) {
        let msg = `${receveAccInfo.name} さんが退出しました。`;
        let elm = $id('img' + receveAccInfo.id);
        ObChat.ctrl.userImageList.removeChild(elm);
        ObChat.ctrl.statusMsg.innerText = msg;
    }

    /**
     * メッセージの内容のよって処理を振り分ける
     * @param {object} messageInfo 受信したメッセージ
     */
    static routingJob(messageInfo) {
        //ログオンの通知
        if (messageInfo.type === ObChat.DATA_TYPE.LOGON) {
            if (messageInfo.name !== ObChat.accInfo.name) {
                ObChat.notifyLoginOtherUser(messageInfo);
                this.responseAccountInfo();
                this.resetUserImageList();
            }
            this.addUserImage(messageInfo);
            return;
        //ログオフの通知
        } else if (messageInfo.type === ObChat.DATA_TYPE.LOGOFF) {
            this.removeUserImage(messageInfo);
            return;
        } else if (messageInfo.type === ObChat.DATA_TYPE.RECEVE_USER_ACCOUNT) {
            this.addUserImage(messageInfo);
            return;
        }
        let threadElem = this.whichThread(messageInfo.threadId);
        if (threadElem) {
            if (messageInfo.type === ObChat.DATA_TYPE.MESSAGE) {
                threadElem.appendReply(messageInfo);
            } else if (messageInfo.type === ObChat.DATA_TYPE.EVALUATE) {
                let evalCount = threadElem[messageInfo.evalType] + 1;
                threadElem[messageInfo.evalType] = evalCount;
                $id(messageInfo.threadId + messageInfo.evalType).innerText = evalCount;
            }
        } else {
            let contentThread = new ContentThread(messageInfo, this.ctrl.container);
            this.threadArray.push(contentThread);
        }
    }


    /**
     * 引数に指定された Id の投稿すみ記事のオブジェクトを返す
     * @param {string} threadId 記事の Id
     * @return{object | null} 記事(スレッド)クラスのインスタンス
     */
    static whichThread(threadId) {
        let length = this.threadArray.length;
        for (var i = 0; i < length; i++) {
            let thread = this.threadArray[i];
            if (threadId === thread.id) {
                return thread;
            }
        }
        return null;
    }

    /**
     * 送信するいいね! ボタンなどの評価データを送信する
     * @param {string} threadId 記事の Id
     * @param {string} evalType 評価
     */
    static evalContent(threadId, evalType) {
        let newEvaluate = {
            'threadId': threadId,
            'evalType': evalType,
            'type': ObChat.DATA_TYPE.EVALUATE
        };
        ObChat.post(JSON.stringify(newEvaluate));
    }

    /**
     * 指定された id の記事の DOM を先頭に移動させる
     * @param {string} threadId 記事の Id
     */
    static moveTop(threadId) {
        let thread = $id(threadId),
            parent = thread.parentNode;
        if (thread.id !== parent.firstChild.id){
            parent.insertBefore(thread, parent.firstChild);
        }
    }
}


/**
* 記事のスレッドのクラス
*/
class ContentThread {
    /**
    * 記事のスレッドのクラスのコンストラクタ
    * @constructor
    * @param {object} messageInfo メッセージデータ
    * @param {HTMLElement} parent 親エレメント
    */
    constructor(
        /** @type {{userId: string, userName: string, profImg:string, 
            content: string, imgData: string, type: string}} */
        messageInfo,parent) {
        const EVAL = {
            LIKE: 'like',
            LOVE: 'love',
            FANNY: 'fanny',
            SAD: 'sad'
        };
        let threadId = messageInfo.threadId,
            textId = threadId + '_text',
            replysId = threadId + '_replys',
            likeId = threadId + EVAL.LIKE,
            loveId = threadId + EVAL.LOVE,
            fannyId = threadId + EVAL.FANNY,
            sadId = threadId + EVAL.SAD,
            reFileId = threadId + '_reFile',
            reCanvasId = threadId + '_reCnvs';
        //let fbLinks = mkSNSLink(messageInfo.userId);
        //let fbLinksLoginUser = mkSNSLink(ObChat.accInfo.id);
        messageInfo.replysId = replysId;
        messageInfo.atclId = threadId + '_atcl';
        messageInfo.textId = textId;
        messageInfo.fbUrl = '@';
        messageInfo.imgUrl = messageInfo.profImg;
        messageInfo.dateTime = appHelper.getCrrentDatetime();
        messageInfo.currentUserName = ObChat.accInfo.name;
        messageInfo.currentImgUrl = ObChat.accInfo.img;  //fbLinksLoginUser.imgUrl;
        messageInfo.likeId = likeId;
        messageInfo.loveId = loveId;
        messageInfo.fannyId = fannyId;
        messageInfo.sadId = sadId;

        messageInfo.reFileId = reFileId;
        messageInfo.reCnvsId = reCanvasId;

        messageInfo.likeClick = `javascript:ObChat.evalContent('${threadId}','${EVAL.LIKE}')`;
        messageInfo.loveClick = `javascript:ObChat.evalContent('${threadId}','${EVAL.LOVE}')`;
        messageInfo.fannyClick = `javascript:ObChat.evalContent('${threadId}','${EVAL.FANNY}')`;
        messageInfo.sadClick = `javascript:ObChat.evalContent('${threadId}','${EVAL.SAD}')`;

        //データをバインドする
        DOMTemplate.bindTemplate(parent, messageInfo, DOMTemplate.oderBy.DESC);

        let replyTextBox = $id(textId),
            commentList = $id(replysId),
            uploadPictureObj = new uploadPicture($id(reFileId), $id(reCanvasId), 300);
        //返信する
            replyTextBox.addEventListener('change', ((currentText, currentList, uploadPictureObj) => {
            return () => {
                let threadId = currentText.id.substr(0, 8);
                let newComment = {
                    'threadId': threadId,
                    'commentId': threadId + '_' + currentList.childNodes.length + '_reply',
                    'userName': ObChat.accInfo.name,
                    'userId': ObChat.accInfo.id,
                    'profImg': ObChat.accInfo.img,
                    'content': currentText.value,
                    'type': ObChat.DATA_TYPE.MESSAGE,
                    'imgData': uploadPictureObj.imageData
                };
                uploadPictureObj.clearPcture(null, 0);
                uploadPictureObj.imageData = '';
                ObChat.post(JSON.stringify(newComment));
                currentText.value = '';
            };
        })(replyTextBox, commentList, uploadPictureObj));

        this.__commentList = commentList;
        this.id = threadId;
        this.like = 0;
        this.love = 0;
        this.fanny = 0;
        this.sad = 0;
    }

    /**
    * 記事のスレッドに返信を追加
    * @appendReply
    * @param {object} messageInfo メッセージデータ
     */
    appendReply(
        /** @type {{contentId: string, content: string, 
            fbUrl: string, imgUrl: string, dateTime: string, userId: string,
            userName: string, content: string, imgData: string, type: string}} */
        messageInfo) {
        //let fbLinks = mkSNSLink(messageInfo.userId),
            let commentList = this.__commentList;
            messageInfo.fbUrl = '@'; //fbLinks.fbUrl;
            messageInfo.imgUrl = messageInfo.profImg; //fbLinks.imgUrl;
        messageInfo.dateTime = appHelper.getCrrentDatetime();
        //データをバインドする
        DOMTemplate.bindTemplate(commentList, messageInfo);
        if (ObChat.accInfo.name !== messageInfo.userName) {
            ObChat.ctrl.statusMsg.innerText = `${messageInfo.userName} さんがあなたの投稿にコメントしました。`;
            ObChat.ctrl.statusMsg.className = 'status-notice-reply';
            ObChat.ctrl.statusMsg.addEventListener('click', (function (threadId) {
                return function f() {
                    ObChat.moveTop(threadId);
                    ObChat.ctrl.statusMsg.className = 'status-notice-normal';
                    ObChat.ctrl.statusMsg.innerText = '';
                    ObChat.ctrl.statusMsg.removeEventListener('click', f, false);
                };
            })(this.id), false);
        }
    }

}

/**
 * 匿名ログインで使用するためのクラス (Facebook 認証などど組み合わせる際は必要なし)
 */
class loginBox {
     static init(callBack) {

         let profPicM = [
             { imgUrl: this.setPath('icon_124990_48.png'), onclick: 'loginBox.handler(event)' },
             { imgUrl: this.setPath('icon_113190_48.png'), onclick: 'loginBox.handler(event)' },
             { imgUrl: this.setPath('icon_113260_48.png'), onclick: 'loginBox.handler(event)' },
             { imgUrl: this.setPath('icon_113250_48.png'), onclick: 'loginBox.handler(event)' },
             { imgUrl: this.setPath('icon_113270_48.png'), onclick: 'loginBox.handler(event)' },
             { imgUrl: this.setPath('icon_124540_48.png'), onclick: 'loginBox.handler(event)' },
             { imgUrl: this.setPath('icon_124530_48.png'), onclick: 'loginBox.handler(event)' },
        ];

        let profPicW = [
            { imgUrl: this.setPath('icon_124720_48.png'), onclick: 'loginBox.handler(event)' },
            { imgUrl: this.setPath('icon_124660_48.png'), onclick: 'loginBox.handler(event)' },
            { imgUrl: this.setPath('icon_124710_48.png'), onclick: 'loginBox.handler(event)' },
            { imgUrl: this.setPath('icon_113210_48.png'), onclick: 'loginBox.handler(event)' },
            { imgUrl: this.setPath('icon_135050_48.png'), onclick: 'loginBox.handler(event)' },
            { imgUrl: this.setPath('icon_118030_48.png'), onclick: 'loginBox.handler(event)' },
            { imgUrl: this.setPath('icon_124800_48.png'), onclick: 'loginBox.handler(event)' }
        ];

        let profPicListM = $id('profPicMan');
        DOMTemplate.bindTemplate(profPicListM, profPicM);
        let profPicListW = $id('profPicWoman');
        DOMTemplate.bindTemplate(profPicListW, profPicW);

        this.ctrl = {};
        this.ctrl.loginBox = $id('loginUI');
        this.ctrl.nameBox = $id('nameBox');
        this.ctrl.loginButton = $id('loginButton');
        this.ctrl.loginButton.addEventListener('click', () => {
            if (this.ctrl.nameBox.value) {
                if (this.prvImg) {
                    this.ctrl.loginBox.style.display = 'none';
                    $id('inputBox').style.display = 'block';
                    ObChat.init().setAccInfo(this.ctrl.nameBox.value, `${appHelper.uuid()}`, this.prvImg.src);
                } else {
                    alert('使用するアイコンを選択してください。');
                }
            } else {
                this.ctrl.nameBox.value = 'ここにお名前を入力してくださいましね。';
                this.ctrl.nameBox.className = 'alert_RedFrame';
                this.ctrl.nameBox.addEventListener('click', () => {
                    this.ctrl.nameBox.select(0, this.ctrl.nameBox.value.length);
                });
            }
        });
        setTimeout(() => {
            this.ctrl.nameBox.focus();
        }, 1000);
        
    }

    static setPath(fileName) {
        return `http://assets-images.azurewebsites.net/${fileName}`;
    }

    static handler(event) {
        if (this.prvImg) {
            this.prvImg.className = 'prof-nomal_img';
        }
        let img = event.target;
        img.className = 'prof-selected_img';
        this.prvImg = img;
    }

}

//アプリケーションのエントリーポイント
window.onload = () => {
    loginBox.init();
};

window.onbeforeunload = (e) => {
    //e.returnValue = "ObChat を閉じますか？\n表示されているデータは失われ、もう二度と戻ることはありません。";
    ObChat.notifyLogoff();
};
