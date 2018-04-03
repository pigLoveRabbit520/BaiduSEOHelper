const request = require('request');
const cheerio = require('cheerio');
const tool = require('./tool');
const levenshtein = require('levenshtein');
let URL = require('url');

const baiduSearchUrl = 'https://www.baidu.com/s?wd=';
const baiduCharLimt = 38;
const ignoreCharsLen = 15;
const ignoreEmCharsLen = 5; // 标红字数

function sendRequest(options) {
    if(typeof(options) === 'string') {
        options = {
            url: options,
            method: 'GET',
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
            }
        }
    }

    return new Promise((resolve, reject) => {
        request(options, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                resolve(body);
            } else {
                reject(error);
            }
        });
    });
}

async function isURLIncluded(url) {
	url = url.trim();
    let urlParsed = URL.parse(url);
    let body = await sendRequest(baiduSearchUrl + url);
    let $ = cheerio.load(body);
    let firstBlock = $('#1');
    let emptyBlock = $('#container .content_none');
    if(firstBlock.length > 0) {
        let firstLinkText = firstBlock.find('.f13 > a > b').eq(0).text();
        // 三个.和四个.都会有
        firstLinkText = firstLinkText.split('...')[0].trim();
        // 域名开头
        // 带protocol
        if(url.substr(0, firstLinkText.length) === firstLinkText) {
            return true;
        }
        let protocol = urlParsed.protocol + "//";
        let urlNoProtocol = url.substr(protocol.length);
        return urlNoProtocol.substr(0, firstLinkText.length) === firstLinkText
    } else if(emptyBlock.length > 0) {
        return false;
    } else {
        throw new Error('访问频率过快');
    }
}

function getSubStrListByLen(str, length) {
    let size = Math.ceil(str.length / length);
    let list = [];
    for (let index = 0; index < size; index++) {
        list.push(str.substr(index * length, length));
    }
    return list;
}

/**
 * 获取一段话的百度匹配后编辑距离
 * @param statement
 * @returns {Promise.<void>}
 */
async function getStatementEditDistance(statement) {
    let editDistance = -1;
    try {
        let body = await sendRequest(encodeURI(baiduSearchUrl + statement));
        let $ = cheerio.load(body);
        let results = $('#content_left .result');
        let tempEditDistanceArr = [];
        for(let i = 0; i < results.length; i++) {
            let result = results[i];
            let ems = $(result).find('em');
            let emCount = 0;
            let emArr = [];
            for(let j = 0; j < ems.length; j++) {
                let em = ems[j];
                let emTxt = $(em).text();
                if(emTxt.length > ignoreEmCharsLen) {
                    if(!tool.arrValueExist(emArr, emTxt)) {
                        emArr.push(emTxt);
                        emCount += emTxt.length;
                    }
                }
            }
            // 标红字数统计
            let calDis = emCount - statement.length;
            tempEditDistanceArr.push(calDis >= 0 ? 0 : -calDis);
        }
        if(tempEditDistanceArr.length > 0) {
            editDistance = Math.min.apply(null, tempEditDistanceArr);
        }
    } catch(err) {
        console.log(`detect statement ${statement} failed`);
    }
    return editDistance;
}

/**
 * 获取一句话的编辑距离。-1代表忽略这个句子
 * @param sentence
 * @returns {Promise.<number>}
 */
async function getSentenceEditDistance(sentence) {
    let list = getSubStrListByLen(sentence.trim(), baiduCharLimt);
    if(list.length === 1) {
        return await getStatementEditDistance(list[0]);
    } else {
        let editDistance = 0;
        // 截断后会有空白字符
        for(let substr of list) {
            let substrTrimed = substr.trim();
            let blankStrs = substr.split(substrTrimed);
            let blankCount = 0;
            for(let blankStr of blankStrs) {
                if(blankStr) {
                    blankCount += blankStr.length;
                }
            }
            if(substrTrimed.length >= ignoreCharsLen) {
                let res = await getStatementEditDistance(substrTrimed);
                // 没结果
                if(res < 0) {
                    editDistance += substrTrimed.length;
                } else {
                    editDistance += res;
                }
                // 空白字符加回去
                editDistance += blankCount;
                // 防止抓取频率过于频繁
                await tool.sleep(400);
            } else {
                editDistance += substr.length;
            }
        }
        return editDistance;
    }
}

function filterArticleContent(mdContent) {
    mdContent = mdContent.trim().replace(/\r\n/g, '');
    // 提取图片
    mdContent = mdContent.replace(/!\[.*\]\(.+\)/g, '');
    // 提取链接
    mdContent =mdContent.replace(/(?!!)\[(.+)\]\(.+\)/g, "$1");
    return mdContent;
}

async function getArticleOriginality(articleContent) {
    articleContent = filterArticleContent(articleContent);
    let sentences = articleContent.split(/[\r\n。？]+/);
    let result = {};
    for(let sentence of sentences) {
        // 清楚空格
        sentence = sentence.trim();
        if(sentence && sentence.length > ignoreCharsLen) {
            try {
                console.log('detect sentence ' + sentence);
                let editDis = await getSentenceEditDistance(sentence);
                console.log('sentence ' + sentence + ' result is ' + editDis);
                if(editDis >= 0) {
                    result[sentence] = editDis;
                }
            } catch(err) {
                console.log('detect sentence ' + sentence.substr(0, 10) + ' failed ' + err.message)
            }
        }
    }
    return result;
}

module.exports.isURLIncluded = isURLIncluded;

module.exports.getSentenceEditDistance = getSentenceEditDistance;

module.exports.getArticleOriginality = getArticleOriginality;



