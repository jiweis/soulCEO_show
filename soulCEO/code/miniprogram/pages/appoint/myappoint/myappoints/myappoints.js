// miniprogram/pages/appoint/myappoint/myappoints/myappoints.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    appoint_records: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getAppoints(this, false, false);
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
    wx.startPullDownRefresh({
      success: function () {
        getAppoints(obj, false, true);
      }
    });
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
    getAppoints(this, true, false);
  },
  goAppoint:function(e){
    var id = e.currentTarget.dataset.id;
    var url = "../appoint/appoint?id="+id;
    wx.navigateTo({
      url: url
    })
  },
  del: function (e) {
    var id = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    var obj = this;
    app.com.comfirm({
      msg: "你确定要删除吗", confirm: function () {
        del(obj, id, index);
      }
    });
  }
})

function getAppoints(obj, ismore, isRefresh) {
  wx.showLoading({
    title: "加载中"
  });
  app.getuserInfo({
    isGetInfo: true,
    success: function (user) {
      togetAppoints(obj, user, {
        ismore: ismore,
        isRefresh: isRefresh,
        finish: function () {
          wx.hideLoading();
        }
      })
    }
  });
}


function togetAppoints(obj, user, param) {
  var oldcount = obj.data.appoint_records ? obj.data.appoint_records.length : 0;
  var skip = 0;
  if (param.ismore) {
    skip = oldcount;
  } else {
    obj.setData({
      "appoint_records": []
    })
  }
  app.com.db.collection('appoint_records').orderBy('date', 'desc')
    .where({
      "user_id": user.user_id,
    })
    .skip(skip)
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
        res.data = res.data.concat(obj.data.appoints);
      }
      obj.setData({
        "appoint_records": res.data
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
function del(obj, id, index) {
  app.com.db.collection('appoint_records').doc(id).remove()
    .then(res => {
      if (res.stats.removed > 0) {
        obj.data.appoints.splice(index, 1);
        obj.setData({ appoints: obj.data.appoints });
        app.com.showToast({ title: "删除成功", icon: "success" });
      }
      else {
        app.com.showToast({ title: "删除失败" });
      }
    })
    .catch(err => {
      console.error;
      app.com.showToast({ title: "删除失败" });
    })
}