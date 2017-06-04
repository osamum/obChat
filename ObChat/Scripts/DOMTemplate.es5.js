/**
* オブジェクトと DOM エレメントをバインドする機能を提供するクラス
*/
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var DOMTemplate = (function () {
    function DOMTemplate() {
        _classCallCheck(this, DOMTemplate);
    }

    _createClass(DOMTemplate, null, [{
        key: 'bind',

        /**
         * 記事のスレッドに返信を追加
         * @bind
         * @param {HTMLElement} element 投稿者の名前
         * @param {Object} dataSource 投稿
         */
        value: function bind(element, dataSource) {
            try {
                if (element.attributes === null || undefined === element.attributes['data-app-option']) return;
            } catch (exp) {
                return;
            }
            var optVlu = element.attributes['data-app-option'].value;
            element.removeAttribute('data-app-option');
            var dataOpt = eval('(' + optVlu + ')');
            for (var attr in dataOpt) {
                if (attr === 'innerText') {
                    element.innerText = dataSource[dataOpt[attr]];
                } else if (attr === 'innerHTML') {
                    element.innerHTML = dataSource[dataOpt[attr]];
                } else if (attr === 'value') {
                    element.value = dataSource[dataOpt[attr]];
                } else {
                    element.setAttribute(attr, dataSource[dataOpt[attr]]);
                }
            }
        }

        /**
         * traversBind
         * DOM ツリーを走査してデータをバインドする
         * @param {HTMLElement} node DOM エレメント
         * @param {object} dataSource オブジェクト
         */
    }, {
        key: 'traversBind',
        value: function traversBind(node, dataSource) {
            var nodeLength = node.childNodes.length;
            if (nodeLength > 0) {
                for (var i = 0; i < nodeLength; i++) {
                    this.traversBind(node.childNodes[i], dataSource);
                }
                this.bind(node, dataSource);
            } else {
                this.bind(node, dataSource);
            }
        }

        /**
         * bindTemplate
         * オブジェクトに DOM テンプレートを適用する
         * @param {HTMLElement} targetDiv　テンプレートの DOM インスタンス
         * @param {object} dataSources オブジェクト
         * @param {number} oderBy DOM の挿入位置(先頭 :0、最後 :1)
         */
    }, {
        key: 'bindTemplate',
        value: function bindTemplate(targetDiv, dataSources, oderBy) {
            var tpl = document.getElementById(targetDiv.attributes['data-template'].value);
            if (dataSources.length) {
                var dataLength = dataSources.length;
                for (var i = 0; i < dataLength; i++) {
                    var clone = tpl.cloneNode(true);
                    clone.removeAttribute('id');
                    this.traversBind(clone, dataSources[i]);
                    targetDiv.appendChild(clone);
                }
            } else {
                var clone = tpl.cloneNode(true);
                this.traversBind(clone, dataSources);
                if (oderBy === this.oderBy.DESC) {
                    targetDiv.insertBefore(clone, targetDiv.firstChild);
                } else {
                    targetDiv.appendChild(clone);
                }
            }
        }
    }, {
        key: 'oderBy',

        /**
        * 名前付き定数
        * oderBy
        * @return {number} 昇順/降順の指定
        */
        get: function get() {
            return { 'ASC': 0, 'DESC': 1 };
        }
    }]);

    return DOMTemplate;
})();

