// miniprogram/pages/qa/poQa/poQa/poQa.js
var app=getApp();
var innerAudioContext = wx.createInnerAudioContext();
var playDy = [{text:"∙",padd:31.94}, {text:"﹙∙",padd:15.97},{text:"（﹙∙",padd:0}];
var formid;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    homeInfo:{},
    q_all_len:200,
    q_this_len:0,
    QAs:[],
    thisQTitle:"",
    user:{},
    playAudio: { index: -1, text: playDy[2].text, playtext: playDy[2].text, padd: 0, stat: 0 },//stat 1:加载中 2：可以播放
    home_id:"",
    scene:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ home_id: options.home_id, scene: options.scene ? options.scene:""});
    var home_id = options.home_id;
    var obj = this;
    if (options.scene) {
      const scene = decodeURIComponent(options.scene)
      console.log("二维码：" + scene);
      loadcode(obj, {
        scene: scene,
        success: function (home_id) {
          getHomeInfo(obj, home_id);
        }
      });
    }
    else { getHomeInfo(obj, home_id); }
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
  getmore:function(){
    var obj=this;
    getQA(obj);
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
   toPlay:function(e){
     var obj=this;
     var index = e.currentTarget.dataset.index;
     play(obj,index);
   },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var obj=this;
    return {
      title: '我问' +obj.data.homeInfo.po_nick_name
    }
  },
  qChange:function(e){
    var value=e.detail.value;
     var obj=this;
    obj.setData({ q_this_len:value.length});
    obj.data.thisQTitle=value;
  },
  toQ:function(e){
    var obj=this;
    formid = e.detail.formId;
    console.log("formid:" + formid);
    if (!formid) {
      app.com.showToast({
        title: "操作异常，请稍后再试哦"
      });
      return;
    }
    app.getuserInfo({
      isGetInfo: true,
      success: function (user) {
        obj.setData({
          user: user
        });
        toQ(obj);
      }
    });
   
  }
})

function getHomeInfo(obj,homeid){
  app.com.db.collection('qa_home').doc(homeid).get().then(res => {
    console.log(res.data);
    obj.setData({homeInfo:res.data});
    wx.setNavigationBarTitle({ title: "我问"+res.data.po_nick_name});
    getQA(obj);

    app.getuserInfo({
      success: function (user) {
        app.com.addHistory({
          user: user,
          url: "/pages/qa/poQa/poQa/poQa?home_id=" + obj.data.homeInfo._id,
          ico: obj.data.homeInfo.po_avatar_url,
          title: "我问" + obj.data.homeInfo.po_nick_name
        });
        app.com.addSoso({
          content: obj.data.homeInfo.des,
          img_url: obj.data.homeInfo.po_avatar_url,
          path_url: "/pages/qa/poQa/poQa/poQa?home_id=" + obj.data.homeInfo._id,
          tags: "我问" + obj.data.homeInfo.po_nick_name
        });
      }
    });
    
  })
}
function play(obj, index) {
  console.log(innerAudioContext.paused);
  if (obj.data.playAudio.stat == 1){return;}
  if (obj.data.playAudio.index == index && obj.data.QAs[index].answer_url== innerAudioContext.src){
    console.log("音源没变：" + index);
    if (innerAudioContext.paused == false) {
      innerAudioContext.stop();
      console.log("已停止");
      return;
    }

    innerAudioContext.play();
  }
  else {
    console.log("音源变了：" + index);
    if (innerAudioContext.paused == false) {
      innerAudioContext.stop();
      console.log("已停止");
    }
    else{
      obj.setData({ playAudio: { index: -1, text: playDy[2].text, playtext: playDy[2].text, padd: 0, stat: 0 } });
      innerAudioContext.destroy();
      innerAudioContext = wx.createInnerAudioContext();
      listenPlay(obj);
      obj.setData({ "playAudio.index": index });
      obj.setData({ "playAudio.stat": 1 });
      toplay(obj);
    }
   
  }
  
}
function toplay(obj){
  innerAudioContext.autoplay = true;
  innerAudioContext.obeyMuteSwitch = false;
  innerAudioContext.src = obj.data.QAs[obj.data.playAudio.index].answer_url;
  if (innerAudioContext.paused) {
    innerAudioContext.play();
  }
}

