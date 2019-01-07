//index.js
var app = getApp()

Page({
  data: {
    system_para:{},
    mytools:[],
    screenHeight:"100%",
    bgmObj:{},
    update:false
  },

  onLoad: function() {
    var obj=this;
    getwith(obj);
    getsystemPara(obj);
    Object.defineProperty(app.updateManager, 'jiwei_haddup', {
      get: function () {
        return jiwei_haddup;
      },
      set: function (jiwei_haddup) {
        //需要触发的渲染函数可以写在这...
        if (jiwei_haddup) {
          obj.setData({ update: true });
        }
      }
    })
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
    var obj = this;
    getMusic(obj);
  },
   toUpdate:function(){
     app.updateManager.applyUpdate();
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
  goMusic:function(){
    var obj=this;
    goMusic(obj);
  },
  soso:function(){
    wx.navigateTo({
      url: '/pages/common/soso/soso/soso?so=1',
    })
  },
  
  appointCheck:function(){
    wx.showActionSheet({
      itemList:["发起课程预约","发起练车预约"],
      itemColor:"#B22222",
      success:function(res){
        if (res.tapIndex==0){
          wx.navigateTo({
            url: '/pages/appoint/mycreate/edit/edit?appoint_type_id=W65W9fq2yFoOSar6',
          })
        }
        else if(res.tapIndex==1){
            wx.navigateTo({
              url: '/pages/appoint/mycreate/edit/edit?appoint_type_id=W63yFtxKEB7Bj6sB',
            })
        }
        else{
          app.com.showToast({title:"该类型的预约暂未开放"});
        }
      }
    });
  }
})


function getsystemPara(obj){
  app.com.db.collection('system_para').orderBy('menus.orderby', 'asc')
    .limit(1)
    .get()
    .then(res => {
      if (res.data.length>0){
        var systempara = res.data[0];
        systempara.menus = systempara.menus.filter(function(ev){
          return ev.is_show;
        });
        obj.setData({ system_para: systempara});
        if (systempara.show_mytools){
          getMytools(obj);
        }
        getwith(obj);
      }
      
    })
    .catch(err => {
      console.error(err)
    })
}

function getMytools(obj){
  app.getuserInfo({
    success: function (user) {
      app.com.db.collection('mytools').orderBy('timestamp_update', 'desc')
        .where({
          user_id: user.user_id
        }).limit(15)
        .get()
        .then(res => {
          if (res.data.length > 0) {
            var mytools = res.data;
            obj.setData({ mytools: mytools });
            getwith(obj);
          }

        })
        .catch(err => {
          console.error(err)
        })
    }
  });
  
}

function getwith(obj){
  try {
    const res = wx.getSystemInfoSync()
    console.log("res.windowHeight:"+res.windowHeight)
    obj.setData({ "screenHeight": res.windowHeight+"px"});
  } catch (e) {
    // Do something when catch error
  }
}
function getMusic(obj){
  obj.setData({ "bgmObj": { "src": app.bgm.src, "title": app.bgm.title, "appPath": app.bgm.appPath}});
}
function goMusic(obj){
  wx.navigateTo({
    url: obj.data.bgmObj.appPath,
  })
}