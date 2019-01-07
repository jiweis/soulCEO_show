// miniprogram/pages/appoint/myappoint/occupy/occupy.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    appoint: {},
    reserve_real_name: "",
    reserve_mobile: "",
    user: {},
    appoint_type: {
      "_id": "",
      "stu_name": "预约者",
      "tech_name": "发起者",
      "type": 0,
      "type_name": "预约"
    },
    tmpMskShow: false,
    slot_index: -1,
    from_user_id:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id = options.id;
    var slot_index = options.slot_index;
    var from_user_id = options.from_user_id;
    var obj = this;
    console.log("options:" + id);
    obj.setData({ slot_index: slot_index, from_user_id: from_user_id});
    if (id) {
      getappoint(this, id);
    } else {
      app.getuserInfo({
        isGetInfo: true,
        success: function (user) {
          obj.setData({
            "user": user
          });
        }
      });
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  goappointpage:function(){
    var obj=this;
    wx.redirectTo({
      url: '/pages/appoint/myappoint/appoint/appoint?id=' + obj.data.appoint._id,
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
  },
  goOn: function (e) {
    var obj = this;
    var slot_index = obj.data.slot_index;
    if (slot_index < 0) {
      app.com.showToast({
        title: "请X掉重新点预约哦"
      });
      return;
    }
    var value = e.detail.value;

    if (obj.data.appoint.setting.reserve_info.is_real_name) {
      if (value.real_name) {
        obj.setData({
          reserve_real_name: value.real_name
        });
      } else {
        app.com.showToast({
          title: "你还没填写真实姓名哟"
        });
        return;
      }
    }
    if (obj.data.appoint.setting.reserve_info.is_mobile) {
      if (value.mobile) {
        obj.setData({
          reserve_mobile: value.mobile
        });
      } else {
        app.com.showToast({
          title: "你还没填写手机号哟"
        });
        return;
      }
    }

    order(obj, slot_index);
  },
  order: function (e) {
    var obj = this;
    console.log(e);
    var slot_index = e.currentTarget.dataset.slot_index;
    obj.setData({
      slot_index: slot_index
    });
    order(obj, slot_index);
  },
  closeBox: function () {
    var obj = this;
    obj.setData({
      tmpMskShow: false
    });
  },
})

function getappoint(obj, id) {
  app.com.db.collection('appoint_appointment').doc(id).get().then(res => {
    console.log(res.data);
    obj.setData({
      "appoint": res.data
    });
    wx.setNavigationBarTitle({
      title: "有人让给你-" + res.data.appoint_name
    });
    app.getuserInfo({
      isGetInfo: true,
      success: function (user) {
        getStu(obj, user);
        obj.setData({
          "user": user
        });
      }
    });


  })
}

function order(obj, slot_index) {
  var user = obj.data.user;
  if (obj.data.appoint.appoint_user_info.user_id == user.user_id) {
    app.com.showToast({
      title: "预约失败，你不能预约自己发起的预约"
    });
    return;
  }
  if (obj.data.appoint.slot[slot_index].reserve_info && obj.data.appoint.slot[slot_index].reserve_info.user_id&&obj.data.appoint.slot[slot_index].reserve_info.user_id != obj.data.from_user_id){
    app.com.showToast({
      title: "你来晚了，已经被人抢占了"
    });
    return;
  }
  if (obj.data.appoint.slot[slot_index].reserve_info && obj.data.appoint.slot[slot_index].reserve_info.but_info && obj.data.appoint.appoint_user_info.user_id != obj.data.from_user_id) {
    app.com.showToast({
      title: "你来晚了，已经被人抢占了"
    });
    return;
  }
  var reserve_times = obj.data.appoint.slot.filter(function (ev) {
    return (ev.reserve_info && ev.reserve_info.user_id == user.user_id);
  }).length;
  if (reserve_times >= obj.data.appoint.setting.one_times) {
    app.com.showToast({
      title: "你已经预约过" + reserve_times + "次，不能再预约了(最多只能预约" + obj.data.appoint.setting.one_times + "次)"
    });
    return;
  }
  app.com.loading("正在拼命预约中...");

  var ran = Math.ceil(Math.random() * 2000);
  if (ran < 700) {
    ran = ran + 700;
  }
  console.log("ran:" + ran);
  var timer = setTimeout(function () {
    toOrder(obj, user, {
      slot_index: slot_index,
      finish: function () {
        wx.hideLoading();
      }
    })
  }, ran, );


}

function toOrder(obj, user, param) {
  if (obj.data.appoint.setting.reserve_info.is_real_name && obj.data.reserve_real_name == "") {
    /* app.com.showToast({ title: "需要提供你的真实姓名,以便" + obj.data.appoint_type.tech_name+"核对信息"}); */
    if (param.finish) {
      param.finish();
    }
    obj.setData({
      tmpMskShow: true
    });
    return;
  }
  if (obj.data.appoint.setting.reserve_info.is_mobile && obj.data.reserve_mobile == "") {
    /*   app.com.showToast({ title: "需要提供你的手机号,以便" + obj.data.appoint_type.tech_name + "核对信息" }); */
    if (param.finish) {
      param.finish();
    }
    obj.setData({
      tmpMskShow: true
    });
    return;
  }
  wx.cloud.callFunction({
    name: 'appoint',
    data: {
      "type": "toorder",
      "data": {
        "from_user_id": obj.data.from_user_id,//抢占时必传
        "user_id": user.user_id,
        "appoint_id": obj.data.appoint._id,
        "real_name": obj.data.reserve_real_name, //is_real_name时必传
        "slot_index": param.slot_index,
        "mobile": obj.data.reserve_mobile //is_mobile时必传
      }
    },
  })
    .then(res => {
      console.log(res.result);
      if (res.result.code == 1) {
        app.com.alert("恭喜你预约成功", function () {
          getappoint(obj, obj.data.appoint._id);
        });
      } else {
        app.com.alert(res.result.msg);
      }
      if (param.finish) {
        param.finish();
      }
    })
    .catch(res => {
      console.error;
      param.finish();
      app.com.alert("服务繁忙，请稍后再试哦");
    })
}

function getStu(obj, user) {
  app.com.db.collection('appoint_tech_students').where({
    tech_user_id: obj.data.appoint.appoint_user_info.user_id,
    user_id: user.user_id
  }).get().then(res => {
    console.log(res.data);
    if (res.data.length > 0) {
      obj.setData({
        reserve_real_name: res.data[0].user_real_name,
        reserve_mobile: res.data[0].user_mobile
      });
    }
    getAppoint_type(obj, obj.data.appoint.appoint_type_id);
  })
}

function getAppoint_type(obj, id) {
  app.com.db.collection('appoint_type').doc(id).get().then(res => {
    console.log(res.data);
    obj.setData({
      appoint_type: res.data
    });
  })
}