//app.js
App({
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }

    this.updateManager = wx.getUpdateManager()//jewei_hasUpdate:有更新,jiwei_haddup:更新下载完成,applyUpdate():重启方法
    this.com = require("/common.js")
    this.bgm = wx.getBackgroundAudioManager()
    getUser(this,{});
    appUpdate(this);
  },
  getuserInfo: function (param) { //param参数：isGetInfo（是否获取userInfo），success（成功回调：user+userInfo的合并对象）
     var obj=this;
    if (obj.user.user_id){
      haveUserLater(obj,param);
    }
    else{
      getUser(this, param);
    }
  },
  user: { "user_id": "", "ismanager":false},
  userInfo: { "nickName": "", "avatarUrl": "", "gender": "", "city": "", "province": "", "country": "","language":""}
})

function haveUserLater(obj,param){
  if (param.isGetInfo) {
    if (obj.userInfo.nickName) {
      if (param.success){
        param.success(Object.assign(obj.user, obj.userInfo));
      }
    }
    else {
      obj.com.isauth({
        success: function () {
          //授权成功
          obj.com.userInfoUp({
            app: obj,
            success: function () {
              if (param.success){
                param.success(Object.assign(obj.user, obj.userInfo));
              }
            }
          });
        }
      });
    }
  }
  else {
    if (param.success){ param.success(obj.user);}
  }
}

function getUser(obj, param)
{
  try {
    var value = wx.getStorageSync('user')
    if (value && value.user_id) {
      var appInstance = obj;
      appInstance.user = { user_id: value.user_id, ismanager: value.ismanager };
      if (param.isGetInfo){
        haveUserLater(obj,param);
      }
      else{
        if (param.success){param.success(appInstance.user);}
      }
    }
    else{
      userUp(obj, param);
    }
  } catch (e) {
    userUp(obj, param);
  }

} 
function userUp(obj, param)
{
   wx.cloud.callFunction({
    name: 'upUserInfo',
    data: {},
    complete: res => {
      console.log('callFunction test result: ', res);
      wx.setStorage({
        key: "user",
        data: { user_id: res.result.user_id, ismanager: res.result.ismanager }
      })
      var appInstance = obj;
      appInstance.user = { user_id: res.result.user_id, ismanager: res.result.ismanager };
      if (param.isGetInfo){
        haveUserLater(obj, param);
      }
      else{
        if (param.success){param.success(appInstance.user);}
      }
      
    },
  }) 
}

function appUpdate(app){
  app.updateManager.onCheckForUpdate(function (res) {
    // 请求完新版本信息的回调
    console.log("新版本:"+res.hasUpdate);
    app.updateManager.jewei_hasUpdate = res.hasUpdate;
  })

  app.updateManager.onUpdateReady(function () {
    if (app.updateManager.jewei_hasUpdate){
      app.updateManager.jiwei_haddup=true;
    }
    
  })

  app.updateManager.onUpdateFailed(function () {
    // 新版本下载失败
  })
}