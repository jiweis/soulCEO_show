// miniprogram/pages/game/music/player/player.js
var app=getApp();
var lrccode = require("../../../../comjs/lrc_code.js");
var codeUtil = require("../../../../comjs/encode.js");
var bgm = app.bgm;
var interval;
var next = true;
var n = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    radio:{},
    lrcObj:{},
    lrc_hr:"",
    playState: bgm.paused?0:1,//0:初始状态，1：播放中，2：暂停中
    animationData: {},
    radio_dynamics:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id = options.id;
    var obj = this;
    getRadio(obj,id);
    //监听背景音频自然播放结束事件
    bgm.onEnded(function(){
      obj.setData({ playState: 0 });
      clearInterval(interval);
      toplay(obj);

    });
    //监听背景音频播放进度更新事件
    bgm.onTimeUpdate(function () {
      var time = bgm.currentTime;
      if (time){
        var timeInt=parseInt(time);
        if (obj.data.lrcObj[timeInt]){
          if (obj.data.lrcObj[timeInt].trim()!=""){
            obj.setData({ lrc_hr: obj.data.lrcObj[timeInt] });
          }
          
        }
      }
    });
    bgm.onError(function(){
      obj.setData({ playState:0});
      clearInterval(interval);
    })
    bgm.onPlay(function(){
      obj.setData({ playState: 1 });
      console.log("开始播放");
      anifunc(obj);
    })
    bgm.onPause(function(){
      obj.setData({ playState: 2 });
      clearInterval(interval);
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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  toflower: function (e) {
    
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var obj = this;
    return {
      title: obj.data.radio.author+"-"+obj.data.radio.title,
      path: 'pages/game/music/player/player?id=' + obj.data.radio._id
    }
  },
  play:function(){

    if ((!bgm) || (bgm.paused)) {
      
      bgm.play();
    }
    else {
      bgm.pause();
    }
  },
  thumbsUp:function(){
    var obj=this;
    app.getuserInfo({
      isGetInfo: true,
      success: function (user) {
        obj.setData({
          user: user
        });
        //获取用户信息后
        toThumbsUp(obj, { finish:function(){
        }}, user)
      }
    });
  }, toflower:function(){
    var obj=this;
    app.getuserInfo({
      isGetInfo: true,
      success: function (user) {
        obj.setData({
          user: user
        });
        //获取用户信息后
        toflower(obj,user);
      }
    });
   
  }, getmore:function(){
    var obj=this;
    get_radio_dynamics(obj);
  }
})
function toplay(obj){
  bgm.title = obj.data.radio.title;
  bgm.epname = obj.data.radio.epname;
  bgm.singer = obj.data.radio.user_nickname;
  bgm.coverImgUrl = obj.data.radio.cover_img_url;
  bgm.webUrl = obj.data.radio.webUrl ? obj.data.radio.webUrl:"";
  // 设置了 src 之后会自动播放
  if(bgm.src != obj.data.radio.audio_src){
    bgm.src = obj.data.radio.audio_src;
  }
  bgm.appPath = '/pages/game/music/player/player?id=' + obj.data.radio._id;
  decodeLrc(obj);

}
function getRadio(obj,id){
  app.com.db.collection('radio_item').doc(id).get().then(res => {
    obj.setData({ "radio": res.data, "lrc_hr": res.data.title});
    wx.setNavigationBarTitle({
      title: res.data.title
    })
    toplay(obj);
    app.com.addSoso({
      content: res.data.author+"-《"+res.data.epname+"》"+ res.data.item_text,
      img_url: res.data.cover_img_url,
      path_url: '/pages/game/music/player/player?id=' + res.data._id,
      tags: res.data.title
    });
    get_radio_dynamics(obj);
  })
}

