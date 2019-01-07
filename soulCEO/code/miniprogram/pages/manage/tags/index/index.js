const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tag_list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getTags(this)
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
  edit:function(e){
    console.log(e);
    var id = e.currentTarget.dataset.id;
    var url ="../edit/edit";
    if(id){
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
})

function getTags(obj) {
  const tags = app.com.db.collection('tags').orderBy("date_update","desc");
  tags.get({
    success: function (res) {
      console.log(res);
      obj.setData({ "tag_list": res.data });
    }
  })
}

function del(obj, id, index) {
  app.com.db.collection('tags').doc(id).remove()
    .then(res => {
      if (res.stats.removed > 0) {
        obj.data.tag_list.splice(index, 1);
        obj.setData({ tag_list: obj.data.tag_list });
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