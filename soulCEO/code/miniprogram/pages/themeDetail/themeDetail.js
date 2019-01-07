// miniprogram/pages/themeDetail/themeDetail.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    themeInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var id = options.id;
    var obj = this;
    if (options.scene) {
      const scene = decodeURIComponent(options.scene)
      console.log("二维码：" + scene);
      loadcode(obj, {
        scene: scene,
        success: function(theme_id) {
          getThemeInfo(obj, theme_id);
        }
      });
    } else {
      getThemeInfo(obj, id);
    }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    var obj = this;
    return {
      title: obj.data.themeInfo.title
    }
  },
  totest: function() {
    var id = this.data.themeInfo._id;
    app.com.isauth({
      success: function() {
        wx.navigateTo({
          url: '../question/question?id=' + id
        })
      }
    });

  }
})

function loadcode(obj, param) {
  app.com.db.collection('wx_acode').where({
    page: 'pages/themeDetail/themeDetail',
    scene_md5: param.scene
  }).get().then(res => {
    console.log(res.data);
    if (res.data.length > 0) {
      var json = JSON.parse(res.data[0].scene);
      if (param.success) {
        param.success(json.theme_id);
      }
    } else {
      app.com._alert({
        title:"让我睡会儿~",
        msg: "不巧，你来的不是时候，该功能正在睡觉...",
        success: function() {
          wx.reLaunch({
            url: "/pages/index/index"
          });
        },
        confirm_text: "去首页看看"
      });
    }
  })
}

function getThemeInfo(obj, id) {
  if (id) {

    const themes = app.com.db.collection('theme').doc(id);
    themes.get({
      success: function(res) {
        console.log(res);
        obj.setData({
          "themeInfo": res.data
        });
        wx.setNavigationBarTitle({
          title: res.data.title
        });
      }
    })
  } else {
    app.com.db.collection('theme').where({
      is_active: true
    }).limit(1).get().then(res => {
      console.log(res);
      if (res.data.length > 0) {

        obj.setData({
          "themeInfo": res.data[0]
        });
        wx.setNavigationBarTitle({
          title: res.data[0].title
        });
      } else {
        app.com._alert({
          title: "让我睡会儿~",
          msg: "不巧，你来的不是时候，该功能正在睡觉...",
          confirm_text: "去首页",
          success: function() {
            wx.reLaunch({
              url: "/pages/index/index"
            });
          }
        });
      }
    })

  }
}