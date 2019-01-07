// miniprogram/pages/manage/question/index/index.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    question_list: [],
    from_theme:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var obj=this;
    var from_theme_id = options.from_theme_id;
    getQuestions(this, false, false);
    if (from_theme_id){
      getThemeInfo(obj, from_theme_id);
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
    var obj = this;
    wx.startPullDownRefresh({
      success: function () {
        getQuestions(obj, false, true);
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
    getQuestions(this, true, false);
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
  addToTheme:function(e){
    var obj=this;
    var question_id = e.currentTarget.dataset.id;
    var question_index = e.currentTarget.dataset.index;
    app.com.comfirm({ msg: "确定要将该问题添加到主题吗", confirm:function(){
      toAddToTheme(obj, question_id, question_index);
    }});
    
  }
})

function getQuestions(obj, ismore, isRefresh) {
  var oldcount = obj.data.question_list?obj.data.question_list.length:0;
  var skip = 0;
  if (ismore) {
    skip = oldcount;
  }
  else {
    obj.setData({ "question_list": [] })
  }
  app.com.db.collection('question').orderBy('date_update', 'desc').limit(5).skip(skip).get({
    success: function (res) {
      console.log(res.data);
      var count = res.data.length;
      if(count<=0){
        app.com.showToast({title:"别点了 没有了啦"});
      }
      obj.setData({ "question_list": res.data })
      if (isRefresh) {
        wx.stopPullDownRefresh();
      }
    }
  })
}
function del(obj, id, index) {

  wx.cloud.callFunction({
    // 云函数名称
    name: 'question',
    // 传给云函数的参数
    data: {
      oper_type: "del",
      question_id: id
    },
  })
    .then(res => {
      console.log(res.result);
      if (res.result.code==1){
        obj.data.question_list.splice(index, 1);
        obj.setData({ question_list: obj.data.question_list });
        app.com.showToast({ title: "删除成功", icon: "success" });
      }else{
        app.com.showToast({ title: res.result.msg });
      }
    })
    .catch(error=>{
      console.log(error);
      app.com.showToast({ title: "删除失败" });
    }) 
}

function getThemeInfo(obj,themeid){
  app.com.db.collection('theme').doc(themeid).get().then(res => {
    console.log(res.data);
    obj.setData({ from_theme:res.data});
  })
}

function toAddToTheme(obj, question_id, question_index){
//获取选项
  app.com.db.collection('option').where({
    question_id: question_id
  }).get().then(res => {
    console.log(res.data);
    var options = res.data;
    var reqOption=[];
    for (var i=0;i<options.length;i++){
      reqOption.push({
        "code": options[i].code,
        "option_id": options[i]._id,
        "title": options[i].title
      });
    }
//设置
    app.com.db.collection('theme_questions').add({
      data: {
        "question_id": question_id,
        "theme_id": obj.data.from_theme._id,
        "question_title": obj.data.question_list[question_index].title,
        "option": reqOption,
        "only_user_id": obj.data.question_list[question_index].only_user_id,
        "only_user_remark": obj.data.question_list[question_index].only_user_remark
      }
    })
      .then(res => {
        console.log(res);
        app.com.showToast({ title: "添加成功" });
      })
      .catch(console.error)

  })

 
}