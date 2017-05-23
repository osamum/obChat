/**
 * オブジェクトと DOM エレメントをバインドする機能を提供するクラス
 */
class DOMTemplate {
    /**
   * 名前付き定数
   * oderBy
   * @return {number} 昇順/降順の指定
   */
    static get oderBy() {
        return { 'ASC': 0, 'DESC': 1 };
    }

   　/**
     * 記事のスレッドに返信を追加
     * @bind
     * @param {HTMLElement} element 投稿者の名前
     * @param {Object} dataSource 投稿
     */
    static bind(element, dataSource) {
        try {
            if (element.attributes === null || undefined === element.attributes['data-app-option']) return;
        } catch (exp) {return;}
        let optVlu = element.attributes['data-app-option'].value;
        element.removeAttribute('data-app-option');
        let dataOpt = eval('(' + optVlu + ')');
        for (let attr in dataOpt) {
            if (attr === 'innerText') {
                element.innerText = dataSource[dataOpt[attr]];
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
    static traversBind(node, dataSource) {
        let nodeLength = node.childNodes.length;
        if (nodeLength > 0) {
            for (let i = 0; i < nodeLength; i++) {
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
    static bindTemplate(targetDiv, dataSources, oderBy) {
        let tpl = document.getElementById(targetDiv.attributes['data-template'].value);
        if (dataSources.length) {
            let dataLength = dataSources.length;
            for (let i = 0; i < dataLength; i++) {
                let clone = tpl.cloneNode(true);
                clone.removeAttribute('id');
                this.traversBind(clone, dataSources[i]);
                targetDiv.appendChild(clone);
            }
        } else {
            let clone = tpl.cloneNode(true);
            this.traversBind(clone, dataSources);
            if (oderBy === this.oderBy.DESC) {
                targetDiv.insertBefore(clone, targetDiv.firstChild);
            } else {
                targetDiv.appendChild(clone);
            }
        }
    }
}
