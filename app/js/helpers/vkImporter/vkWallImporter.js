const {
    getVkUserId,
    getVideoInfo,
    getVkUserInfo,
    getVkGroupInfo,
    getRealLink,
    vkRequestor,
} = require("./vkImporterHelper.js");

function getVkPostInfo(needPosts, offset) {
    return vkRequestor(
        "wall.get",
        {
            owner_id: getVkUserId(),
            count: needPosts,
            offset: offset,
            extended: 1,
            fields: "cover,photo_200",
        },
        async (json) => {
            var posts = [];

            const allProfiles = json.response.profiles;
            const allGroups = json.response.groups;
            console.log(json);
            console.log(json.response.profiles[0]);
            console.log(json.response.groups[0]);

            for (var i = 0; i < json.response.items.length; i++) {
                var postId;
                var postAttachments = [];
                var postDescription = "";

                var originalPosterId = null;
                var originalPostTime = null;

                var reposterId = null;
                var repostTime = null;

                var player = null;

                var res = json.response.items[i];
                repostTime = res.date;
                reposterId = res.owner_id;

                if (json.response.items[i].copy_history) {
                    res =
                        json.response.items[i].copy_history[
                            json.response.items[i].copy_history.length - 1
                        ];
                    originalPostTime = res.date;
                    originalPosterId = res.owner_id; // or it should be from_id ???
                    postId = res.id;
                } else {
                    originalPostTime = repostTime;
                    originalPosterId = reposterId;
                    reposterId = null;
                    postId = res.id;
                }
                postDescription = res.text;

                for (var j = 0; j < res.attachments.length; j++) {
                    // just work with photos for now
                    console.log(res);
                    console.log("here the photoX ", res.attachments[0].photo);
                    console.log("here the photoZ ", res.attachments[0].link);

                    if (res.attachments[j].photo) {
                        var postAttachment = null;
                        var maxPhotoWidth = -1;
                        for (var k = 0; k < res.attachments[j].photo.sizes.length; k++) {
                            if (res.attachments[j].photo.sizes[k].width > maxPhotoWidth) {
                                postAttachment = res.attachments[j].photo.sizes[k].url;
                                maxPhotoWidth = res.attachments[j].photo.sizes[k].width;
                            }
                        }
                        console.log("here the photo ", postAttachment);
                        postAttachments.push(postAttachment);
                    }

                    // but it's doc, not gif so it will crush somethimes what will we do?
                    // gif has strange ?extra after gif and that's why discord thinks it's image, not gif, so delete this part
                    if (res.attachments[j].doc) {
                        // var urlDoc = res.attachments[j].doc.url.match(/^.*\.gif/i);
                        //   console.log(urlDoc);
                        var options = {
                            url: res.attachments[j].doc.url,
                            // qs: this1._vkQueryParameters(arguments[1]),
                            simple: false,
                            resolveWithFullResponse: true,
                            forever: true,
                        };

                        //https://vk.com/doc423223227_553956284?hash=16c6a4fe657c084ed0&dl=GIZTANBSGI2DANI:1644759421:9d041c14c6ea858af4&api=1&no_preview=1
                        var urlDoc = await getRealLink(options);
                        //console.log(urlDoc);
                        console.log(res.attachments[j].doc.url);
                        postAttachments.push(urlDoc);
                    }

                    // try to get video not from player but direct variant?? like this https://cs9-1v4.vkuservideo.net/p1/75bf124a7bfb.360.mp4
                    if (res.attachments[j].type === "video") {
                        var previewPhoto = res.attachments[j].video.photo_1280;
                        if (!previewPhoto) {
                            previewPhoto = res.attachments[j].video.photo_800;
                            if (!previewPhoto) {
                                previewPhoto = res.attachments[j].video.photo_320;
                            }
                        }

                        postAttachments.push(previewPhoto); //or  first_frame_1280 photo seems to have better preview pictures?
                        console.log(
                            "vidosek ifo ",
                            res.attachments[j].video.owner_id,
                            res.attachments[j].video.id
                        );
                        // как быть с видосами пока не ясно  типа у нас же ограничение на число запросов в секунду
                        /*player = await getVideoInfo(
                            res.attachments[j].video.owner_id,
                            res.attachments[j].video.id
                        );*/
                        player = null;
                        console.log("видосек ", player);
                    }

                    if (res.attachments[j].type === "link") {
                        var maxPhotoWidth = 0;
                        if (res.attachments[j].link.photo) {
                            for (var k = 0; k < res.attachments[j].link.photo.sizes.length; k++) {
                                if (res.attachments[j].link.photo.sizes[k].width > maxPhotoWidth) {
                                    postAttachment = res.attachments[j].link.photo.sizes[k].url;
                                    maxPhotoWidth = res.attachments[j].link.photo.sizes[k].width;
                                }
                            }
                            postAttachments.push(postAttachment);
                        }
                        postDescription += "\n \n" + res.attachments[j].link.url;
                        console.log("here the photo ", postAttachment);
                    }
                }

                var posterAndReposterInfo = getPosterAndReposterInfo(
                    originalPosterId,
                    reposterId,
                    allProfiles,
                    allGroups
                );

                posts.push({
                    postId: postId,
                    postAttachments: postAttachments,
                    postDescription: postDescription,
                    originalPosterId: originalPosterId,
                    originalPosterAvatar: posterAndReposterInfo.originalPosterAvatar,
                    originalPosterName: posterAndReposterInfo.originalPosterName,
                    originalPosterCover: posterAndReposterInfo.originalPosterCover,
                    originalPostTime: originalPostTime,
                    originalPosterMark: posterAndReposterInfo.originalPosterMark,
                    reposterId: reposterId,
                    reposterAvatar: posterAndReposterInfo.reposterAvatar,
                    reposterName: posterAndReposterInfo.reposterName,
                    reposterCover: posterAndReposterInfo.reposterCover,
                    repostTime: repostTime,
                    reposterMark: posterAndReposterInfo.reposterMark,
                    player: player,
                });
            }

            return posts;
        }
    );
}

