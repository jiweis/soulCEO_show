// miniprogram/pages/manage/question/theme/themes/index/index.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    theme_list: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getThemes(this, false, false);
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
        getThemes(obj, false, true);
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
    getThemes(this, true, false);
  },
  edit: function (e) {
    var id = e.currentTarget.dataset.id;
    var url = "../edit/edit";
    if (id) {
      url += '?id=' + id
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
  totheme:function(e){
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/themeDetail/themeDetail?id='+id,
    })
  },
  questionManage:function(e){
    var id = e.currentTarget.dataset.id;
    var url = "../questionManage/questionManage?theme_id=" + id;
    wx.navigateTo({
      url: url,
    })
  },
  setActive:function(e){
    var id = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    var obj=this;
    app.com.comfirm({
      msg: "你确定要设为主页吗", confirm: function () {
        activeSet(obj, true,id,index);
      }
    });
    
  },
  setNoActive:function(e){
    var id = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    var obj=this;
    app.com.comfirm({
      msg: "你确定要取消主页吗", confirm: function () {
        activeSet(obj, false,id,index);
      }
    });
  }
})

function getThemes(obj, ismore, isRefresh) {
  var oldcount = obj.data.theme_list ? obj.data.theme_list.length : 0;
  var skip = 0;
  if (ismore) {
    skip = oldcount;
  }
  else {
    obj.setData({ "theme_list": [] })
  }
  app.com.db.collection('theme').orderBy('date_update', 'desc').limit(5).skip(skip).get({
    success: function (res) {
      console.log(res.data);
      var count = res.data.length;
      if (count <= 0) {
        app.com.showToast({ title: "别点了 没有了啦" });
      }
      obj.setData({ "theme_list": res.data })
      if (isRefresh) {
        wx.stopPullDownRefresh();
      }
    }
  })
}
function del(obj, id, index) {
  app.com.db.collection('theme').doc(id).remove()
    .then(res => {
      if (res.stats.removed > 0) {
        obj.data.theme_list.splice(index, 1);
        obj.setData({ theme_list: obj.data.theme_list });
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

function activeSet(obj, isActive, id, index){
  var thisData = "theme_list[" + index + "].is_active";

  if (isActive){
    app.com.db.collection('theme').where({
      is_active: true
    }).limit(1).get().then(res => {
      if (res.data.length > 0) {
        toActiveSet(obj, false, res.data[0]._id, index,function(){
          toActiveSet(obj, isActive, id, index, function () {
            app.com.showToast({ title: "设置成功", icon: "success" });
            obj.setData({ [thisData]: true });
          })
        })
      }
      else{
        toActiveSet(obj, isActive, id, index, function () {
          app.com.showToast({ title: "设置成功", icon: "success" });
          obj.setData({ [thisData]: true });
        })
      }
    })
  }
  else{
    toActiveSet(obj, isActive, id, index,function(){
      app.com.showToast({ title: "取消成功", icon: "success" });
      obj.setData({ [thisData]: false });
    })
  }
}

function toActiveSet(obj, isActive, id, index,func){
    app.com.db.collection('theme').doc(id).update({
      data: {
        is_active: isActive
      }
    })
      .then(res => {
        func();
      })
      .catch(console.error)
  
}