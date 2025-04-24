function getDateTimeParams(needUtc, customDate = null) {
    var dateTime;
    if (!customDate) {
        dateTime = new Date();
    } else {
        dateTime = new Date(customDate);
    }

    var dateTimeParams = [];
    if (needUtc) {
        dateTimeParams.push(dateTime.getUTCFullYear());
        dateTimeParams.push(dateTime.getUTCMonth() + 1);
        dateTimeParams.push(dateTime.getUTCDate());
        dateTimeParams.push(dateTime.getUTCHours());
        dateTimeParams.push(dateTime.getUTCMinutes());
        dateTimeParams.push(dateTime.getUTCSeconds());
        dateTimeParams.push(dateTime.getUTCMilliseconds());
    } else {
        dateTimeParams.push(dateTime.getFullYear());
        dateTimeParams.push(dateTime.getMonth() + 1);
        dateTimeParams.push(dateTime.getDate());
        dateTimeParams.push(dateTime.getHours());
        dateTimeParams.push(dateTime.getMinutes());
        dateTimeParams.push(dateTime.getSeconds());
        dateTimeParams.push(dateTime.getMilliseconds());
    }

    return dateTimeParams;
}

function checkIfZeroNeeded(str, desiredStringLength = 2) {
    if (desiredStringLength < 2) {
        return str;
    }

    while (str.toString().length < desiredStringLength) {
        str = `0${str}`;
    }

    return str;
}

module.exports = {
    getDateTimeParams,
    checkIfZeroNeeded,
};
