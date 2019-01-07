// miniprogram/pages/game/music/collects/collects.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    collects: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getCollects(this, false, false);
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
    var obj = this;
    getCollects(obj, false, true);
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
  lastPage: function () {
    getCollects(this, true, false);
  }
})

function getCollects(obj, ismore, isRefresh) {
  if (isRefresh == false) {
    wx.showLoading({
      title: "加载中"
    });
  }
  app.getuserInfo({
    isGetInfo: true,
    success: function (user) {
      toGetMyCollects(obj, user, {
        ismore: ismore,
        isRefresh: isRefresh,
        finish: function () {
          if (isRefresh == false) { wx.hideLoading(); }
        }
      })
    }
  });
}

function toGetMyCollects(obj, user, param) {
  var oldcount = obj.data.collects ? obj.data.collects.length : 0;
  var skip = 0;
  if (param.ismore) {
    skip = oldcount;
  } else {
    obj.setData({
      "collects": []
    })
  }
  if (!user.user_id){return;}
  console.log(user.user_id);
  app.com.db.collection('radio_collect').orderBy('date_add', 'desc').where({
    "user_id": user.user_id,
  }).skip(skip)
    .limit(10)
    .get()
    .then(res => {
      console.log(res.data);
      var count = res.data.length;
      if (count <= 0) {
        app.com.showToast({
          title: "别点了 没有了啦"
        });
      }
      if (param.ismore) {
        res.data = res.data.concat(obj.data.collects);
      }
      obj.setData({
        "collects": res.data
      });
      if (param.isRefresh) {
        wx.stopPullDownRefresh();
      }
      if (param.finish) {
        param.finish();
      }
    })
    .catch(err => {
      console.error(err)
    })
}