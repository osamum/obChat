class Nicebook {
    /**
     * アプリケーションクラスの初期化メソッド
     * @return {object} 自クラスのインスタンス
     */
    static init() {
        this.threadArray = [];
        this.accInfo = { 'name': '', 'id': '' };
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
            if (Nicebook.accInfo.id !== '') {
                let messageInfo = JSON.parse(message);
                Nicebook.routingJob(messageInfo);
            }
        };
        //コネクション確率時のイベントハンドラー
        $.connection.hub.start().done(function () {
            //投稿ボタンクリック時のイベントハンドラー
            Nicebook.ctrl.sendButton.addEventListener('click', () => {
                let content = Nicebook.ctrl.textArea.value;
                if (content !== '' || Nicebook.uploadPictureObj.imageData) {
                    let threadId = appHelper.uuid().substr(0, 8),
                        newThread = {
                            'threadId': threadId,
                            'userName': Nicebook.accInfo.name,
                            'userId': Nicebook.accInfo.id,
                            'content': content,
                            'imgData': Nicebook.uploadPictureObj.imageData,
                            'type': Nicebook.DATA_TYPE.MESSAGE
                        };

                    let jsonString = JSON.stringify(newThread);
                    Nicebook.post(jsonString);
                }
                Nicebook.uploadPictureObj.clearPcture(null, 0);
                Nicebook.uploadPictureObj.imageData = '';
                Nicebook.ctrl.textArea.value = '';
            });

            let loginInfo = {
                name: Nicebook.accInfo.name,
                id: Nicebook.accInfo.id,
                'type': Nicebook.DATA_TYPE.LOGON
            };
            let jsonString = JSON.stringify(loginInfo);
            Nicebook.post(jsonString);
            Nicebook.ctrl.textArea.focus();
        });
        this.uploadPictureObj = new uploadPicture(this.ctrl.fileUpload, this.ctrl.canvas);
        return this;
    }

    /**
     * 記事を投稿する
     * @param {string} jsonString 送信する記事データ
     */
    static post(jsonString) {
        try {
            Nicebook.chat.server.send(jsonString);
        } catch (exp){
            Nicebook.ctrl.statusMsg.innerText = 'メッセージを送信できませんでした。ページをリフレッシュしてみてください。';
        }
    }


    /**
    * ステータスバーの内容のリセット 
    */
    static resetStatudBar() {
        setTimeout(() => {
            Nicebook.ctrl.statusMsg.innerText = '';
            Nicebook.ctrl.statusMsg.className = '.status-notice-normal';
        }, 3000);
    }

    /**
     * 現在のユーザー情報をセットする(認証メソッドから呼ばれる)
     * setAccInfo
     * @param {string} accountName ユーザー名
     * @param {string} accountId ユーザー ID
     *
     */
    static setAccInfo(accountName, accountId) {
        Nicebook.accInfo.name = accountName;
        Nicebook.accInfo.id = accountId;
        let fbLinks = mkFbLink(accountId);
        let ctrl = $id('profilePic');
        ctrl.src = fbLinks.imgUrl;
        ctrl.title = accountName;
        Nicebook.ctrl.fileUpload.disabled = false;
        Nicebook.ctrl.sendButton.disabled = false;
        Nicebook.ctrl.textArea.disabled = false;
        Nicebook.resetStatudBar();
        $id('userImgListArea').style.display = 'block';
        $id('inputBox').style.display = 'block';
        Nicebook.ctrl.statusMsg.className = 'status-notice-normal';
        Nicebook.setHandlers();
    }

    /**
     * ユーザーログオフを通知する
     * notifyLogoff
     */
    static notifyLogoff() {
        if (Nicebook.accInfo.id === '') return;
        let logoffInfo = {
            name: Nicebook.accInfo.name,
            id: Nicebook.accInfo.id,
            'type': Nicebook.DATA_TYPE.LOGOFF
        };
        let jsonString = JSON.stringify(logoffInfo);
        Nicebook.post(jsonString);
    }

    /**
    * 他のユーザーのログインを通知する
    * notifyLoginOtherUser
    * @param {Object} accInfo アカウント情報
    */
    static notifyLoginOtherUser(accInfo) {
        let msg = `${accInfo.name} さんが Nicebook にログインしました。`;
        let fbLink = mkFbLink(accInfo.id);
        Nicebook.ctrl.statusMsg.innerText = msg;
        Nicebook.ctrl.statusMsg.className = 'status-notice-login';
        Nicebook.resetStatudBar();
    }

    /**
     * 新しくユーザーがログインした際に存在を返す
     */
    static responseAccountInfo() {
        let accInfo = this.accInfo;
        accInfo.type = Nicebook.DATA_TYPE.RECEVE_USER_ACCOUNT;
        let jsonString = JSON.stringify(accInfo);
        Nicebook.post(jsonString);
    }

    /**
     * ログインしたユーザーのアイコンを追加する
     * @param {object} receveAccInfo アカウント情報
     */
    static addUserImage(
        /**@type{{name:string, id:string}}*/
        receveAccInfo) {
        let fbLink = mkFbLink(receveAccInfo.id),
            userPicId = 'img' + receveAccInfo.id;
        if ($id(userPicId)) return;
        let userImageInfo = {
            'userId': userPicId,
            'userName': receveAccInfo.name,
            'imgUrl': fbLink.imgUrl,
            'fbUrl': fbLink.fbUrl
        };
        DOMTemplate.bindTemplate(Nicebook.ctrl.userImageList, userImageInfo, DOMTemplate.oderBy.ASC);
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
        Nicebook.ctrl.userImageList.removeChild(elm);
        Nicebook.ctrl.statusMsg.innerText = msg;
    }

    /**
     * メッセージの内容のよって処理を振り分ける
     * @param {object} messageInfo 受信したメッセージ
     */
    static routingJob(messageInfo) {
        //ログオンの通知
        if (messageInfo.type === Nicebook.DATA_TYPE.LOGON) {
            if (messageInfo.name !== Nicebook.accInfo.name) {
                Nicebook.notifyLoginOtherUser(messageInfo);
                this.responseAccountInfo();
                this.resetUserImageList();
            }
            this.addUserImage(messageInfo);
            return;
        //ログオフの通知
        } else if (messageInfo.type === Nicebook.DATA_TYPE.LOGOFF) {
            this.removeUserImage(messageInfo);
            return;
        } else if (messageInfo.type === Nicebook.DATA_TYPE.RECEVE_USER_ACCOUNT) {
            this.addUserImage(messageInfo);
            return;
        }
        let threadElem = this.whichThread(messageInfo.threadId);
        if (threadElem) {
            if (messageInfo.type === Nicebook.DATA_TYPE.MESSAGE) {
                threadElem.appendReply(messageInfo);
            } else if (messageInfo.type === Nicebook.DATA_TYPE.EVALUATE) {
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
            'type': Nicebook.DATA_TYPE.EVALUATE
        };
        Nicebook.post(JSON.stringify(newEvaluate));
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
        /** @type {{userId: string, userName: string, 
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
            sadId = threadId + EVAL.SAD;
        let fbLinks = mkFbLink(messageInfo.userId);
        let fbLinksLoginUser = mkFbLink(Nicebook.accInfo.id);
        messageInfo.replysId = replysId;
        messageInfo.atclId = threadId + '_atcl';
        messageInfo.textId = textId;
        messageInfo.fbUrl = fbLinks.fbUrl;
        messageInfo.imgUrl = fbLinks.imgUrl;
        messageInfo.dateTime = appHelper.getCrrentDatetime();
        messageInfo.currentUserName = Nicebook.accInfo.name;
        messageInfo.currentImgUrl = fbLinksLoginUser.imgUrl;
        messageInfo.likeId = likeId;
        messageInfo.loveId = loveId;
        messageInfo.fannyId = fannyId;
        messageInfo.sadId = sadId;
        messageInfo.likeClick = `javascript:Nicebook.evalContent('${threadId}','${EVAL.LIKE}')`;
        messageInfo.loveClick = `javascript:Nicebook.evalContent('${threadId}','${EVAL.LOVE}')`;
        messageInfo.fannyClick = `javascript:Nicebook.evalContent('${threadId}','${EVAL.FANNY}')`;
        messageInfo.sadClick = `javascript:Nicebook.evalContent('${threadId}','${EVAL.SAD}')`;

        //データをバインドする
        DOMTemplate.bindTemplate(parent, messageInfo, DOMTemplate.oderBy.DESC);

        let replyTextBox = $id(textId),
            commentList = $id(replysId);
        //返信する
        replyTextBox.addEventListener('change', ((currentText,currentList) => {
            return () => {
                let threadId = currentText.id.substr(0, 8);
                let newComment = {
                    'threadId': threadId,
                    'commentId': threadId + '_' + currentList.childNodes.length + '_reply',
                    'userName': Nicebook.accInfo.name,
                    'userId': Nicebook.accInfo.id,
                    'content': currentText.value,
                    'type': Nicebook.DATA_TYPE.MESSAGE
                };
                Nicebook.post(JSON.stringify(newComment));
                currentText.value = '';
            };
        })(replyTextBox, commentList));

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
        let fbLinks = mkFbLink(messageInfo.userId),
            commentList = this.__commentList;
        messageInfo.fbUrl = fbLinks.fbUrl;
        messageInfo.imgUrl = fbLinks.imgUrl;
        messageInfo.dateTime = appHelper.getCrrentDatetime();
        //データをバインドする
        DOMTemplate.bindTemplate(commentList, messageInfo);
        if (Nicebook.accInfo.name !== messageInfo.userName) {
            Nicebook.ctrl.statusMsg.innerText = `${messageInfo.userName} さんがあなたの投稿にコメントしました。`;
            Nicebook.ctrl.statusMsg.className = 'status-notice-reply';
            Nicebook.ctrl.statusMsg.addEventListener('click', (function (threadId) {
                return function f() {
                    Nicebook.moveTop(threadId);
                    Nicebook.ctrl.statusMsg.className = 'status-notice-normal';
                    Nicebook.ctrl.statusMsg.innerText = '';
                    Nicebook.ctrl.statusMsg.removeEventListener('click', f, false);
                };
            })(this.id), false);
        }
    }

}

//アプリケーションのエントリーポイント
window.onload = () => {
    FbConnected.callBack = Nicebook.init().setAccInfo;
    setFbAsncInit();
};

window.onbeforeunload = (e) => {
    //e.returnValue = "Nicebook を閉じますか？\n表示されているデータは失われ、もう二度と戻ることはありません。";
    Nicebook.notifyLogoff();
};
