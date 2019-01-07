// miniprogram/pages/manage/question/theme/themes/questionManage/questionManage.js
var app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    theme_id:"",
     question_list:[],
     themeInfo:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var obj=this;
    var theme_id = options.theme_id;
    obj.setData({ theme_id: theme_id});
    getQuestions(obj);
    getTheme(obj);
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
  add:function(e){
    var obj=this;
    wx.navigateTo({
      url: '/pages/manage/question/index/index?from_theme_id=' + obj.data.theme_id,
    })
  }
})


function getQuestions(obj){
  app.com.db.collection('theme_questions').where({
    theme_id: obj.data.theme_id 
  }).get().then(res => {
    console.log(res.data)
    obj.setData({ question_list:res.data});
  })
}

function getTheme(obj){
  app.com.db.collection('theme').doc(obj.data.theme_id).get().then(res => {
    console.log(res.data);
    obj.setData({ themeInfo: res.data });
  })
  
}
function del(obj, id, index) {
  app.com.db.collection('theme_questions').doc(id).remove()
    .then(res => {
      if (res.stats.removed > 0) {
        obj.data.question_list.splice(index, 1);
        obj.setData({ question_list: obj.data.question_list });
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