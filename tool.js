const oneDayDuration = 1000 * 60 * 60 * 24;
const oneWeekDuration = 7 * 1000 * 60 * 60 * 24;

function getLastWeekFirst() {
    let time = new Date();
    let newTime = new Date(time.getFullYear(), time.getMonth(), time.getDate());
    newTime.setHours(0, 0, 0, 0);
    let nowDayOfWeek = time.getDay();
    if(nowDayOfWeek === 0) {
        nowDayOfWeek = 7;
    }
    let delta = ((nowDayOfWeek - 1) * oneDayDuration + oneWeekDuration);
    return new Date(newTime.getTime() - delta);
}

function getLastWeekEnd() {
    let date = getLastWeekFirst();
    return new Date(date.getTime() + oneWeekDuration);
}

function sleep(time) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve();
        }, time);
    })
}

function isLegalNum(value) {
    return !isNaN(value) && value >= 0;
}

function arrValueExist(arr, value) {
    let exist = false;
    for(let item of arr) {
        if(item === value)
            return true;
    }
    return false;
}

module.exports.getLastWeekFirst = getLastWeekFirst;

module.exports.getLastWeekEnd = getLastWeekEnd;

module.exports.sleep = sleep;

module.exports.isLegalNum = isLegalNum;

module.exports.arrValueExist = arrValueExist;