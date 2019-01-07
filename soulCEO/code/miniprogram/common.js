const db = wx.cloud.database({
  config: {
    env: 'weina'
  }
})
var common = {
  alert: alert, //弹出框
  _alert: _alert,
  comfirm: comfirm, //弹出确认框
  showToast: showToastfunc, //提示消息
  userInfoUp: userInfoUp,//用户信息保存
  isauth: isauth,
  db: db,
  loading:loading,
  dateFtt: dateFtt,//时间格式化
  addHistory: addHistory,
  addSoso: addSoso
};
function loading(msg){
  wx.showLoading({
    title: msg,
    mask: true
  });
}
//显示消息提示框
function showToastfunc(json) {
  wx.showToast({
    title: json.hasOwnProperty("title") ? json.title : "操作成功",
    icon: json.hasOwnProperty("icon") ? json.icon : 'none',
    duration: 2000
  })
}
function _alert(param) {
  wx.showModal({
    confirmColor: '#B22222',
    title: param.title ?param.title:"",
    content: param.msg ? param.msg :"",
    confirmText: param.confirm_text ? param.confirm_text:"我知道了",
    showCancel: false,
    success: function () {
      if (param.success) {
        param.success();
      }
    }
  })
}
function alert(msg, func) {
  wx.showModal({
    confirmColor: '#B22222',
    content: msg,
    showCancel: false,
    success: function () {
      if (func) {
        func();
      }
    }
  })
}
//确认框
function comfirm(json) {
  wx.showModal({
    confirmColor: '#B22222',
    confirmText: json.confirmText ? json.confirmText:"确定",
    cancelText: json.cancelText ? json.cancelText:"取消",
    content: json.msg,
    success: function (res) {
      if (res.confirm&&json.confirm) {
        json.confirm();
      } else if (res.cancel && json.cancel) {
        json.cancel();
      }
    }
  })
}
//查询是否授权，没授权会进行授权  json参数：nogo_auth（不跳转到授权页面）， success（成功回调函数）
function isauth(json)
{
  // 查看是否授权
  wx.getSetting({
    success: function (res) {
      if (res.authSetting['scope.userInfo']) {
        // 已经授权，可以直接调用 getUserInfo 获取头像昵称
        if (json.success){json.success();}
      }
      else if (!json.nogo_auth)
      {
          wx.navigateTo({
            url: '/pages/user/login/login'
          })
      }
    },
    fail:function()
    {
      if (!json.nogo_auth){
        wx.navigateTo({
          url: '/pages/user/login/login'
        })
      }
    }
  })
}
function userInfoUp(json)
{
  var app;
  if (json.app){
    app = json.app;
  }
  else{
    app = getApp();
  }
  var user_id = app.user.user_id;
  if(!user_id)
  {
    common.showToast({
      title: "请重新进入小程序",
      icon: 'none'
    })
    return;
  }
  wx.getUserInfo({
    success: function (res) {
      var res_userInfo = res.userInfo;
      //保存用户信息
      db.collection('user').doc(user_id).update({
        data: {
          nick_name: res.userInfo.nickName,
          avatar_url: res.userInfo.avatarUrl,
          gender: res.userInfo.gender,
          city: res.userInfo.city,
          province: res.userInfo.province,
          country: res.userInfo.country,
          language: res.userInfo.language,
          date_update: db.serverDate()
        }
      })
        .then(console.log)
        .catch(console.error)
      app.userInfo = res_userInfo;

      if (json.success){json.success();}
    },
    fail: function () {
      wx.navigateTo({
        url: '/pages/user/login/login'
      })
    }
  })
}
function dateFtt(fmt, date) { //author: meizz   
  var o = {
    "M+": date.getMonth() + 1,                 //月份   
    "d+": date.getDate(),                    //日   
    "h+": date.getHours(),                   //小时   
    "m+": date.getMinutes(),                 //分   
    "s+": date.getSeconds(),                 //秒   
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度   
    "S": date.getMilliseconds()             //毫秒   
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
} 
function addHistory(param){
  db.collection('mytools').where({
    user_id: param.user.user_id,
    url: param.url
  }).get().then(res => {
    if (res.data.length > 0) {
      db.collection('mytools').doc(res.data[0]._id).update({
        data: {
          "ico": param.ico,
          "title": param.title,
          "date_update:": db.serverDate(),
          "timestamp_update": new Date().getTime()
        }
      })
        .then(console.log)
        .catch(console.error)
    }
    else {
      db.collection('mytools').add({
        data: {
          "ico": param.ico,
          "title": param.title,
          "url": param.url,
          "date_add": db.serverDate(),
          "date_update:": db.serverDate(),
          "user_id": param.user.user_id,
          "timestamp_update": new Date().getTime()
        }
      })
        .then(res => {
          console.log(res)
        })
        .catch(console.error)
    }
  })


}

function addSoso(param) {
  db.collection('soso').where({
    path_url: param.path_url
  }).get().then(res => {
    if (res.data.length > 0) {
      db.collection('soso').doc(res.data[0]._id).update({
        data: {
          "content": param.content,
          "img_url": param.img_url,
          "path_url": param.path_url,
          "tags": param.tags,
          "date_update:": db.serverDate(),
          "timestamp_update": new Date().getTime()
        }
      })
        .then(console.log)
        .catch(console.error)
    }
    else {
      db.collection('soso').add({
        data: {
          "content": param.content,
          "img_url": param.img_url,
          "path_url": param.path_url,
          "tags": param.tags,
          "date_add": db.serverDate(),
          "date_update:": db.serverDate(),
          "timestamp_update": new Date().getTime()
        }
      })
        .then(res => {
          console.log(res)
        })
        .catch(console.error)
    }
  })


}

module.exports = common;