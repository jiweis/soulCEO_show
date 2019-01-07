// miniprogram/pages/common/soso/soso/soso.js
var app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputShowed: false,
    inputVal: "",
    sosoResult:[],
    sosoState:0 //0：初始状态 1：搜索中，2：结果为空，3：搜索到内容
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var so=options.so;
    var obj=this;
    if(so==1){
      obj.setData({
        inputShowed: true
      });
    }
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
  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false
    });
  },
  clearInput: function () {
    this.setData({
      inputVal: ""
    });
  },
  inputTyping: function (e) {
    this.setData({
      inputVal: e.detail.value.trim()
    });
  },
  soso:function(e){
    var obj=this;
    obj.setData({ sosoState:1});
    soso(obj);
  }
})

function soso(obj){
  if(!obj.data.inputVal){
    obj.setData({ sosoState: 0 });
    app.com.showToast({ title: "你还没输入文字呢，如果你要搜索的话！" });
    return;
  }
  var reqData={
    "oper_type":"soso",
    "tag": obj.data.inputVal
  };
  wx.cloud.callFunction({
    // 要调用的云函数名称
    name: 'api',
    // 传递给云函数的event参数
    data: reqData
  }).then(res => {
    // output: res.result === 3
    if(res.result.code==1){
      obj.setData({ sosoResult: res.result.data });
      if(res.result.data.length>0){
        obj.setData({ sosoState: 3 });
      }
      else{
        obj.setData({ sosoState: 2 });
        }
    }
    else{
      app.com.showToast({ title: res.result.msg});
      obj.setData({ sosoState:2});
    }
  }).catch(err => {
    // handle error
    obj.setData({ sosoState: 2 });
    app.com.showToast({ title: "系统繁忙，稍后再试吧" });
  })
}