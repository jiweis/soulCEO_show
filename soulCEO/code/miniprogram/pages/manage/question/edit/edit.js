// miniprogram/pages/manage/question/edit/edit.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    question_objs: {
      _id: "",
      title: "",
      option: {
        options: []
      }
    },
    systemTags:[],
    selecttagview:false,
    mainview:true,
    thisTagInfo:{},
    submit_state: { submit_num: 0, finish_num: 0, error_infos: "" },
    SignUsers: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var id = options.id;
    console.log("options:"+id);
    var obj=this;
    if (id){
      getQuestions(obj, id);
    }
    else { getSignUsers(obj);}
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
  checkboxChange:function(e){
    var obj=this;
   console.log(e);
    var only_user_id = e.detail.value[e.detail.value.length-1];
    obj.setData({ "question.only_user_id": only_user_id});
    for (var i = 0; i < obj.data.SignUsers.length;i++){
      if (obj.data.SignUsers[i]._id == only_user_id){
        obj.setData({ ["SignUsers["+i+"].checked"]: true });
        obj.setData({ "question.only_user_remark": obj.data.SignUsers[i].nick_name + "(" + obj.data.SignUsers[i].sign+")"});
      }
      else { obj.setData({ ["SignUsers[" + i + "].checked"]: false });}
    }
  },
  option_add: function() {
    var obj=this;
    var options = this.data.question_objs.option.options;
    var len = options.length;
    var code = String.fromCharCode(64 + len + 1);
    console.log(len + ":" + code);
    options = options.push({
      keyoption: "keyoption_" + len,
      index: len - 1,
      _id: "",
      code: code,
      question_id: obj.data.question_objs._id,
      title: "",
      tag: {
        que_opt_tags: []
      }
    });
    this.setData({
      "question_objs": this.data.question_objs
    });
  },
  switchView:function(){
    if (this.data.selecttagview){
      this.setData({
        selecttagview: false, mainview: true
      });
    }
    else{
      this.setData({
        selecttagview: true, mainview: false
      });
    }
  },
  setthistag:function(e){
    var obj=this;
    var tag_id = e.currentTarget.dataset.id;
    var tag_title = e.currentTarget.dataset.title;
    var desc = e.currentTarget.dataset.desc;
    var index = obj.data.thisTagInfo.o_index;
    var tags = obj.data.question_objs.option.options[index].tag.que_opt_tags;
    var len = tags.length;
    if (tags.filter(function (ev) { return ev.tag_id == tag_id ; }).length>0){
      obj.switchView();
      return;
    }
    tags = tags.push({
      keytag: "keytag_" + len,
      index: len - 1,
      _id: "",
      desc: desc,
      option_id: obj.data.question_objs.option.options[index]._id,
      question_id: obj.data.question_objs._id,
      tag_id: tag_id,
      title: tag_title
    });
    this.setData({
      "question_objs": this.data.question_objs
    });
    obj.setData({
      selecttagview: false, mainview: true
    });
  },
  tag_add: function(e) {
    var obj = this;
    var o_index = e.currentTarget.dataset.index;
    obj.setData({ selecttagview: true, mainview: false, thisTagInfo:{
      o_index: o_index
    }});
    if (obj.data.systemTags.length <= 0) {
      getSystemTags(obj);
    }
  },
  inputQTitle: function(e) {
    this.setData({
      "question_objs.title": e.detail.value
    });
  },
  inputOTitle: function(e) {
    console.log(e);
    var option = this.data.question_objs.option.options;
    var index = e.currentTarget.dataset.index;
    option[index].title = e.detail.value;
    this.setData({
      "question_objs.option.options": option
    });
  },
  save: function(e) {
    tosave(this);
  },
  delOption:function(e){
    var obj=this;
    var id = e.currentTarget.dataset.optionid;
    app.com.alert("暂时不支持删除");
    return;
    app.com.comfirm({ msg: "确定要删除吗", confirm:function(){
      deloption(obj, id);
    }});
   
  },
  delTags:function(e){
    console.log(e);
    var id = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    var option_id = e.currentTarget.dataset.optionid;
    var obj=this;
    console.log("id:" + id + ",index:" + index + ",option_id:" + option_id);
    app.com.comfirm({
      msg: "确定要删除吗", confirm: function () {
        var newoptions= obj.data.question_objs.option.options.filter(function (op){
          return op._id == option_id;
        });
        if (newoptions.length==0){return;}
        var option_index = newoptions[0].index;
        console.log("option_index:" + option_index);
        obj.data.question_objs.option.options[option_index].tag.que_opt_tags.splice(index, 1);
        obj.setData({ ["question_objs.option.options[" + option_index + "].tag.que_opt_tags"]: obj.data.question_objs.option.options[option_index].tag.que_opt_tags});
       if(id){
         app.com.db.collection('que_opt_tags').doc(id).remove()
           .then(res=>{
             app.com.alert("删除成功");
           })
           .catch(console.error)
       }

      }
    });
   
  }
})

