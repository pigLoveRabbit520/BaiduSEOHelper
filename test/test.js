const assert = require('assert');
const should = require('should');
const seoHelper = require('../baidu_api');

describe('结果中带...的', function() {
	it('should return false', async function() {
		let url = 'http://bbs.cnyw.net/thread-3346384-1-1.html';
		let res = await seoHelper.isURLIncluded(url);
        assert.equal(res, false);
    });
});

describe('结果中不带...的', function() {
	it('should return true', async function() {
		let url = 'http://www.babytree.com/community/zaojiao/topic_80988166.html';
		let res = await seoHelper.isURLIncluded(url);
        assert.equal(res, true);
    });
});


describe('不收录的，第一行出现没找到该url', function() {
    it('should return false', async function() {
        let url = 'http://bbs.pageadmin.net/showtopic-38806.aspx';
        let res = await seoHelper.isURLIncluded(url);
        assert.equal(res, false);
    });
});

describe('原创度检测 默认不带日志', function() {
    this.timeout(5000);

    it('should res be Object', async function() {
        let content = '正确的小学英语学习方法对小学生的英语学习起着举足轻重的作用，是一个不容忽视的问题。英语学习对很多小学生来说一直是一件头疼的事情，很多学生都不知道该怎么学习，家长们看到孩子成绩不理想可是却束手无策，不知道该怎么辅导孩子学习英语。';
        let res = await seoHelper.getArticleOriginality(content);
        res.should.be.Object();
    });
});