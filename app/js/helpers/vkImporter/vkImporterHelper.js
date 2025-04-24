var VkApiError = require("./notMineVkApiError.js");
var VkRequest = require("./notMineVkRequest.js");
var VkToken = require("./notMineVkToken.js");

const request = require("request-promise");

// -111111111 для групп
var vkUserId = 111111111;

// заменить значение на полученное
var vkRequest = new VkRequest(
    "d1379c69c5a24fa66d49ec421ee092d54fa4c01beeef2ce593a816d3f88920aba56815e3442c7e5377e7c"
);

// в общем из того что я изучил, прямая авторизация не работает в приложениях, нужно официально просить у supporta вк поддержку
// так что пока сделаем кнопку через которую я получу acess токен и вставлю его в свою приложуху
/*var vkToken = new VkToken("1", "4IWeztWMEbimO3bоq9uq");
vkToken
    .getTokenFromCode("client_credentials")
    .then(function (json) {
        console.log("вот оно", json);
    })
    .catch(function (error) {
        console.log(error);
    });

var vkRequest = new VkRequest(vkToken);*/

//в чём отличие этих 2 вариантов? (тут описано https://dev.vk.com/api/oauth-parameters поэтому мне нужен 2 варик)
//https://oauth.vk.com/authorize?client_id=1&scope=notify,photos,friends,audio,video,notes,pages,docs,status,questions,offers,wall,groups,messages,notifications,stats,ads,offline
//https://oauth.vk.com/authorize?client_id=1&display=page&scope=friends&response_type=token&v=5.92&state=123456

// ограничения и рекомендации - важная штука
// https://dev.vk.com/api/api-requests#%D0%9E%D0%B3%D1%80%D0%B0%D0%BD%D0%B8%D1%87%D0%B5%D0%BD%D0%B8%D1%8F%20%D0%B8%20%D1%80%D0%B5%D0%BA%D0%BE%D0%BC%D0%B5%D0%BD%D0%B4%D0%B0%D1%86%D0%B8%D0%B8

function getRealLink(options) {
    return new Promise(function (resolve, reject) {
        request(options)
            .promise()
            .then(function (response) {
                if (response.statusCode !== 200) {
                    return reject(new Error(`${response.statusCode} ${response.body}`));
                }
                //const json = JSON.parse(response.body);
                //    console.log("it;a all ", response);
                var json = response.toJSON();
                console.log("header ", json.request.uri.href);
                //     console.log("eto telo ", response.body);
                //  if (json.error) return reject(new VkApiError(json.error));
                return resolve(json.request.uri.href);
            })
            .catch(function (error) {
                return reject(error);
            });
    });
}

function vkRequestor(methodName, methodParams, funcForWork) {
    return new Promise(function (resolve, reject) {
        vkRequest
            .method(methodName, methodParams)
            .then(function (json) {
                return resolve(funcForWork(json));
            })
            .catch({ name: "VkApiError" }, function (error) {
                console.log(`VKApi error ${error.error_code} ${error.error_msg}`);
                switch (error.error_code) {
                    case 14:
                        console.log("Captcha error");
                        break;
                    case 5:
                        console.log("No auth");
                        break;
                    default:
                        console.log(error.error_msg);
                }
                return reject(error);
            })
            .catch(function (error) {
                console.log(`Other error ${error.error_msg}`);
                return reject(error);
            });
    });
}

function getVkGroupInfo(groupId) {
    return vkRequestor(
        "groups.getById",
        {
            group_id: Math.abs(groupId),
            fields: "cover",
        },
        (json) => {
            console.log("группа вот ", json);
            const res = json.response[0];

            console.log("это обложка ", res.cover);
            var cover = null;
            if (res.cover.enabled) {
                var maxPhotoWidth = -1;
                for (var i = 0; i < res.cover.images.length; i++) {
                    if (res.cover.images[i].width > maxPhotoWidth) {
                        cover = res.cover.images[i].url;
                        maxPhotoWidth = res.cover.images[i].width;
                    }
                }
            }
            return {
                avatar: res.photo_200,
                name: res.name,
                cover: cover,
            };
        }
    );
}

function getVkUserInfo(userId) {
    return vkRequestor(
        "users.get",
        {
            user_ids: userId,
            fields: "photo_200",
        },
        function (json) {
            const res = json.response[0];

            return {
                avatar: res.photo_200,
                name: res.first_name + " " + res.last_name,
                id: res.id,
            };
        }
    );
}

function getVideoInfo(groupId, videoId) {
    return vkRequestor(
        "video.get",
        {
            videos: `${groupId}_${videoId}`,
            count: 1,
            offset: 0,
        },
        function (json) {
            console.log("here is res ", json.response);
            const res = json.response;
            console.log("here is re2s ", res);

            return res.items[0].player;
        }
    );
}

function getVkUserId() {
    return vkUserId;
}

module.exports = {
    getVkUserId,
    getVideoInfo,
    getVkUserInfo,
    getVkGroupInfo,
    getRealLink,
    vkRequestor,
};