function listenPlay(obj){
  innerAudioContext.onPlay(() => {
    console.log('开始播放');
    onInterval(obj);
  })
  innerAudioContext.onCanplay(() => {
    console.log("可以播放");
  })
  innerAudioContext.onEnded(() => {
    console.log('停止播放');
    obj.setData({ "playAudio.text": playDy[2].text, "playAudio.playtext": playDy[2].text, "playAudio.padd": playDy[2].padd, "playAudio.stat":0});
  })
  innerAudioContext.onStop(() => {
    console.log('停止播放');
    obj.setData({ "playAudio.text": playDy[2].text, "playAudio.playtext": playDy[2].text, "playAudio.padd": playDy[2].padd, "playAudio.stat": 0 });
  })
  innerAudioContext.onError((res) => {
    console.log(res.errMsg)
    console.log(res.errCode)
  })
}

function getQA(obj){
  var skip=0;
  skip = obj.data.QAs.length;
  const _ = app.com.db.command;
  app.com.db.collection('qa')
    .where({
      home_id: obj.data.homeInfo._id,
      answer_user_id: _.neq(null)
    }).orderBy('date_answer', 'desc')
    .skip(skip)
    .limit(10)
    .get()
    .then(res => {
      console.log(res.data);
      if (res.data.length<=0){
        app.com.showToast({
          title: "没有更多了哦"
        });
        return;
      }
      obj.data.QAs=obj.data.QAs.concat(res.data);
      obj.setData({ QAs: obj.data.QAs});
    })
    .catch(err => {
      console.error(err)
    })
}
function onInterval(obj){
  var i = 0;
   var playTimer = setInterval(function () {
    if (i > playDy.length - 1) { i = 0; }
     console.log("计时状态：" + innerAudioContext.paused);
     if (innerAudioContext.paused) { clearInterval(playTimer);return;}
     obj.setData({ "playAudio.text": playDy[2].text, "playAudio.playtext": playDy[i].text, "playAudio.padd": playDy[i].padd, "playAudio.stat": 2 });
    i = i + 1;
   }, 500, obj.data.playAudio.index);
}
function toQ(obj){
  var thisQTitle = obj.data.thisQTitle;
  if (!thisQTitle){
    app.com.showToast({
      title: "你还没输入提问内容呢"
    });
    return;
  }
  if (thisQTitle.replace(/\s+/g, "").length<=0) {
    app.com.showToast({
      title: "你还没输入提问内容呢"
    });
    return;
  }
  if (!obj.data.user.user_id){
    app.com.showToast({
      title: "你还没登录呢"
    });
    return;
  }
  if (obj.data.homeInfo.user_id == obj.data.user.user_id){
    app.com.showToast({
      title: "不能自己给自己提问哦"
    });
    return;
  }
  app.com.loading("正在提交...");
  var reqData={
    "home_id": obj.data.homeInfo._id,
    "question_title": thisQTitle,
    "question_user_id": obj.data.user.user_id,
    "question_nick_name": obj.data.user.nickName,
    "question_avatar_url": obj.data.user.avatarUrl,
    "home_user_id": obj.data.homeInfo.user_id,
    "home_title": '我问'+obj.data.homeInfo.po_nick_name,
    "formid": formid
  }

  wx.cloud.callFunction({
    // 云函数名称
    name: 'api',
    // 传给云函数的参数
    data: {
      oper_type: "qa_toq",
      formid: formid,
      reqData: reqData
    },
  })
    .then(res => {
      console.log(res.result);
      wx.hideLoading();
      if (res.result.code==1){
        console.log(res);
        app.com.showToast({
          title: "提问成功",
          icon: "success"
        });
        obj.setData({ thisQTitle: "" });
      }
      else{
        app.com.showToast({
          title: res.result.msg
        });
      }
     
    })
    .catch(e => {
      console.log(e);
      wx.hideLoading();
      console.log(e);
      app.com.showToast({
        title: "服务繁忙，你等会再试吧~"
      });
    })
}
function loadcode(obj, param) {
  app.com.db.collection('wx_acode').where({
    page: 'pages/qa/poQa/poQa/poQa',
    scene_md5: param.scene
  }).get().then(res => {
    console.log(res.data);
    if (res.data.length > 0) {
      var json = JSON.parse(res.data[0].scene);
      if (param.success) {
        param.success(json.home_id);
      }
    } else {
      app.com._alert({
        title: "让我睡会儿~",
        msg: "不巧，你来的不是时候，该功能正在睡觉...",
        success: function () {
          wx.reLaunch({
            url: "/pages/index/index"
          });
        },
        confirm_text: "去首页看看"
      });
    }
  })
}