function getQuestions(obj, id) {
  //获取问题
  const question = app.com.db.collection('question').doc(id);
  question.get().then(res => {
    console.log(res.data);
    obj.setData({
      question: res.data
    });
    getSignUsers(obj);
    //获取选项
    app.com.db.collection('option').where({
      question_id: obj.data.question._id
    }).get().then(res => {
      console.log(res.data);
      obj.setData({
        option: res.data
      });

      //获取标签
      app.com.db.collection('que_opt_tags').where({
        question_id: obj.data.question._id
      }).get().then(res => {
        console.log(res.data);
        obj.setData({
          que_opt_tags: res.data
        });
        //开始组成
        concatData(obj);
      })

    })

  })
}

function concatData(obj) {
  var question_objs = {
    _id: obj.data.question._id,
    title: obj.data.question.title,
    option: {
      options: []
    }
  }
  for (var i = 0; i < obj.data.option.length; i++) {
    question_objs.option.options.push({
      keyoption: "keyoption_" + i,
      index: i,
      _id: obj.data.option[i]._id,
      code: obj.data.option[i].code,
      question_id: obj.data.option[i].question_id,
      title: obj.data.option[i].title,
      tag: {
        que_opt_tags: []
      }
    });
    for (var j = 0; j < obj.data.que_opt_tags.length; j++) {
      if (obj.data.que_opt_tags[j].option_id == obj.data.option[i]._id) {
        question_objs.option.options[i].tag.que_opt_tags.push({
          keytag: "keytag_" + j,
          index: j,
          _id: obj.data.que_opt_tags[j]._id,
          desc: obj.data.que_opt_tags[j].desc,
          option_id: obj.data.que_opt_tags[j].option_id,
          question_id: obj.data.que_opt_tags[j].question_id,
          tag_id: obj.data.que_opt_tags[j].tag_id,
          title: obj.data.que_opt_tags[j].title
        });
      }
    }
  }
  obj.setData({
    question_objs: question_objs
  });
}
function addSubmit_num(obj){
  obj.setData({ "submit_state.submit_num": obj.data.submit_state.submit_num + 1 });
}
function addFinish_num(obj){
  obj.setData({ "submit_state.finish_num": obj.data.submit_state.finish_num+1});
}
function finishFunc(obj){
  if (obj.data.submit_state.submit_num == obj.data.submit_state.finish_num){
    wx.hideLoading();
  }
}
function tosave(obj) {
  //wx.showLoading({ title: "正在保存",mask:true});
  var reqData={
    title: obj.data.question_objs.title,
    date_update: app.com.db.serverDate()
  };
/*   if (obj.data.question.only_user_remark){
    reqData.only_user_remark=obj.data.question.only_user_remark;
  }
  if (obj.data.question.only_user_id){
    reqData.only_user_id = obj.data.question.only_user_id;
  } */
  if (obj.data.question_objs._id) {
    //修改
    addSubmit_num(obj);
    app.com.db.collection('question').doc(obj.data.question_objs._id).update({
      data: reqData
    }).then(res => {
      addFinish_num(obj);
      if (obj.data.question_objs.option.options.length>0){
        updateOption(obj);
      }

    }).catch(res=>{
      addErrorInfo(obj,"question修改出错");
      console.log("question修改出错"+":"+res);
    })
  } else {
    //新增
    addSubmit_num(obj);
    reqData.date_add = app.com.db.serverDate();
    app.com.db.collection('question').add({
      data: reqData
    })
      .then(res => {
        addFinish_num(obj);
        obj.setData({ "question_objs._id": res._id});
        if (obj.data.question_objs.option.options.length > 0) {
          updateOption(obj);
        }
      })
      .catch(res => {
        addErrorInfo(obj, "question新增出错");
        console.log("question新增出错" + ":" + res);
      })
  }
}

