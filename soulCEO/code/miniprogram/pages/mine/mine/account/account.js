// miniprogram/pages/mine/mine/account/account.js
var app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    system_para: {},
    GotFlower:false,
    UserAccount: {"flower_num":"-"}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   var obj=this;
    getsystemPara(obj);
    app.getuserInfo({
      isGetInfo: true,
      success: function (user) {
        obj.setData({
          user: user
        });
        //获取用户信息后
        getUserAccount(obj, user);
      }
    });
   
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  getFlower:function(){
    var obj=this;
    app.getuserInfo({
      isGetInfo: true,
      success: function (user) {
        obj.setData({
          user: user
        });
        //获取用户信息后
        togetFlower(obj,user);
      }
    });
    
  }
})


function getsystemPara(obj) {
  app.com.db.collection('system_para')
    .limit(1)
    .get()
    .then(res => {
      if (res.data.length > 0) {
        var systempara = res.data[0];
        obj.setData({ system_para: systempara });
      }

    })
    .catch(err => {
      console.error(err)
    })
}

function getUserAccount(obj, user) {
  if(!user.user_id){
    console.log("用户信息错误");
    return;
  }
  app.com.db.collection('user_account')
    .limit(1)
    .where({
      user_id:user.user_id
    })
    .get()
    .then(res => {
      if (res.data.length > 0) {
        var UserAccount = res.data[0];
        obj.setData({ UserAccount: UserAccount });
        var nowdate = app.com.dateFtt("yyyy-MM-dd",new Date());
        var lastdate = app.com.dateFtt("yyyy-MM-dd", UserAccount.date_update);
        console.log("lastdate:" + lastdate + ",nowdate:" + nowdate);
        if (nowdate == lastdate){
          obj.setData({ GotFlower: true });
        }
        else{
          obj.setData({ GotFlower: false });
        }
      }
      else{
        obj.setData({ GotFlower:false});
      }

    })
    .catch(err => {
      console.error(err)
    })
}

function togetFlower(obj,user){
  app.com.loading("正在拼命领取鲜花！冲鸭！！！");
  wx.cloud.callFunction({
    // 要调用的云函数名称
    name: 'api',
    // 传递给云函数的event参数
    data: {
      user_id:user.user_id,
      oper_type:"get_flower"
    }
  }).then(res => {
    wx.hideLoading();
    // output: res.result === 3
    if(res.result.code==1){
      var flower_num = res.result.flower_num;
      app.com.showToast({
        icon:"success",
        title: res.result.msg
      });
      app.getuserInfo({
        isGetInfo: true,
        success: function (user) {
          obj.setData({
            user: user
          });
          //获取用户信息后
          getUserAccount(obj, user);
        }
      });
    }
    else{
      app.com.showToast({
        title: res.result.msg
      });
    }
  }).catch(err => {
    wx.hideLoading();
    console.log(err);
    // handle error
    app.com.showToast({
      title: "服务器繁忙，请稍后再领鲜花哦"
    });
  })
}