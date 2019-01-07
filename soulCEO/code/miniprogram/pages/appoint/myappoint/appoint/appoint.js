// miniprogram/pages/appoint/myappoint/appoint/appoint.js
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
    reserveInfoShow: false,
    reserveInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id = options.id;
    var obj = this;
    console.log("options:" + id);
    if (id) {
      app.com.loading("加载中...");
      getappoint(this, id, { isfirst: true });
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (e) {
    var obj = this;
    console.log(e);
    if (e.from == "button") {
      if (e.target.dataset.type == 2) {
        return { title: "[" + e.target.dataset.timestr + "]让给你，你可以进行抢占(" + obj.data.appoint.appoint_name + "【" + obj.data.appoint.date + "】)", path: "/pages/appoint/myappoint/occupy/occupy?id=" + obj.data.appoint._id + "&slot_index=" + obj.data.reserveInfo.slot_index + "&from_user_id=" + obj.data.user.user_id, imageUrl: "/images/appoint/occupy.jpg" }
      }
      else if (e.target.dataset.type == 3) {
        return { title: "[" + e.target.dataset.timestr + "]让给你，你可以进行抢占(" + obj.data.appoint.appoint_name + "【" + obj.data.appoint.date + "】)", path: "/pages/appoint/myappoint/occupy/occupy?id=" + obj.data.appoint._id + "&slot_index=" + obj.data.reserveInfo.slot_index + "&from_user_id=" + obj.data.user.user_id, imageUrl: "/images/appoint/occupy.jpg" }
      }
      else {
        return {
          title: "在线预约-" + obj.data.appoint.appoint_name + "【" + obj.data.appoint.date + "】"
        }
      }
    } else {
      return {
        title: "在线预约-" + obj.data.appoint.appoint_name + "【" + obj.data.appoint.date + "】"
      }
    }

  },
  closeReserveInfoBox: function () {
    this.setData({
      reserveInfoShow: false
    });
  },
  showReserveInfo: function (e) {
    var slot_index = e.currentTarget.dataset.slot_index;
    var obj = this;
    var reserveInfo = obj.data.appoint.slot[slot_index];
    reserveInfo.slot_index = slot_index;
    obj.setData({
      reserveInfo: reserveInfo,
      reserveInfoShow: true
    });
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

function getappoint(obj, id, param) {
  try{
    app.com.db.collection('appoint_appointment').doc(id).get().then(res => {
      console.log(res.data);
      obj.setData({
        "appoint": res.data
      });
      wx.setNavigationBarTitle({
        title: "在线预约-" + res.data.appoint_name
      });
      if (param.isfirst) {

        app.getuserInfo({
          isGetInfo: true,
          success: function (user) {
            getStu(obj, user);
            obj.setData({
              "user": user
            });
          }
        });
      } else { wx.hideLoading(); if (param.success) { param.success(); } }

    })
  }
  catch(e){
    console.log(e);
    wx.redirectTo({
      url: '/pages/common/msg/error/error?title=该内容已被删除',
    })
  }
 
}

function order(obj, slot_index) {
  var user = obj.data.user;
  if (obj.data.appoint.appoint_user_info.user_id == user.user_id) {
    app.com.showToast({
      title: "预约失败，你不能预约自己发起的预约"
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
        getappoint(obj, obj.data.appoint._id, {
          isfirst: false, success: function () {
            if (obj.data.appoint.slot[param.slot_index].reserve_info && obj.data.appoint.slot[param.slot_index].reserve_info.user_id == obj.data.user.user_id) {
              app.com.alert("恭喜你预约成功");
            }
            else {
              app.com.alert("是不是网络有点卡？没挤过别人诶，再接再厉吧");
            }
            if (param.finish) {
              param.finish();
            }
          }
        });
      } else {
        if (param.finish) {
          param.finish();
        }
        app.com.alert(res.result.msg);
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
    wx.hideLoading();
  })
}