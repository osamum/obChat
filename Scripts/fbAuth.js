
/**
 * Facebook のページとプロフィール写真の URL を返す
 * @mkFbLink
 * @param {string} accountId ユーザー ID
 * @return {object}
 */
function mkSNSLink(accountId) {
    return {
        'fbUrl': 'https://www.facebook.com/' + accountId,
        'imgUrl': 'https://graph.facebook.com/' + accountId + '/picture'
    };
}





