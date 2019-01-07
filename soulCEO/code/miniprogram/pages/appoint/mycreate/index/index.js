// miniprogram/pages/appoint/mycreate/index/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    appoints: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    getAppoints(this, false, false);
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
    var obj = this;
    getAppoints(obj, false, true);
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

  },
  lastPage: function() {
    getAppoints(this, true, false);
  },
  edit: function (e) {
    var id = e.currentTarget.dataset.id;
    var url = "../edit/edit";
    if (id) {
      url += '?id=' + id;
      var reserve_num = e.currentTarget.dataset.reserve_num;
      if (reserve_num){
        app.com.showToast({
          title: "已经有人预约，不能再修改"
        });
        return;
      }
    }
    wx.navigateTo({
      url: url
    })
  },
  del:function(e){
    var id = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    var obj=this;
    app.com.comfirm({
      msg: "你确定要删除吗", confirm:function(){
      del(obj,id,index);
    }});
  },
  detail:function(e){
    var id=e.currentTarget.dataset.id;
      wx.navigateTo({
        url: '/pages/appoint/myappoint/appoint/appoint?id='+id,
      })
  }
})

function getAppoints(obj, ismore, isRefresh) {
  if (isRefresh == false) {
    wx.showLoading({
      title: "加载中"
    });}
  app.getuserInfo({
    isGetInfo: true,
    success: function(user) {
      getMyCreate(obj, user, {
        ismore: ismore,
        isRefresh: isRefresh,
        finish: function() {
          if (isRefresh == false) { wx.hideLoading();} 
        }
      })
    }
  });
}

function getMyCreate(obj, user, param) {
  var oldcount = obj.data.appoints ? obj.data.appoints.length : 0;
  var skip = 0;
  if (param.ismore) {
    skip = oldcount;
  } else {
    obj.setData({
      "appoints": []
    })
  }
  console.log(user.user_id);
  app.com.db.collection('appoint_appointment').orderBy('date_add', 'desc').where({
      "appoint_user_info.user_id": user.user_id,
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
      if(param.ismore){
        res.data = res.data.concat(obj.data.appoints);
      }
      obj.setData({
        "appoints": res.data
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
function del(obj,id,index){
  app.com.db.collection('appoint_appointment').doc(id).remove()
    .then(res=>{
      if (res.stats.removed>0){
        obj.data.appoints.splice(index, 1);
        obj.setData({ appoints: obj.data.appoints});
        app.com.showToast({ title: "删除成功", icon:"success"});
      }
      else{
        app.com.showToast({ title: "删除失败"});
      }
    })
    .catch(err=>{
      console.error;
      app.com.showToast({ title: "删除失败" });
    })
}