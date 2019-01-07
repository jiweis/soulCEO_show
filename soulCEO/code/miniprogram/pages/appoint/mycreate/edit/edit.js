// miniprogram/pages/appoint/mycreate/edit/edit.js
var app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    appoint: {
      "appoint_type_id": "",
      "appoint_name": "",
      "date": "",//日期
      "remark": "",
      "slot": [{
        "date_begin": "",
        "date_end": "",
        "reserve_info": {
          "user_id": "",
          "avatar_url": "",
          "nick_name": "",
          "real_name": "",
          "mobile": "",
          "but_info": ""
        }

      }],
      "appoint_user_info": {
        "user_id": "",
        "avatar_url": "",
        "nick_name": "",
        "real_name": ""
      },
      "setting": {
        "one_times": 1,//每人能预约几个时间段
        "reserve_info": {//希望预约者提供的信息
          "is_real_name": true,
          "is_mobile": false
        }
      },
      "reserve_num": 0 //预约人数
      },
    old_appoint: {},
    user:{},
    tmps:[],
    tmp:{},
    save_tmp_type: 0, //保存模板方式  0:不保存模板,1:保存为新模板,2:覆盖原模板
    appoint_type: { "_id": "", "stu_name": "预约者", "tech_name": "发起者", "type": 0,"type_name":"预约"},
    date_start:"2018-09-01",
    date_end:"2019-09-01",
    tmpMskShow:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id = options.id;
    var obj = this;
    console.log("options:" + id);
    if (id) {
      getappoint(this, id);
    }
    else{
      var datenow = new Date();//获取当前时间
      datenow.setDate(datenow.getDate() + 1);//设置天数 +1 天
      obj.setData({ "old_appoint": obj.data.appoint, "appoint.date": app.com.dateFtt("yyyy-MM-dd", datenow) });
    }
   if ((!id)&&options.appoint_type_id){
      var appoint_type_id = options.appoint_type_id;//新建预约时必传
      getAppoint_type(obj, appoint_type_id);
    }
    app.getuserInfo({
      isGetInfo: true,
      success: function (user) {
        obj.setData({ "user": user });
      }
    });
    var datenow = new Date();//获取当前时间
    var dateaddone = new Date();
    dateaddone.setFullYear(dateaddone.getFullYear() + 1)
    obj.setData({ "date_start": app.com.dateFtt("yyyy-MM-dd", datenow), "date_end": app.com.dateFtt("yyyy-MM-dd", dateaddone)});
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
  addSlot:function(){
    var obj=this;
    var lastslot = obj.data.appoint.slot[obj.data.appoint.slot.length - 1];
    var b = lastslot.date_begin;
    var e = lastslot.date_end;
    if (lastslot.date_end) {
      b = new Date("2018/10/02 " + lastslot.date_end);
      e = new Date("2018/10/02 " + lastslot.date_end);
      b.setHours(b.getHours());
      e.setHours(e.getHours() + 1);
      b = app.com.dateFtt("hh:mm", b);
      e = app.com.dateFtt("hh:mm", e);
    }

   obj.data.appoint.slot.push({ date_begin: b, date_end: e, reserve_info:{}});
    obj.setData({ "appoint.slot": obj.data.appoint.slot});
  },
  removeSlot:function(e){
    var obj=this;
    var slot_index = e.currentTarget.dataset.index;
    app.com.comfirm({
      msg: "确认要删除该时间段吗",
      confirm:function(){
        obj.data.appoint.slot.splice(slot_index, 1);
        obj.setData({ "appoint.slot": obj.data.appoint.slot });
      }
    });
    
  },
  input_edit:function(e){
    console.log(e);
    var obj=this;
    var field = e.currentTarget.dataset.field;
    obj.setData({[field]:e.detail.value});
  },
  bindDateChange:function(e){
    console.log(e);
    var obj=this;
    obj.setData({"appoint.date":e.detail.value});
  },
  bindTimeChange:function(e){
    console.log(e);
    var obj = this;
    var slot_index = e.currentTarget.dataset.index;
    var field = e.currentTarget.dataset.field;
    obj.setData({ ["appoint.slot[" + slot_index + "]." + field]: e.detail.value });
    if (field =="date_begin"){
      obj.setData({ ["appoint.slot[" + slot_index + "].date_t_b"]: e.detail.value });
    }
    else if (field =="date_end"){
      obj.setData({ ["appoint.slot[" + slot_index + "].date_f_e"]: e.detail.value });
    }
  },
  checkboxChange:function(e){
    var obj=this;
    var value=e.detail.value;
    if(value.indexOf("1")>=0){
      obj.setData({"appoint.setting.reserve_info.is_real_name":true});
    }
    else{
      obj.setData({ "appoint.setting.reserve_info.is_real_name": false });
    }
    if (value.indexOf("2") >= 0) {
      obj.setData({ "appoint.setting.reserve_info.is_mobile": true });
    }
    else {
      obj.setData({ "appoint.setting.reserve_info.is_mobile": false });
    }
  },
  saveTmpTypeChange:function(e){
    var obj = this;
    var value = e.detail.value;
    if (value.length > 0) {
      if (obj.data.save_tmp_type != value[value.length-1]){
        obj.setData({ "save_tmp_type": value[value.length - 1] });
      } 
    }
  },
  saveAppoint:function(){
    var obj=this;
    app.com.comfirm({ msg: "确定要保存吗？（请确认信息填写正确，当有人预约后你将不能修改了）", confirm:function(){
      saveAppoint(obj);
    }});
    
  },
  showTmps:function(){
    var obj=this;
    obj.setData({ tmpMskShow:true});
    getTmps(obj);
  },
  closeBox:function(){
    var obj = this;
    obj.setData({ tmpMskShow: false });
  },
  delTmp:function(e){
    var tmpid = e.currentTarget.dataset.tmpid;
    var tmpindex = e.currentTarget.dataset.tmpindex;
    delTmp(obj,tmpindex);
  },
  loadTmp:function(e){
    var obj=this;
    var tmpid = e.currentTarget.dataset.tmpid;
    selectTmp(obj, tmpid);
    obj.setData({ tmpMskShow: false });
  }
})
//获取预约信息
function getappoint(obj,id){
  app.com.db.collection('appoint_appointment').doc(id).get().then(res => {
    console.log(res.data);
    obj.setData({"appoint":res.data});
    obj.setData({"old_appoint":res.data});
    getAppoint_type(obj, res.data.appoint_type_id);
  })
}
//保存预约
function saveAppoint(obj){
  if (!obj.data.user.user_id){
    app.com.showToast({ title: "稍等一会儿" });
    return;
  }
  if (!obj.data.appoint.appoint_type_id){
      app.com.showToast({ title: "请选择预约类型！" });
      return;
  }
  if (!obj.data.appoint.appoint_name){
    app.com.showToast({ title: "请输入该" + obj.data.appoint_type.type_name+"的名称！" });
    return;
  }
  if (!obj.data.appoint.date) {
    app.com.showToast({ title: "请输入该" + obj.data.appoint_type.type_name +"的时间！" });
    return;
  }
  if (!obj.data.appoint.remark) {
    app.com.showToast({ title: "请输入备注！" });
    return;
  }
  if ((!obj.data.appoint.slot) || obj.data.appoint.slot.length<=0) {
    app.com.showToast({ title: "请添加时间段！" });
    return;
  }

  if (obj.data.appoint._id && obj.data.appoint.reserve_num){
    app.com.showToast({ title: "该" + obj.data.appoint_type.type_name +"项目已经有人预约，你不能再修改！" });
    return;
  }
  if (!obj.data.appoint.setting.one_times){
    app.com.showToast({ title: "[每人能预约几个时间段]必须大于0!" });
    return;
  }
  if (obj.data.save_tmp_type<0){
    app.com.showToast({ title: "必须选择保存模板方式" });
    return;
  }
  if (obj.data.save_tmp_type == 2 && (!obj.data.tmp._id)) {
    app.com.showToast({ title: "选择覆盖原模板时，必须载入模板" });
    return;
  }
  if (!obj.data.appoint.appoint_user_info.real_name){
    app.com.showToast({ title: "请填写" + obj.data.appoint_type.stu_name + "对你的称呼,以便展示给" + obj.data.appoint_type.stu_name });
    return;
  }
/*   if (obj.data.appoint._id&&app.com.cmp(obj.data.appoint, obj.data.old_appoint)){
    app.com.alert("保存成功", function () {
      wx.redirectTo({ url: "/pages/appoint/myappoint/appoint/appoint?id=" + obj.data.appoint._id });
    });
    return;
  } */

var req_data={
  "type": "saveappoint",
  "data": {
    "user_id": obj.data.user.user_id,
    "real_name": obj.data.appoint.appoint_user_info.real_name, //老师的真实姓名
    "appoint": {
      "_id": obj.data.appoint._id ? obj.data.appoint._id:"",
      "appoint_type_id": obj.data.appoint.appoint_type_id,
      "appoint_name": obj.data.appoint.appoint_name,
      "date": obj.data.appoint.date,
      "remark": obj.data.appoint.remark,
      "slot": obj.data.appoint.slot,
      "setting": obj.data.appoint.setting
    },
    "save_tmp_type": obj.data.save_tmp_type, //保存模板方式  0:不保存模板,1:保存为新模板,2:覆盖原模板
    "tmp_id": obj.data.tmp._id //模板_id,save_tmp_type为2时必须传
  }
}

  wx.cloud.callFunction({
    // 云函数名称
    name: 'appoint',
    // 传给云函数的参数
    data:req_data
  })
    .then(res => {
      console.log(res.result);
      if (res.result.code==1){
        app.com.alert("保存成功", function () {
          wx.redirectTo({ url: "/pages/appoint/myappoint/appoint/appoint?id=" + res.result.appointid});
        });
      }
      else{
        app.com.alert(res.result.msg);
      }
    })
    .catch(res=>{
      app.com.alert("服务繁忙，请稍后再试哦");
      console.error;
    })
}
//获取所有模板
function getTmps(obj) {
  if (obj.data.tmps.length>0){return false;}
  const _ = app.com.db.command;
  var whereData = {
    "appoint_user_info.user_id": _.in([obj.data.user.user_id,null])
  };
  if (obj.data.appoint_type._id){
    whereData.appoint_type_id = obj.data.appoint_type._id;
  }
  app.com.db.collection('appoint_appointment_tmp').where(whereData).get().then(res => {
    console.log(res.data);
    obj.setData({ tmps:res.data});
  })
}
//选择模板
function selectTmp(obj,tmpid){
  var tmps= obj.data.tmps.filter(function (ev) { return ev._id == tmpid; });
  if (tmps.length<=0){
    app.com.showToast({ title: "模板已失效" });
    return;
  }
  var tmp = tmps[0];
  console.log(tmp);
  var appointobj = obj.data.appoint;
  appointobj.appoint_name = tmp.appoint_name;
  appointobj.date = tmp.date;
  appointobj.remark = tmp.remark;
  appointobj.slot = tmp.slot;
  appointobj.appoint_user_info = {
    "user_id": obj.data.user.user_id,
    "avatar_url": obj.data.user.avatar_url,
    "nick_name": obj.data.user.nick_name,
    "real_name": tmp.appoint_user_info.real_name
  };
  appointobj.setting = tmp.setting;
  obj.setData({ "appoint": appointobj, "tmp": tmp });
  if (tmp.appoint_user_info.user_id){
    obj.setData({ save_tmp_type:2});
  }
}
//撤回模板
function backTmp(obj){
  obj.setData({ "appoint": obj.data.old_appoint });
}

function getAppoint_type(obj,id){
  app.com.db.collection('appoint_type').doc(id).get().then(res => {
    console.log(res.data);
    obj.setData({ appoint_type: res.data, "appoint.appoint_type_id": res.data._id});
    wx.setNavigationBarTitle({ title: "发起"+res.data.type_name});
  })
}
function delTmp(obj, tmpindex){
  if (obj.data.tmps[tmpindex].appoint_user_info.user_id){
    db.collection('appoint_appointment_tmp').doc(obj.data.tmps[tmpindex]._id).remove()
      .then(e=>{
        if (e.stats.removed>0){
          obj.data.tmps.splice(tmpindex,1);
          obj.setData({ tmps: obj.data.tmps});
          app.com.showToast({ title: "删除成功", icon: "success" });
        }
        else{
          app.com.showToast({ title: "删除失败" });
        }
      })
      .catch(console.error)
  }
  else{
    app.com.showToast({ title: "系统模板不能删除" });
    return;
  }
}