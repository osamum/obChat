'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var ObChat = (function () {
    function ObChat() {
        _classCallCheck(this, ObChat);
    }

    /**
    * 記事のスレッドのクラス
    */

    _createClass(ObChat, null, [{
        key: 'init',

        /**
         * アプリケーションクラスの初期化メソッド
         * @return {object} 自クラスのインスタンス
         */
        value: function init() {
            this.threadArray = [];
            this.accInfo = { 'name': '', 'id': '', img: '' };
            this.ctrl = {
                fileUpload: $id('imgfile'),
                sendButton: $id('sendmessage'),
                canvas: $id('imgCanvas'),
                textArea: $id('message'),
                statusMsg: $id('status'),
                userImageList: $id('userImgList'),
                container: $id('container'),
                uploadPicArea: $id('upPicCanvas')
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
                if (ObChat.accInfo.id !== '') {
                    var messageInfo = JSON.parse(message);
                    ObChat.routingJob(messageInfo);
                }
            };
            //コネクション確率時のイベントハンドラー
            $.connection.hub.start().done(function () {
                //投稿ボタンクリック時のイベントハンドラー
                ObChat.ctrl.sendButton.addEventListener('click', function () {
                    var content = ObChat.ctrl.textArea.value;
                    if (content !== '' || ObChat.uploadPictureObj.imageData) {
                        var threadId = appHelper.uuid().substr(0, 8),
                            newThread = {
                            'threadId': threadId,
                            'userName': ObChat.accInfo.name,
                            'userId': ObChat.accInfo.id,
                            'profImg': ObChat.accInfo.img,
                            'content': content,
                            'imgData': ObChat.uploadPictureObj.imageData,
                            'type': ObChat.DATA_TYPE.MESSAGE
                        };

                        var _jsonString = JSON.stringify(newThread);
                        ObChat.post(_jsonString);
                    }
                    ObChat.displayUploadArea(false);
                    ObChat.uploadPictureObj.clearPcture(null, 0);
                    ObChat.uploadPictureObj.imageData = '';
                    ObChat.ctrl.textArea.value = '';
                });

                var loginInfo = {
                    name: ObChat.accInfo.name,
                    id: ObChat.accInfo.id,
                    img: ObChat.accInfo.img,
                    'type': ObChat.DATA_TYPE.LOGON
                };
                var jsonString = JSON.stringify(loginInfo);
                ObChat.post(jsonString);
                ObChat.ctrl.textArea.focus();
            });
            this.uploadPictureObj = new uploadPicture(this.ctrl.fileUpload, this.ctrl.canvas, 400, function () {
                ObChat.displayUploadArea(true);
            });

            //画像添付時の閉じるボタンハンドラ
            ObChat.ctrl.uploadPicArea.addEventListener('click', function () {
                ObChat.displayUploadArea(false);
                ObChat.uploadPictureObj.clearPcture(null, 0);
                ObChat.uploadPictureObj.imageData = '';
            });

            return this;
        }

        /**
         * 画像添付の際の閉じるボタンの表示非表示の制御
         * @param {boolean} shwFlg true:表示 | false:非表示
         */
    }, {
        key: 'displayUploadArea',
        value: function displayUploadArea(shwFlg) {
            ObChat.ctrl.uploadPicArea.style.display = shwFlg ? 'block' : 'none';
        }

        /**
         * 記事を投稿する
         * @param {string} jsonString 送信する記事データ
         */
    }, {
        key: 'post',
        value: function post(jsonString) {
            try {
                ObChat.chat.server.send(jsonString);
            } catch (exp) {
                ObChat.ctrl.statusMsg.innerText = 'メッセージを送信できませんでした。ページをリフレッシュしてみてください。';
            }
        }

        /**
        * ステータスバーの内容のリセット 
        */
    }, {
        key: 'resetStatudBar',
        value: function resetStatudBar() {
            setTimeout(function () {
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
    }, {
        key: 'setAccInfo',
        value: function setAccInfo(accountName, accountId, profilePic) {
            ObChat.accInfo.name = accountName;
            ObChat.accInfo.id = accountId;
            ObChat.accInfo.img = profilePic;
            //let fbLinks = mkSNSLink(accountId);
            var ctrl = $id('profilePic');
            ctrl.src = profilePic; //fbLinks.imgUrl;
            ctrl.title = accountName;
            ObChat.ctrl.fileUpload.disabled = false;
            ObChat.ctrl.sendButton.disabled = false;
            ObChat.ctrl.textArea.disabled = false;
            ObChat.resetStatudBar();
            $id('userImgListArea').style.display = 'block';
            $id('inputBox').style.display = 'block';
            ObChat.ctrl.statusMsg.className = 'status-notice-normal';
            ObChat.ctrl.statusMsg.innerText = accountName + ' さん、ようこそ。';
            ObChat.setHandlers();
        }

        /**
         * ユーザーログオフを通知する
         * notifyLogoff
         */
    }, {
        key: 'notifyLogoff',
        value: function notifyLogoff() {
            if (ObChat.accInfo.id === null || ObChat.accInfo.id === '') return;
            var logoffInfo = {
                name: ObChat.accInfo.name,
                id: ObChat.accInfo.id,
                'type': ObChat.DATA_TYPE.LOGOFF
            };
            var jsonString = JSON.stringify(logoffInfo);
            ObChat.post(jsonString);
        }

        /**
        * 他のユーザーのログインを通知する
        * notifyLoginOtherUser
        * @param {Object} accInfo アカウント情報
        */
    }, {
        key: 'notifyLoginOtherUser',
        value: function notifyLoginOtherUser(accInfo) {
            var msg = accInfo.name + ' さんが ObChat にログインしました。';
            //let fbLink = mkSNSLink(accInfo.id);
            ObChat.ctrl.statusMsg.innerText = msg;
            ObChat.ctrl.statusMsg.className = 'status-notice-login';
            ObChat.resetStatudBar();
        }

        /**
         * 新しくユーザーがログインした際に存在を返す
         */
    }, {
        key: 'responseAccountInfo',
        value: function responseAccountInfo() {
            var accInfo = this.accInfo;
            accInfo.type = ObChat.DATA_TYPE.RECEVE_USER_ACCOUNT;
            var jsonString = JSON.stringify(accInfo);
            ObChat.post(jsonString);
        }

        /**
         * ログインしたユーザーのアイコンを追加する
         * @param {object} receveAccInfo アカウント情報
         */
    }, {
        key: 'addUserImage',
        value: function addUserImage(
        /**@type{{name:string, id:string; profImg: string}}*/
        receveAccInfo) {
            //let fbLink = mkSNSLink(receveAccInfo.id),
            var userPicId = 'img' + receveAccInfo.id;
            if ($id(userPicId)) return;
            var userImageInfo = {
                'userId': userPicId,
                'userName': receveAccInfo.name,
                'imgUrl': receveAccInfo.img, //fbLink.imgUrl,
                'fbUrl': '@'
            };
            DOMTemplate.bindTemplate(ObChat.ctrl.userImageList, userImageInfo, DOMTemplate.oderBy.ASC);
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
            ObChat.ctrl.userImageList.removeChild(elm);
            ObChat.ctrl.statusMsg.innerText = msg;
        }

        /**
         * メッセージの内容のよって処理を振り分ける
         * @param {object} messageInfo 受信したメッセージ
         */
    }, {
        key: 'routingJob',
        value: function routingJob(messageInfo) {
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
            var threadElem = this.whichThread(messageInfo.threadId);
            if (threadElem) {
                if (messageInfo.type === ObChat.DATA_TYPE.MESSAGE) {
                    threadElem.appendReply(messageInfo);
                } else if (messageInfo.type === ObChat.DATA_TYPE.EVALUATE) {
                    var evalCount = threadElem[messageInfo.evalType] + 1;
                    threadElem[messageInfo.evalType] = evalCount;
                    $id(messageInfo.threadId + messageInfo.evalType).innerText = evalCount;
                }
            } else {
                var contentThread = new ContentThread(messageInfo, this.ctrl.container);
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
                'type': ObChat.DATA_TYPE.EVALUATE
            };
            ObChat.post(JSON.stringify(newEvaluate));
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

    return ObChat;
})();

var ContentThread = (function () {
    /**
    * 記事のスレッドのクラスのコンストラクタ
    * @constructor
    * @param {object} messageInfo メッセージデータ
    * @param {HTMLElement} parent 親エレメント
    */

    function ContentThread(
    /** @type {{userId: string, userName: string, profImg:string, 
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
            sadId = threadId + EVAL.SAD,
            reFileId = threadId + '_reFile',
            reCanvasId = threadId + '_reCnvs',
            reCanvasAreaId = threadId + '_reCnvsArea',
            reCloseId = threadId + '_reCloseId';
        messageInfo.replysId = replysId;
        messageInfo.atclId = threadId + '_atcl';
        messageInfo.textId = textId;
        messageInfo.fbUrl = '@';
        messageInfo.imgUrl = messageInfo.profImg;
        messageInfo.dateTime = appHelper.getCrrentDatetime();
        messageInfo.currentUserName = ObChat.accInfo.name;
        messageInfo.currentImgUrl = ObChat.accInfo.img; //fbLinksLoginUser.imgUrl;
        messageInfo.likeId = likeId;
        messageInfo.loveId = loveId;
        messageInfo.fannyId = fannyId;
        messageInfo.sadId = sadId;
        var htmlContent = appHelper.escapeHTML(messageInfo.content);
        messageInfo.content = appHelper.autoLink(htmlContent).replace(/\r?\n/g, '<br>');

        messageInfo.reFileId = reFileId;
        messageInfo.reCnvsId = reCanvasId;
        messageInfo.reCanvasAreaId = reCanvasAreaId;
        messageInfo.reCloseId = reCloseId;

        messageInfo.likeClick = 'javascript:ObChat.evalContent(\'' + threadId + '\',\'' + EVAL.LIKE + '\')';
        messageInfo.loveClick = 'javascript:ObChat.evalContent(\'' + threadId + '\',\'' + EVAL.LOVE + '\')';
        messageInfo.fannyClick = 'javascript:ObChat.evalContent(\'' + threadId + '\',\'' + EVAL.FANNY + '\')';
        messageInfo.sadClick = 'javascript:ObChat.evalContent(\'' + threadId + '\',\'' + EVAL.SAD + '\')';

        //データをバインドする
        DOMTemplate.bindTemplate(parent, messageInfo, DOMTemplate.oderBy.DESC);

        var replyTextBox = $id(textId),
            commentList = $id(replysId),
            uploadPictureObj = new uploadPicture($id(reFileId), $id(reCanvasId), 300, function () {
            $id(reCanvasAreaId).style.display = 'block';
        });
        //返信する
        replyTextBox.addEventListener('change', (function (currentText, currentList, uploadPictureObj) {
            return function () {
                var threadId = currentText.id.substr(0, 8);
                var newComment = {
                    'threadId': threadId,
                    'commentId': threadId + '_' + currentList.childNodes.length + '_reply',
                    'userName': ObChat.accInfo.name,
                    'userId': ObChat.accInfo.id,
                    'profImg': ObChat.accInfo.img,
                    'content': currentText.value,
                    'type': ObChat.DATA_TYPE.MESSAGE,
                    'imgData': uploadPictureObj.imageData
                };
                $id(threadId + '_reCnvsArea').style.display = 'none';
                uploadPictureObj.clearPcture(null, 0);
                uploadPictureObj.imageData = '';
                ObChat.post(JSON.stringify(newComment));
                currentText.value = '';
            };
        })(replyTextBox, commentList, uploadPictureObj));

        $id(reCloseId).addEventListener('click', (function (threadId, uploadPictureObj) {
            return function () {
                $id(threadId + '_reCnvsArea').style.display = 'none';
                uploadPictureObj.clearPcture(null, 0);
                uploadPictureObj.imageData = '';
            };
        })(threadId, uploadPictureObj));

        this.__commentList = commentList;
        this.id = threadId;
        this.like = 0;
        this.love = 0;
        this.fanny = 0;
        this.sad = 0;
    }

    /**
     * 匿名ログインで使用するためのクラス (Facebook 認証などど組み合わせる際は必要なし)
     */

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

            var commentList = this.__commentList;
            messageInfo.fbUrl = '@'; //fbLinks.fbUrl;
            messageInfo.imgUrl = messageInfo.profImg; //fbLinks.imgUrl;
            messageInfo.dateTime = appHelper.getCrrentDatetime();

            var htmlContent = appHelper.escapeHTML(messageInfo.content);
            messageInfo.content = appHelper.autoLink(htmlContent).replace(/\r?\n/g, '<br>');

            //データをバインドする
            DOMTemplate.bindTemplate(commentList, messageInfo);
            if (ObChat.accInfo.name !== messageInfo.userName) {
                ObChat.ctrl.statusMsg.innerText = messageInfo.userName + ' さんがあなたの投稿にコメントしました。';
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
    }]);

    return ContentThread;
})();

var loginBox = (function () {
    function loginBox() {
        _classCallCheck(this, loginBox);
    }

    //アプリケーションのエントリーポイント

    _createClass(loginBox, null, [{
        key: 'init',
        value: function init(callBack) {
            var _this = this;

            var profPicM = [{ imgUrl: this.setPath('icon_124990_48.png'), onclick: 'loginBox.handler(event)' }, { imgUrl: this.setPath('icon_113190_48.png'), onclick: 'loginBox.handler(event)' }, { imgUrl: this.setPath('icon_113260_48.png'), onclick: 'loginBox.handler(event)' }, { imgUrl: this.setPath('icon_113250_48.png'), onclick: 'loginBox.handler(event)' }, { imgUrl: this.setPath('icon_113270_48.png'), onclick: 'loginBox.handler(event)' }, { imgUrl: this.setPath('icon_124540_48.png'), onclick: 'loginBox.handler(event)' }, { imgUrl: this.setPath('icon_124530_48.png'), onclick: 'loginBox.handler(event)' }];

            var profPicW = [{ imgUrl: this.setPath('icon_124720_48.png'), onclick: 'loginBox.handler(event)' }, { imgUrl: this.setPath('icon_124660_48.png'), onclick: 'loginBox.handler(event)' }, { imgUrl: this.setPath('icon_124710_48.png'), onclick: 'loginBox.handler(event)' }, { imgUrl: this.setPath('icon_113210_48.png'), onclick: 'loginBox.handler(event)' }, { imgUrl: this.setPath('icon_135050_48.png'), onclick: 'loginBox.handler(event)' }, { imgUrl: this.setPath('icon_118030_48.png'), onclick: 'loginBox.handler(event)' }, { imgUrl: this.setPath('icon_124800_48.png'), onclick: 'loginBox.handler(event)' }];

            var profPicListM = $id('profPicMan');
            DOMTemplate.bindTemplate(profPicListM, profPicM);
            var profPicListW = $id('profPicWoman');
            DOMTemplate.bindTemplate(profPicListW, profPicW);

            this.ctrl = {};
            this.ctrl.loginBox = $id('loginUI');
            this.ctrl.nameBox = $id('nameBox');
            this.ctrl.loginButton = $id('loginButton');
            this.ctrl.loginButton.addEventListener('click', function () {
                if (_this.ctrl.nameBox.value) {
                    if (_this.prvImg) {
                        _this.ctrl.loginBox.style.display = 'none';
                        $id('inputBox').style.display = 'block';
                        ObChat.init().setAccInfo(_this.ctrl.nameBox.value, '' + appHelper.uuid(), _this.prvImg.src);
                    } else {
                        alert('使用するアイコンを選択してください。');
                    }
                } else {
                    _this.ctrl.nameBox.value = 'ここにお名前を入力してくださいましね。';
                    _this.ctrl.nameBox.className = 'alert_RedFrame';
                    _this.ctrl.nameBox.addEventListener('click', function () {
                        _this.ctrl.nameBox.select(0, _this.ctrl.nameBox.value.length);
                    });
                }
            });
            setTimeout(function () {
                _this.ctrl.nameBox.focus();
            }, 1000);
        }
    }, {
        key: 'setPath',
        value: function setPath(fileName) {
            return 'http://assets-images.azurewebsites.net/' + fileName;
        }
    }, {
        key: 'handler',
        value: function handler(event) {
            if (this.prvImg) {
                this.prvImg.className = 'prof-nomal_img';
            }
            var img = event.target;
            img.className = 'prof-selected_img';
            this.prvImg = img;
        }
    }]);

    return loginBox;
})();

window.onload = function () {
    loginBox.init();
};

window.onbeforeunload = function (e) {
    //e.returnValue = "ObChat を閉じますか？\n表示されているデータは失われ、もう二度と戻ることはありません。";
    ObChat.notifyLogoff();
};

