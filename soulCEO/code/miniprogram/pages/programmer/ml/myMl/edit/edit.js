// miniprogram/pages/programmer/ml/myMl/edit/edit.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ml: {},
    showHtml: "",
    ismanage:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var id = options.id;
    var obj = this;
    if (id) {
      obj.setData({
        "ml._id": id
      });
      getMl(obj);
    }
    app.getuserInfo({
      isGetInfo: false,
      success: function (user) {
        obj.setData({
          user: user
        });
        if (user.ismanager){
          obj.setData({ ismanage:true});
        }
      }
    });
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
  edit: function(e) {
    console.log(e);
    this.setData({
      "ml.html": e.detail.value
    });
  },
  show: function(e) {
    console.log(e);
    var obj = this;
    obj.setData({
      showHtml: obj.data.ml.html
    });
  },
  save: function(e) {
    console.log(e);
    var obj = this;
    obj.setData({"ml.title":e.detail.value.title});
    if (e.detail.value.nav_url){
      obj.setData({ "ml.nav_url": e.detail.value.nav_url });
    }
    
    app.getuserInfo({
      isGetInfo: true,
      success: function(user) {
        obj.setData({
          user: user
        });
        toSave(obj);
      }
    });

  }
})

function getMl(obj) {
  app.com.db.collection('ml').doc(obj.data._id).get().then(res => {
    console.log(res.data);
    obj.setData({
      ml: res.data
    });
  })
}

function toSave(obj) {
   if (!obj.data.ml.title) {
    app.com.showToast({
      title: "还没输入标题哦"
    });
    return;
  }
  if (!obj.data.ml.html) {
    app.com.showToast({
      title: "还没输入文本哦"
    });
    return;
  }
  app.com.loading("正在保存");
  var reqData = {
    html: obj.data.ml.html,
    title: obj.data.ml.title,
    date_update: app.com.db.serverDate()
  };
  if (obj.data.ml.nav_url){
    reqData.nav_url=obj.data.ml.nav_url;
  }
  if (obj.data.ml._id) {
    app.com.db.collection('ml').doc(obj.data.ml._id).update({
        data: reqData
      })
      .then(res=>{
        console.log(res);
        wx.hideLoading();
        app.com.showToast({
          title: "保存成功",
          icon:"success"
        });
      })
      .catch(e=>{
        wx.hideLoading();
        app.com.showToast({
          title: "操作异常，请稍后再试"
        });
      })
  } else {
    reqData.user_id = obj.data.user.user_id;
    reqData.date_add = app.com.db.serverDate();
    app.com.db.collection('ml').add({
        data: reqData
      })
      .then(res => {
        console.log(res);
        wx.hideLoading();
        app.com.showToast({
          title: "保存成功",
          icon: "success"
        });
      })
      .catch(e=>{
        wx.hideLoading();
        app.com.showToast({
          title: "操作异常，请稍后再试"
        });
      })
  }
}