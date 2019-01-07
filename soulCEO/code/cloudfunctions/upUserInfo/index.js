// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  var appId = event.userInfo.appId;
  var openId = event.userInfo.openId;
  var userInfos = [];
  try {
    var res = await db.collection('user').where({
      _openid: openId,
      appid: appId
    }).get()
    console.log("searchresdata："+JSON.stringify(res));
    if (res.data.length>0)
    {
      userInfos.push({ "user_id": res.data[0]._id, "ismanager": res.data[0].ismanager ? true:false });
    }
  } catch (e) {
    console.error(e)
  }
  if (userInfos.length > 0) {
    return { "user_id": userInfos[0].user_id, "ismanager": userInfos[0].ismanager }
  }
  else {
    try {
      var res = await db.collection('user').add({
        data: {
          appid: appId,
          _openid: openId,
          date_add: db.serverDate(),
          date_update: db.serverDate()
        }
      })
      console.log("addresdata:"+JSON.stringify(res));
      userInfos.push({ "user_id": res._id, "ismanager":false});
      console.log("userInfos：" + JSON.stringify(userInfos));
    } catch (e) {
      console.error(e)
    }
    console.log("userInfos：" + JSON.stringify(userInfos));
    return { "user_id": userInfos[0].user_id, "ismanager": userInfos[0].ismanager }
  }
}