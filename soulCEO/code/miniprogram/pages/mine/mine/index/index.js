// miniprogram/pages/mine/mine/index/index.js
var app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    system_para:{},
    UserAccount: {"flower_num":"-"}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var obj=this;
    getsystemPara(obj);
   
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
    var obj=this;
    app.getuserInfo({
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
  manage: function () {
    app.getuserInfo({
      success: function (user) {
        if (user.ismanager) {
          wx.navigateTo({
            url: '/pages/manage/manage/manage'
          })
        }
      }
    });
  },
})


function getsystemPara(obj) {
  app.com.db.collection('system_para').orderBy('menus.orderby', 'asc')
    .limit(1)
    .get()
    .then(res => {
      if (res.data.length > 0) {
        var systempara = res.data[0];
        systempara.my_menus = systempara.my_menus.filter(function (ev) {
          return ev.is_show;
        });
        obj.setData({ system_para: systempara });
      }

    })
    .catch(err => {
      console.error(err)
    })
}


function getUserAccount(obj, user) {
  if (!user.user_id) {
    console.log("用户信息错误");
    return;
  }
  app.com.db.collection('user_account')
    .limit(1)
    .where({
      user_id: user.user_id
    })
    .get()
    .then(res => {
      if (res.data.length > 0) {
        var UserAccount = res.data[0];
        obj.setData({ UserAccount: UserAccount });
        var nowdate = app.com.dateFtt("yyyy-mm-dd", new Date());
        var lastdate = app.com.dateFtt("yyyy-mm-dd", UserAccount.date_update);
        if (nowdate == lastdate) {
          obj.setData({ GotFlower: true });
        }
        else {
          obj.setData({ GotFlower: false });
        }
      }
      else {
        obj.setData({ GotFlower: false });
      }

    })
    .catch(err => {
      console.error(err)
    })
}