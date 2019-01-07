var app = getApp()
var recorderManager = wx.getRecorderManager()
const innerAudioContext = wx.createInnerAudioContext()
var playDy = [{ text: "∙", padd: 31.94 }, { text: "﹙∙", padd: 15.97 }, { text: "（﹙∙", padd: 0 }];
var tempFilePath;
var formid;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: {},
    qaInfo:{},
    recordState:0,//0:未开始(录音键)，1:录音中(停止键)，2:录音完成(播放键)，3：播放中
    playAudio: { src: "", playType: "none", show: { text: playDy[2].text, playtext: playDy[2].text, padd: 0,},cord:{}, stat: 0 },//stat 1:加载中 2：可以播放  playType:none/show:展示的录音/cord:自己录的音
    answerType:1,//1:语音回答 2:文字回答
    q_all_len: 200,
    q_this_len: 0,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var qa_id=options.qa_id;
    console.log(qa_id);
    var obj = this;
    app.getuserInfo({
      isGetInfo: true,
      success: function (user) {
        obj.setData({
          user: user
        });
        //获取用户信息后
        getQADetail(obj,qa_id);
      }
    });

    listenPlay(obj);
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
  aChange: function (e) {
    var value = e.detail.value;
    var obj = this;
    obj.setData({ q_this_len: value.length });
    obj.data.qaInfo.answer_text = value;
  },
  cutAnswerType:function(){
    var obj=this;
    if (obj.data.answerType==1){
      obj.setData({ answerType: 2 });
    }
    else{
      obj.setData({ answerType: 1 });
    }
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  finish:function(e){
    var obj=this;
    formid = e.detail.formId;
    console.log("formid:" + formid);
    if (!formid){
      app.com.showToast({
        title: "操作异常，请稍后再试哦"
      });
      return;
    }
    app.com.comfirm({ msg: "确定完成回答吗？", confirm:function(){
      if (obj.data.answerType==1){
        upRecord(obj);
      }
      else{
        if (!obj.data.qaInfo.answer_text){
          app.com.showToast({
            title: "你还没输入回答哦"
          });
        }
        else{
          app.com.loading("正在提交...");
          toSave(obj,"", {
            finish: function () {
              wx.hideLoading();
            }
          });
        }
      }
    }});
    
  },
  playAnswer:function(){
    var obj=this;
    obj.setData({ "playAudio.src": obj.data.qaInfo.answer_url, "playAudio.playType":"show"});
    play(obj);
  },
  rerecord:function(){
    var obj=this;
    if (innerAudioContext.paused == false) {
      innerAudioContext.stopback = function () {
        tempFilePath = "";
        console.log("已停止");
        obj.setData({ recordState: 0 });}
      innerAudioContext.stop();
      return;
    }
    tempFilePath = "";
    obj.setData({ recordState:0});
  },
  record:function(){
    var obj = this;
    console.log("进入事件：" + obj.data.recordState);
    if (obj.data.recordState==0){
      start(obj);
    }
    else if (obj.data.recordState==1){
      stop(obj);
    }
    else if (obj.data.recordState==2){
      console.log("播放：" + tempFilePath);
      obj.setData({ "playAudio.src": tempFilePath, "playAudio.playType": "cord" });
      play(obj);
    }
    else if (obj.data.recordState == 3) {
      obj.setData({ "playAudio.src": tempFilePath, "playAudio.playType": "cord" });
      play(obj);
    }
    else{
      app.com.showToast({
        title: "操作异常，请稍后再试哦"
      });
    }
  }
})
function start(obj){

  const options = {
    duration: 600000,
    sampleRate: 44100,
    numberOfChannels: 1,
    encodeBitRate: 192000,
    format: 'aac',
    frameSize: 50
  }
  //开始录音
  recorderManager.start(options);
  recorderManager.onStart(() => {
    console.log('recorder start');
    obj.setData({ recordState:1});
  });
  //错误回调
  recorderManager.onError((res) => {
    console.log(res);
    obj.setData({ recordState: 0});
    app.com.showToast({
      title: "无法录音 (你没有授权录音权限或麦克风异常)"
    });
  });
  recorderManager.onStop((res) => {
    tempFilePath = res.tempFilePath;
    console.log('停止录音', res.tempFilePath);
    innerAudioContext.src = tempFilePath;
    try{

      obj.data.qaInfo.answer_duration = innerAudioContext.duration ? parseInt(innerAudioContext.duration) : 0;
    }catch(e){
      obj.data.qaInfo.answer_duration=0;
    };
    obj.setData({ recordState: 2 });
  })
}

