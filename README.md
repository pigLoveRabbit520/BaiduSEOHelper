# 安装
```
npm install baidu_seo_helper
```

# API
## isURLIncluded
参数 URL string  
返回值 true|false


## getArticleOriginality
参数 articleContent string  
返回值 json

# 简单示例
```
const seoHelper = require('baidu_seo_helper');

let url = 'http://club.topsage.com/thread-10532391-1-1.html';
let content = `正确的小学英语学习方法对小学生的英语学习起着举足轻重的作用，是一个不容忽视的问题。英语学习对很多小学生来说一直是一件头疼的事情，很多学生都不知道该怎么学习，家长们看到孩子成绩不理想可是却束手无策，不知道该怎么辅导孩子学习英语。
`;

async function testIncluded(url) {
	let res = await seoHelper.isURLIncluded(url);
	console.log(res);
}

async function testOriginality(content) {
	let res = await seoHelper.getArticleOriginality(content)
	console.log(res);
}

testIncluded(url).catch((err)=> {
	console.log('test include failed: ' + err.message);
});

testOriginality(content).catch((err) => {
	console.log('test originality failed: ' + err.message);	
})
```