'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Nicebook = (function () {
    function Nicebook() {
        _classCallCheck(this, Nicebook);
    }

    /**
    * 記事のスレッドのクラス
    */

    _createClass(Nicebook, null, [{
        key: 'init',

        /**
         * アプリケーションクラスの初期化メソッド
         * @return {object} 自クラスのインスタンス
         */
        value: function init() {
            this.threadArray = [];
            this.accInfo = { 'name': '', 'id': '' };
            this.ctrl = {
                fileUpload: $id('imgfile'),
                sendButton: $id('sendmessage'),
                canvas: $id('imgCanvas'),
                textArea: $id('message'),
                statusMsg: $id('status'),
                userImageList: $id('userImgList')
            };

            this.DATA_TYPE = {
                LOGON: 'logon',
                LOGOFF: 'logoff',
                RECEVE_USER_ACCOUNT: 'resAcc',
                MESSAGE: 'msg',
                EVALUATE: 'eval'
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
    }, {
        key: 'setHandlers',
        value: function setHandlers() {
            //メッセージ送信時のイベントハンドラー
            this.chat.client.broadcastMessage = function (message) {
                if (Nicebook.accInfo.id !== '') {
                    var messageInfo = JSON.parse(message);
                    Nicebook.routingJob(messageInfo);
                }
            };
            //コネクション確率時のイベントハンドラー
            $.connection.hub.start().done(function () {
                //投稿ボタンクリック時のイベントハンドラー
                Nicebook.ctrl.sendButton.addEventListener('click', function () {
                    var content = Nicebook.ctrl.textArea.value;
                    if (content !== "" || Nicebook.uploadPictureObj.imageData) {
                        var threadId = appHelper.uuid().substr(0, 8),
                            newThread = {
                            'threadId': threadId,
                            'userName': Nicebook.accInfo.name,
                            'userId': Nicebook.accInfo.id,
                            'content': content,
                            'imgData': Nicebook.uploadPictureObj.imageData,
                            'type': Nicebook.DATA_TYPE.MESSAGE
                        };

                        var _jsonString = JSON.stringify(newThread);
                        Nicebook.post(_jsonString);
                    }
                    Nicebook.uploadPictureObj.clearPcture(null, 0);
                    Nicebook.uploadPictureObj.imageData = '';
                    Nicebook.ctrl.textArea.value = '';
                });

                var loginInfo = {
                    name: Nicebook.accInfo.name,
                    id: Nicebook.accInfo.id,
                    'type': Nicebook.DATA_TYPE.LOGON
                };
                var jsonString = JSON.stringify(loginInfo);
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
    }, {
        key: 'post',
        value: function post(jsonString) {
            try {
                Nicebook.chat.server.send(jsonString);
            } catch (exp) {
                Nicebook.ctrl.statusMsg.innerText = 'メッセージを送信できませんでした。ページをリフレッシュしてみてください。';
            }
        }

        /**
        * ステータスバーの内容のリセット 
        */
    }, {
        key: 'resetStatudBar',
        value: function resetStatudBar() {
            setTimeout(function () {
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
    }, {
        key: 'setAccInfo',
        value: function setAccInfo(accountName, accountId) {
            Nicebook.accInfo.name = accountName;
            Nicebook.accInfo.id = accountId;
            var fbLinks = mkFbLink(accountId);
            var ctrl = $id('profilePic');
            ctrl.src = fbLinks.imgUrl;
            ctrl.title = accountName;
            Nicebook.ctrl.fileUpload.disabled = false;
            Nicebook.ctrl.sendButton.disabled = false;
            Nicebook.ctrl.textArea.disabled = false;
            Nicebook.resetStatudBar();
            $id('userImgListArea').style.display = 'block';

            Nicebook.setHandlers();
        }

        /**
         * ユーザーログオフを通知する
         * notifyLogoff
         */
    }, {
        key: 'notifyLogoff',
        value: function notifyLogoff() {
            if (Nicebook.accInfo.id === '') return;
            var logoffInfo = {
                name: Nicebook.accInfo.name,
                id: Nicebook.accInfo.id,
                'type': Nicebook.DATA_TYPE.LOGOFF
            };
            var jsonString = JSON.stringify(logoffInfo);
            Nicebook.post(jsonString);
        }

        /**
        * 他のユーザーのログインを通知する
        * notifyLoginOtherUser
        * @param {Object} accInfo アカウント情報
        */
    }, {
        key: 'notifyLoginOtherUser',
        value: function notifyLoginOtherUser(accInfo) {
            var msg = accInfo.name + ' さんが Nicebook にログインしました。';
            var fbLink = mkFbLink(accInfo.id);
            Nicebook.ctrl.statusMsg.innerText = msg;
            Nicebook.ctrl.statusMsg.className = 'status-notice-login';
            Nicebook.resetStatudBar();
        }

        /**
         * 新しくユーザーがログインした際に存在を返す
         */
    }, {
        key: 'responseAccountInfo',
        value: function responseAccountInfo() {
            var accInfo = this.accInfo;
            accInfo.type = Nicebook.DATA_TYPE.RECEVE_USER_ACCOUNT;
            var jsonString = JSON.stringify(accInfo);
            Nicebook.post(jsonString);
        }

        //■　ログインしたユーザーのアイコンを追加する
        /**
         * ログインしたユーザーのアイコンを追加する
         * @param {object} receveAccInfo アカウント情報
         */
    }, {
        key: 'addUserImage',
        value: function addUserImage(
        /**@type{{name:string, id:string}}*/
        receveAccInfo) {
            var fbLink = mkFbLink(receveAccInfo.id);
            var userImageInfo = {
                'userId': 'img' + receveAccInfo.id,
                'userName': receveAccInfo.name,
                'imgUrl': fbLink.imgUrl,
                'fbUrl': fbLink.fbUrl
            };
            DOMTemplate.bindTemplate(Nicebook.ctrl.userImageList, userImageInfo, DOMTemplate.oderBy.ASC);
        }

        /**
         * ログインユーザーのアイコンリストをリセットする
         */
    }, {
        key: 'resetUserImageList',
        value: function resetUserImageList() {
            var imageList = this.ctrl.userImageList;
            if (imageList.childNodes.length) {
                var child = undefined;
                while (child = imageList.lastChild) imageList.removeChild(child);
            }
        }

        /**
         * ユーザーのアイコンをリストから削除する
         * @param {object} receveAccInfo ログオフしてたユーザーのアカウント情報
         */
    }, {
        key: 'removeUserImage',
        value: function removeUserImage(
        /** @type {{id: string, name: string}} */
        receveAccInfo) {
            var msg = receveAccInfo.name + ' さんが退出しました。';
            var elm = $id('img' + receveAccInfo.id);
            Nicebook.ctrl.userImageList.removeChild(elm);
            Nicebook.ctrl.statusMsg.innerText = msg;
        }

        /**
         * メッセージの内容のよって処理を振り分ける
         * @param {object} messageInfo
         */
    }, {
        key: 'routingJob',
        value: function routingJob(messageInfo) {
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
            var threadElem = this.whichThread(messageInfo.threadId);
            if (threadElem) {
                if (messageInfo.type === Nicebook.DATA_TYPE.MESSAGE) {
                    threadElem.appendReply(messageInfo);
                } else if (messageInfo.type === Nicebook.DATA_TYPE.EVALUATE) {
                    var evalCount = threadElem[messageInfo.evalType] + 1;
                    threadElem[messageInfo.evalType] = evalCount;
                    $id(messageInfo.threadId + messageInfo.evalType).innerText = evalCount;
                }
            } else {
                var contentThread = new ContentThread(messageInfo, $id('container'));
                this.threadArray.push(contentThread);
            }
        }

        /**
         * 引数に指定された Id の投稿すみ記事のオブジェクトを返す
         * @param {string} threadId 記事の Id
         * @return{object | null} 記事(スレッド)クラスのインスタンス
         */
    }, {
        key: 'whichThread',
        value: function whichThread(threadId) {
            var length = this.threadArray.length;
            for (var i = 0; i < length; i++) {
                var thread = this.threadArray[i];
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
    }, {
        key: 'evalContent',
        value: function evalContent(threadId, evalType) {
            var newEvaluate = {
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
    }, {
        key: 'moveTop',
        value: function moveTop(threadId) {
            var thread = $id(threadId),
                parent = thread.parentNode;
            if (thread.id !== parent.firstChild.id) {
                parent.insertBefore(thread, parent.firstChild);
            }
        }
    }]);

    return Nicebook;
})();

var ContentThread = (function () {
    /**
    * 記事のスレッドのクラスのコンストラクタ
    * @constructor
    * @param {object} messageInfo メッセージデータ
    * @param {HTMLElement} parent 親エレメント
    */

    function ContentThread(
    /** @type {{userId: string, userName: string, 
        content: string, imgData: string, type: string}} */
    messageInfo, parent) {
        _classCallCheck(this, ContentThread);

        var EVAL = {
            LIKE: 'like',
            LOVE: 'love',
            FANNY: 'fanny',
            SAD: 'sad'
        };
        var threadId = messageInfo.threadId,
            textId = threadId + '_text',
            replysId = threadId + '_replys',
            likeId = threadId + EVAL.LIKE,
            loveId = threadId + EVAL.LOVE,
            fannyId = threadId + EVAL.FANNY,
            sadId = threadId + EVAL.SAD;
        var fbLinks = mkFbLink(messageInfo.userId);
        var fbLinksLoginUser = mkFbLink(Nicebook.accInfo.id);
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
        messageInfo.likeClick = 'javascript:Nicebook.evalContent(\'' + threadId + '\',\'' + EVAL.LIKE + '\')';
        messageInfo.loveClick = 'javascript:Nicebook.evalContent(\'' + threadId + '\',\'' + EVAL.LOVE + '\')';
        messageInfo.fannyClick = 'javascript:Nicebook.evalContent(\'' + threadId + '\',\'' + EVAL.FANNY + '\')';
        messageInfo.sadClick = 'javascript:Nicebook.evalContent(\'' + threadId + '\',\'' + EVAL.SAD + '\')';

        //データをバインドする
        DOMTemplate.bindTemplate(parent, messageInfo, DOMTemplate.oderBy.DESC);

        var replyTextBox = $id(textId),
            commentList = $id(replysId);
        //返信する
        replyTextBox.addEventListener('change', (function (currentText, currentList) {
            return function () {
                var threadId = currentText.id.substr(0, 8);
                var newComment = {
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

    //アプリケーションのエントリーポイント

    /**
    * 記事のスレッドに返信を追加
    * @appendReply
    * @param {object} messageInfo メッセージデータ
     */

    _createClass(ContentThread, [{
        key: 'appendReply',
        value: function appendReply(
        /** @type {{contentId: string, content: string, 
            fbUrl: string, imgUrl: string, dateTime: string, userId: string,
            userName: string, content: string, imgData: string, type: string}} */
        messageInfo) {
            var fbLinks = mkFbLink(messageInfo.userId),
                commentList = this.__commentList;
            messageInfo.fbUrl = fbLinks.fbUrl;
            messageInfo.imgUrl = fbLinks.imgUrl;
            messageInfo.dateTime = appHelper.getCrrentDatetime();
            //データをバインドする
            DOMTemplate.bindTemplate(commentList, messageInfo);
            if (Nicebook.accInfo.name !== messageInfo.userName) {
                Nicebook.ctrl.statusMsg.innerText = messageInfo.userName + ' さんがあなたの投稿にコメントしました。';
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
    }]);

    return ContentThread;
})();

window.onload = function () {
    //FbConnected.callBack = Nicebook.init().setAccInfo;
    //setFbAsncInit();

    //Debug 用ダミーデータ
    Nicebook.init().setAccInfo('Osamu Monoe', '100002070715086');
};

window.onbeforeunload = function (e) {
    //e.returnValue = "Nicebook を閉じますか？\n表示されているデータは失われ、もう二度と戻ることはありません。";
    //Nicebook.notifyLogoff();
};

