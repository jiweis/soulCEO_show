// miniprogram/pages/testResult/testResult.js
var app = getApp();
var ranColors = [{ idx: 0, backcolor: "#A83A3A", navFrontColor: "#ffffff" }, { idx: 1, backcolor: "#66CDAA", navFrontColor: "#ffffff" }, { idx: 2, backcolor: "#9A32CD", navFrontColor: "#ffffff" }, { idx: 3, backcolor: "#8B0A50", navFrontColor: "#ffffff" }, { idx: 4, backcolor: "#32CD32", navFrontColor: "#ffffff" }, { idx: 5, backcolor: "#CD5555", navFrontColor: "#ffffff" }, { idx: 6,  backcolor: "#6495ED", navFrontColor: "#ffffff" }]
Page({

  /**
   * 页面的初始数据
   */
  data: {
    record:{},
    user:{},
    opershow:true,
    acode:"",
    ranColor: ranColors[0],
    system_para:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var obj=this;
    var record_id = options.record_id;
    app.com.loading("加载中");
    getRecord(this, record_id);

    app.getuserInfo({
      isGetInfo: true,
      success: function (user) {
        obj.setData({
          user:user
        });
      }
    });
    wx.onUserCaptureScreen(function () {
      app.com.showToast({ title: "截屏成功了诶" });
    });
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var obj=this;
    return {
      title: obj.data.record.theme_title,
      path: '/pages/themeDetail/themeDetail?id=' + obj.data.record.theme_id
    }
  },
  showacode:function(){
    return;
    var obj=this;
    var acode = obj.data.acode;
    wx.previewImage({ urls: [acode]});
  },
  acodeError:function(){
    var obj=this;
    if (obj.data.acode!=""){
      app.com.loading("加载中");
      getACode(obj,true);
    }  
  },
  save:function(){
    this.setData({ opershow:false});
    app.com._alert({msg:"你可以使用手机截屏保存到相册"});
  }, changeoper:function(){
    if (this.data.opershow){
      this.setData({ opershow: false });
    }
    else{
      this.setData({ opershow: true });
    }
  }
})

function getRecord(obj, record_id)
{
  app.com.db.collection('answer_record').doc(record_id).get().then(res => {
    console.log(res.data);
    obj.setData({ "record": res.data});
    wx.setNavigationBarTitle({ title: obj.data.record.theme_title + '：' + res.data.nick_name });
    
    var ran = res.data.ran ? res.data.ran:0;
    
    ran = ran >= ranColors.length?0:ran;
    obj.setData({ ranColor: ranColors[ran]});
    wx.setNavigationBarColor({ backgroundColor: obj.data.ranColor.backcolor, frontColor: obj.data.ranColor.navFrontColor });
    wx.setBackgroundColor({ backgroundColor: obj.data.ranColor.backcolor });

    getsystemPara(obj);
    
  })
}


function getACode(obj,isCodeErr){
  if (isCodeErr == false && obj.data.record.acode_fileid){
    obj.setData({ acode: obj.data.record.acode_fileid});
    wx.hideLoading();
    return;
  }
  wx.cloud.callFunction({
    // 要调用的云函数名称
    name: 'wxAcode',
    // 传递给云函数的event参数
    data: {
      page: "pages/themeDetail/themeDetail",
      acode_scene: "{\"theme_id\":\"" + obj.data.record.theme_id+"\"}",
      acode_table:"answer_record",
      acode_table_id: obj.data.record._id,
      acode_field:"acode_fileid"
    }
  }).then(res => {
    // output: res.result === 3
    console.log("获取小程序码结果：");
    console.log(res);

    if (res.result.code==1){
      obj.setData({ acode: res.result.acode_cloud_id});
    }
    else{
        
    }
    wx.hideLoading();
  }).catch(err => {
    // handle error
    console.log("获取小程序码出错：");
    console.log(err);
    wx.hideLoading();
  })
}




function getsystemPara(obj) {
  app.com.db.collection('system_para')
    .limit(1)
    .get()
    .then(res => {
      if (res.data.length > 0) {
        var systempara = res.data[0];
        obj.setData({ system_para: systempara });
        if (systempara.isOpenAcode){
          getACode(obj, false);
        }
        
      }
      else{
        wx.hideLoading();
      }

    })
    .catch(err => {
      console.error(err)
    })
}