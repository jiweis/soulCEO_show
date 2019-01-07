// miniprogram/pages/programmer/ml/myMl/index/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mls:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
    getMls(this, false, false);
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
    getMls(obj, false, true);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  }
  ,
  lastPage: function () {
    getMls(this, true, false);
  },
  edit: function (e) {
    var id = e.currentTarget.dataset.id;
    var url = "/pages/programmer/ml/myMl/edit/edit";
    if (id) {
      url += '?id=' + id;
    }
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
  },
  detail: function (e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/programmer/ml/myMl/ml/ml?id=' + id,
    })
  }
})


function getMls(obj, ismore, isRefresh) {
  if (isRefresh == false) {
    wx.showLoading({
      title: "加载中"
    });
  }
  app.getuserInfo({
    isGetInfo: true,
    success: function (user) {
      obj.setData({user:user});
      getMyCreate(obj, user, {
        ismore: ismore,
        isRefresh: isRefresh,
        finish: function () {
          if (isRefresh == false) { wx.hideLoading(); }
        }
      })
    }
  });
}

function getMyCreate(obj, user, param) {
  var oldcount = obj.data.mls ? obj.data.mls.length : 0;
  var skip = 0;
  if (param.ismore) {
    skip = oldcount;
  } else {
    obj.setData({
      "mls": []
    })
  }
  console.log(user.user_id);
  app.com.db.collection('ml').orderBy('date_add', 'desc').where({
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
        res.data = res.data.concat(obj.data.mls);
      }
      obj.setData({
        "mls": res.data
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
  app.com.db.collection('ml').doc(id).remove()
    .then(res => {
      if (res.stats.removed > 0) {
        obj.data.mls.splice(index, 1);
        obj.setData({ mls: obj.data.mls });
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