function decodeLrc(obj){
  var lrc = codeUtil.base64_decode(obj.data.radio.lrc_text);
  var lyric = lrccode.parseLyric(lrc);
  obj.setData({ lrcObj: lyric});

}
function toThumbsUp(obj, param,user){
  var reqData={
    user_id: user.user_id
  };
  wx.cloud.callFunction({
    // 云函数名称
    name: 'api',
    // 传给云函数的参数
    data: {
      oper_type: "radio_thumbs_up",
      radio_item_id: obj.data.radio._id,
      reqData: reqData
    },
  })
    .then(res => {
      console.log(res.result);
      if (param.finish) { param.finish(); }
      if (res.result.code == 1) {
        app.com.showToast({
          title: res.result.msg,
          icon: "success"
        });
        obj.setData({ "radio.thumbs_num": obj.data.radio.thumbs_num+1});
        var radio_dynamics = [];
        radio_dynamics.push(res.result.radio_dynamic);
        obj.data.radio_dynamics = radio_dynamics.concat(obj.data.radio_dynamics);
        obj.setData({ radio_dynamics: obj.data.radio_dynamics });
      }
      else {
        app.com.showToast({
          title: res.result.msg
        });
      }
    })
    .catch(e => {
      app.com.showToast({
        title: "暂时不能点赞，过几天再看吧哈哈。"
      });
      console.log(e);
      if (param.finish) { param.finish(); }
    })
}

function anifunc(that){
  return;
  var animation = wx.createAnimation({
    duration: 1000,
    timingFunction: 'linear'
  });
  //动画循环执行 通过next值来控制动画的两种状态轮流执行
  interval = setInterval(function () {
    n = n + 10;
    if (next) {
      animation.rotate(n).step();
      next = !next;
    } else {
      animation.rotate(n).step();
      next = !next;
    }
    that.setData({
      animationData: animation.export()
    })
  }.bind(that), 1000)
}

function toflower(obj, user){
  app.com.loading("冲鸭！拼命送花中");
  wx.cloud.callFunction({
    // 要调用的云函数名称
    name: 'api',
    // 传递给云函数的event参数
    data: {
      user_id: user.user_id,
      oper_type: "send_flower",
      radio_item_id: obj.data.radio._id
    }
  }).then(res => {
    wx.hideLoading();
    // output: res.result === 3
    if (res.result.code == 1) {
      
      app.com.showToast({
        icon: "success",
        title: res.result.msg
      });
      var radio_dynamics=[];
      radio_dynamics.push(res.result.radio_dynamic);
      obj.data.radio_dynamics = radio_dynamics.concat(obj.data.radio_dynamics);
      obj.setData({ radio_dynamics: obj.data.radio_dynamics });
    }
    else if (res.result.code==2){
      app.com.comfirm({
        msg: res.result.msg,
        confirmText:"免费领花" ,
        cancelText:"放弃",
        confirm:function(){
          wx.navigateTo({
            url: '/pages/mine/mine/account/account',
            success: function(res) {

            },
            fail: function(res) {},
            complete: function(res) {},
          })
        }

      });
    }
    else {
      app.com.showToast({
        title: res.result.msg
      });
    }
  }).catch(err => {
    wx.hideLoading();
    console.log(err);
    // handle error
    app.com.showToast({
      title: "服务器繁忙，请稍后再送花哦"
    });
  })
}
function get_radio_dynamics(obj){
  var skip=0;
  if (obj.data.radio_dynamics.length>0){
    skip = obj.data.radio_dynamics.length;
  }
  app.com.db.collection('radio_dynamic')
    .orderBy("date_add","desc")
    .where({
      radio_item_id: obj.data.radio._id
    })
    .skip(skip)
    .limit(10)
    .get()
    .then(res => {
      if (res.data.length > 0) {
        console.log(res.data);
        obj.data.radio_dynamics = res.data.concat(obj.data.radio_dynamics);
        obj.setData({ radio_dynamics: obj.data.radio_dynamics });

      }
      else{
        app.com.showToast({
          title: "没有更多啦"
        });
      }
    })
    .catch(err => {
      console.error(err)
    })
}