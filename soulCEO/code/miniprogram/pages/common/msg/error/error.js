// miniprogram/pages/common/msg/error/error.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title:"世界太复杂，一不小心就迷了路",
    info:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  var title=options.title;
    var info = options.info ? options.info:"";
    this.setData({ title: title,info:info});
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
  back:function(){
   wx.navigateBack({
     delta:1
   })
  },
  home:function(){
    wx.reLaunch({ url:"/pages/index/index"});
  }
})