function getPosterAndReposterInfo(originalPosterId, reposterId, allProfiles, allGroups) {
    var originalPosterMark = "club";
    var originalPosterInfo = null;
    if (originalPosterId < 0) {
        originalPosterInfo = getProfilesOrGroupsInfo(originalPosterId, allGroups);
        originalPosterMark = "club";
    } else {
        originalPosterInfo = getProfilesOrGroupsInfo(originalPosterId, allProfiles);
        originalPosterMark = "id";
    }

    var reposterMark = "club";
    var reposterInfo = null;
    if (reposterId) {
        if (reposterId < 0) {
            reposterInfo = getProfilesOrGroupsInfo(reposterId, allGroups);
            reposterMark = "club";
        } else {
            reposterInfo = getProfilesOrGroupsInfo(reposterId, allProfiles);
            reposterMark = "id";
        }
    }

    return {
        originalPosterAvatar: originalPosterInfo.avatar,
        originalPosterName: originalPosterInfo.name,
        originalPosterCover: originalPosterInfo.cover,
        originalPosterMark: originalPosterMark,
        reposterAvatar: reposterInfo.avatar,
        reposterName: reposterInfo.name,
        reposterCover: reposterInfo.cover,
        reposterMark: reposterMark,
    };
}

function getProfilesOrGroupsInfo(id, profilesOrGroups) {
    var i = 0;
    while (profilesOrGroups[i].id !== Math.abs(id)) {
        i++;
    }

    var name = profilesOrGroups[i].first_name
        ? profilesOrGroups[i].first_name + " " + profilesOrGroups[i].last_name
        : profilesOrGroups[i].name;

    var cover = null;
    if (profilesOrGroups[i].cover.enabled) {
        console.log("вот группа", profilesOrGroups[i].cover.images);
        var maxPhotoWidth = -1;
        for (var j = 0; j < profilesOrGroups[i].cover.images.length; j++) {
            if (profilesOrGroups[i].cover.images[j].width > maxPhotoWidth) {
                cover = profilesOrGroups[i].cover.images[j].url;
                maxPhotoWidth = profilesOrGroups[i].cover.images[j].width;
            }
        }
    }

    return {
        avatar: profilesOrGroups[i].photo_200,
        name: name,
        cover: cover,
    };
}

module.exports = {
    getVkPostInfo,
};
