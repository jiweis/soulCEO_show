// miniprogram/pages/programmer/ml/myMl/ml/ml.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ml:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id=options.id;
    var obj=this;
    obj.setData({"ml._id":id});
    app.com.loading("加载中");
    getMl(obj);
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
  tap:function(){
    var obj=this;
    if (obj.data.ml.nav_url){
      wx.navigateTo({
        url: obj.data.ml.nav_url
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var obj=this;
    return {
      title: obj.data.ml.title,
      path: '/pages/programmer/ml/myMl/ml/ml?id=' + obj.data.ml._id
    }
  }
})

function getMl(obj){
  app.com.db.collection('ml').doc(obj.data.ml._id).get().then(res => {
    console.log(res.data);
    obj.setData({ml:res.data});
    wx.hideLoading();
    wx.setNavigationBarTitle({
      title: res.data.title
    })
  })
}