function updateOption(obj) {
  var options = obj.data.question_objs.option.options;
  console.log(options);
  for (var i = 0; i < options.length; i++) {
    if (options[i]._id) {
      updateOption_update(obj,JSON.parse(JSON.stringify(options[i])));
    } else {
      updateOption_add(obj, JSON.parse(JSON.stringify(options[i])));
    }
  }
}
function updateOption_update(obj,option_i){
  addSubmit_num(obj);
  console.log("option修改" + ",optionid:" + option_i._id + ",code:" + option_i.code + ",title:" + option_i.title);
  app.com.db.collection('option').doc(option_i._id).update({
    data: {
      code: option_i.code,
      title: option_i.title
    }
  })
    .then(res => {
      addFinish_num(obj);
      if (option_i.tag.que_opt_tags.length > 0) {
        updateTags(obj, option_i.tag.que_opt_tags, option_i._id);
      }
    })
    .catch(res => {
      addErrorInfo(obj, "option修改出错");
      console.log("option修改出错:" + res);
    })
}
function updateOption_add(obj, option_i){
  addSubmit_num(obj);
  app.com.db.collection('option').add({
    data: {
      code: option_i.code,
      question_id: obj.data.question_objs._id,
      title: option_i.title
    }
  })
    .then(res => {
      addFinish_num(obj);
      console.log(option_i);
      if (option_i.tag.que_opt_tags.length > 0) {
        updateTags(obj, option_i.tag.que_opt_tags, res._id);
      }
    })
    .catch(res => {
      addErrorInfo(obj, "option新增出错");
      console.log("option新增出错" + ":" + res);
    })
}
function updateTags(obj, que_opt_tags, option_id){
  for(var i=0;i<que_opt_tags.length;i++){
    if(que_opt_tags[i]._id){
      addSubmit_num(obj);
      app.com.db.collection('que_opt_tags').doc(que_opt_tags[i]._id).update({
        data: {
          desc: que_opt_tags[i].desc,
          option_id: option_id,
          question_id: que_opt_tags[i].question_id,
          tag_id: que_opt_tags[i].tag_id,
          title: que_opt_tags[i].title
        }
      })
        .then(res=>{
          addFinish_num(obj);
        })
        .catch(res => {
          addErrorInfo(obj, "que_opt_tags修改出错");
          console.log("que_opt_tags修改出错" + ":" + res);
        })
    }
    else{
      addSubmit_num(obj);
      app.com.db.collection('que_opt_tags').add({
        data: {
          desc: que_opt_tags[i].desc,
          option_id: option_id,
          question_id: obj.data.question_objs._id,
          tag_id: que_opt_tags[i].tag_id,
          title: que_opt_tags[i].title
        }
      })
        .then(res => {
          addFinish_num(obj);
          console.log(res);
        })
        .catch(res => {
          addErrorInfo(obj, "que_opt_tags新增出错");
          console.log("que_opt_tags新增出错" + ":" + res);
        })
    }
  }
}

function getSystemTags(obj){
  if (obj.data.systemTags.length<=0){
    const tags = app.com.db.collection('tags').orderBy("date_update", "desc");
    tags.get({
      success: function (res) {
        console.log(res);
        obj.setData({ "systemTags": res.data });
      }
    })
  }
}

function addErrorInfo(obj,errorInfo){
  obj.setData({ "submit_state.error_infos": obj.data.submit_state.error_infos+"," + errorInfo});
}

function deloption(obj,id){
  app.com.db.collection('option').doc(id).remove()
    .then(console.log)
    .catch(console.error)
}

function getSignUsers(obj){
  const _ = app.com.db.command;
  app.com.db.collection('user').where({
    sign: _.neq(null)
  }).get().then(res => {
    console.log(res.data);
    if (obj.data.question.only_user_id){
      for (var i = 0; i < res.data.length; i++) {
        if (obj.data.question.only_user_id==res.data[i]._id) { res.data[i].checked = true; }
        else {
          res.data[i].checked = false;
        }
      }
    }
    obj.setData({ SignUsers:res.data});
  })
}