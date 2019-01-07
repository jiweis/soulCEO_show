// miniprogram/pages/manage/tags/edit/edit.js
var app=getApp();

const db = app.com.db;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id:"",
    tagInfo:{},
    o_type:"新增",
    showTopTips:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id=options.id;
    if (id){
      this.setData({ id: id });
      getTag(this, id);
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
  save:function(e){
    var tag = e.detail.value;
    console.log(tag);
    save(this,tag);
  }
})

function getTag(obj,id){
  const tag = db.collection('tags').doc(id);
  tag.get({
    success: function (res) {
      console.log(res);
      obj.setData({ "tagInfo": res.data });
    }
  })
}

function save(obj,tag){
  var id = obj.data.id;
  if(id){
    db.collection('tags').doc(id).update({
      data: {
        title: tag.title,
        des: tag.des,
        date_update: db.serverDate()
      }
    })
      .then(result=>{
        console.log(result);
        console.log(result.stats.updated);//更新数量
        if (result.stats.updated){
          wx.navigateBack({
            delta: 1
          })
        }
        else{

        }
      })
      .catch(console.error)
  }
  else{
    db.collection('tags').add({
      data: {
        title: tag.title,
        des: tag.des,
        date_add: db.serverDate(),
        date_update: db.serverDate()
      }
    })
      .then(res => {
        console.log(res)
        obj.setData({ id: res._id});//记录_id
        wx.navigateBack({
          delta: 1
        })
      })
      .catch(console.error)
  }
}