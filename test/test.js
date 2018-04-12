const assert = require('assert');
const should = require('should');
const seoHelper = require('../baidu_api');

describe('结果中带...的', function() {
	it('should return true', async function() {
		let url = 'http://bbs.cnyw.net/thread-3346384-1-1.html';
		let res = await seoHelper.isURLIncluded(url);
        assert.equal(res, true);
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