function play(obj) {
  if (obj.data.playAudio.stat == 1) { return; }
    if (innerAudioContext.paused == false) {
      innerAudioContext.stop();
      console.log("已停止");
      return;
    }
    toplay(obj);
}
function toplay(obj) {
  if (innerAudioContext.src != obj.data.playAudio.src){
    obj.setData({ "playAudio.stat": 1 });
    innerAudioContext.autoplay = true;
    innerAudioContext.obeyMuteSwitch = false;
    innerAudioContext.src = obj.data.playAudio.src;
  }
  if (innerAudioContext.paused) {
    innerAudioContext.play();
  }
}
function onInterval(obj) {
  var i = 0;
  var playTimer = setInterval(function () {
    if (i > playDy.length - 1) { i = 0; }
    console.log("计时状态：" + innerAudioContext.paused);
    if (innerAudioContext.paused) { clearInterval(playTimer); return; }
    if (obj.data.playAudio.playType=="show"){
      obj.setData({ "playAudio.show.text": playDy[2].text, "playAudio.show.playtext": playDy[i].text, "playAudio.show.padd": playDy[i].padd, "playAudio.stat": 2 });
    }
    else if (obj.data.playAudio.playType == "cord"){

    }
    i = i + 1;
  }, 500);
}
function listenPlay(obj) {
  innerAudioContext.onPlay(() => {
    console.log('开始播放');
    if (obj.data.playAudio.playType == "cord"){
      obj.setData({ recordState: 3 });
    }
    
    onInterval(obj);
  })
  innerAudioContext.onCanplay(() => {
    console.log("可以播放");
  })
  innerAudioContext.onEnded(() => {
    console.log('停止播放');
    if (obj.data.playAudio.playType=="show"){
      obj.setData({ "playAudio.show.text": playDy[2].text, "playAudio.show.playtext": playDy[2].text, "playAudio.show.padd": playDy[2].padd, "playAudio.stat": 0 });
    }
    else if (obj.data.playAudio.playType == "cord"){
      obj.setData({ recordState: 2 });
    }
  })
  innerAudioContext.onStop(() => {
    console.log('停止播放');
    if (obj.data.playAudio.playType == "show"){
      obj.setData({ "playAudio.show.text": playDy[2].text, "playAudio.show.playtext": playDy[2].text, "playAudio.show.padd": playDy[2].padd, "playAudio.stat": 0 });
    }
    else if (obj.data.playAudio.playType == "cord") {
      obj.setData({ recordState: 2 });
    }
    if (innerAudioContext.stopback) { innerAudioContext.stopback();}
  })
  innerAudioContext.onError((res) => {
    console.log(res.errMsg);
    console.log(res.errCode);
    app.com.showToast({
      title: "设备无法播放，请检查"
    });
  })
}

function stop(obj){
  recorderManager.stop();
 
}
function getQADetail(obj,qa_id){
  app.com.db.collection('qa').doc(qa_id).get().then(res => {
    console.log(res.data);
    obj.setData({ qaInfo:res.data});
  })
}

function upRecord(obj){
  if (!tempFilePath){
    app.com.showToast({
      title: "你还没录哦"
    });
    return;
  }
  app.com.loading("正在提交...");
  var dat=new Date();
  var filename = (dat.getFullYear() + "" + dat.getMonth() + "" + dat.getDate()+""+dat.getHours()+""+dat.getMinutes()+""+dat.getSeconds()+""+dat.getMilliseconds() + ".aac");
  var cloudPath = 'test/minione/userdata/po_qa/' + obj.data.user.user_id +"/"+(dat.getFullYear() + "-" + dat.getMonth() + "-" + dat.getDate() + "/" + filename);
  console.log("cloudPath:" + cloudPath);
  wx.cloud.uploadFile({
    cloudPath: cloudPath,
    filePath: tempFilePath, // 小程序临时文件路径
  }).then(res => {
    // get resource ID
    console.log(res.fileID);
    toSave(obj, res.fileID,{finish:function(){
      wx.hideLoading();
    }});
  }).catch(error => {
    // handle error
    app.com.showToast({
      title: "操作异常，请稍后再试哦"
    });
  })
}
function toSave(obj,fileid,param){
  if (obj.data.answerType==1&&(!fileid)){
    app.com.showToast({
      title: "操作异常，请稍后再试哦"
    });
    return;
  }
  if (obj.data.answerType == 2 && (!obj.data.qaInfo.answer_text)) {
    app.com.showToast({
      title: "你还没输入回答哦"
    });
    return;
  }
  var reqData={
    answer_duration: obj.data.qaInfo.answer_duration,
    answer_user_id: obj.data.user.user_id,
    answer_nick_name: obj.data.user.nickName,
    answer_avatar_url: obj.data.user.avatarUrl
  };
  if (obj.data.answerType==1)
  { reqData.answer_url=fileid}
  else{
    reqData.answer_text = obj.data.qaInfo.answer_text;
  }
  wx.cloud.callFunction({
    // 云函数名称
    name: 'api',
    // 传给云函数的参数
    data: {
      oper_type: "qa_toa",
      q_id: obj.data.qaInfo._id,
      formid: formid,
      reqData: reqData
    },
  })
    .then(res => {
      console.log(res.result);
      if (param.finish) { param.finish(); }
      if(res.result.code==1){
        app.com.showToast({
          title: res.result.msg,
          icon: "success"
        });
        getQADetail(obj, obj.data.qaInfo._id);
      }
      else{
        app.com.showToast({
          title: res.result.msg
        });
      }
    })
    .catch(e => {
      console.log(e);
      if (param.finish) { param.finish(); }
    })


}
