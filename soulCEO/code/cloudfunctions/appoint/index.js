// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init();
const db = cloud.database();
// 云函数入口函数  event包含type、data、_id、userInfo.appId、userInfo.openId
exports.main = async(event, context) => {
  if (event.type == "saveappoint") { //保存预约信息
    var user_id = event.data.user_id;
    var appoint_real_name = event.data.real_name;
    var resdata = {
      code: 1,
      msg: "保存成功",
      appointid: ""
    };
    var userObj = {};
    try {
      var res = await db.collection('user').doc(user_id).get();
      if (!res.data._id){
        resdata.code = 0;
        resdata.msg = "登录异常";
      }
      else{
        userObj=res.data;
      }
    } catch (e) {
      resdata.code = 0;
      resdata.msg = "保存失败，请稍后再试";
      console.error(e);
    }
    if (resdata.code == 0) {
      return resdata;
    }
    console.log("用户信息："); console.log(userObj);
    var appointobj = event.data.appoint;
    if (!appointobj.appoint_type_id) {
      resdata.code = 0;
      resdata.msg = "不存在的预约类型";
      return resdata;
    }
    var appoint_type_obj = {};
    try {
      var res = await db.collection('appoint_type').doc(appointobj.appoint_type_id).get();
      appoint_type_obj = res.data;
    } catch (e) {
      console.error(e);
      resdata.code = 0;
      resdata.msg = "不合法的预约类型";
    }
    if (resdata.code == 0) {
      return resdata;
    }

    var new_appointobj = {
      appoint_type_id: appointobj.appoint_type_id,
      appoint_name: appointobj.appoint_name,
      date: appointobj.date,
      remark: appointobj.remark,
      slot: appointobj.slot,
      appoint_user_info: {
        "user_id": user_id,
        "avatar_url": userObj.avatar_url,
        "nick_name": userObj.nick_name,
        "real_name": appoint_real_name
      },
      setting: appointobj.setting,
      reserve_num: 0,
      date_update:new Date(),
      _openid: event.userInfo.openId

    };
    if (appointobj._id) {
      resdata.appointid = appointobj._id;
      var appoint_obj = {};
      try {
        var res = await db.collection('appoint_appointment').doc(appointobj._id).get();
        appoint_obj = res.data;
      } catch (e) {
        console.error(e)
      }
      if (appoint_obj.reserve_num > 0) {
        resdata.code = 0;
        resdata.msg = "该" + appoint_type_obj.type_name + "项目已经有人预约，你不能再修改！";
        return resdata;
      }
      try {
        var res = await db.collection('appoint_appointment').doc(appointobj._id).update({
          data: new_appointobj
        })
        var updated = res.stats.updated;
      } catch (e) {
        resdata.code = 0;
        resdata.msg = "保存失败，请稍后再试";
        console.error(e);
      }
    } else {
      try {
        new_appointobj.date_add=new Date();
        var res = await db.collection('appoint_appointment').add({
          data: new_appointobj
        })
        appointobj._id = res._id;
        resdata.appointid = res._id;
      } catch (e) {
        resdata.code = 0;
        resdata.msg = "保存失败，请稍后再试";
        console.error(e);
      }
    }
    if (resdata.code == 0) {
      return resdata;
    }
    var slot_tmp = [];
    new_appointobj.slot.forEach(function(item, index) {
      slot_tmp.push({
        "date_begin": item.date_begin,
        "date_end": item.date_end
      });
    })


    if (event.data.save_tmp_type == 1 || (event.data.save_tmp_type == 2 && event.data.tmp_id == "")) {
      try {
        var res = await db.collection('appoint_appointment_tmp').add({
          data: {
            "appoint_type_id": new_appointobj.appoint_type_id,
            "appoint_name": new_appointobj.appoint_name,
            "date": new_appointobj.date, //日期
            "remark": new_appointobj.remark,
            "slot": slot_tmp,
            "appoint_user_info": new_appointobj.appoint_user_info,
            "setting": new_appointobj.setting,
            "_openid": event.userInfo.openId,
            "date_add":new Date(),
            "date_update":new Date()
          }
        })
      } catch (e) {
        console.error(e);
      }
    } else if (event.data.save_tmp_type == 2) {
      try {
        var res = await db.collection('appoint_appointment_tmp').doc(event.data.tmp_id).update({
          data: {
            "appoint_type_id": new_appointobj.appoint_type_id,
            "appoint_name": new_appointobj.appoint_name,
            "date": new_appointobj.date, //日期
            "remark": new_appointobj.remark,
            "slot": slot_tmp,
            "appoint_user_info": new_appointobj.appoint_user_info,
            "setting": new_appointobj.setting,
            "date_update":new Date()
          }
        })
      } catch (e) {
        console.error(e)
      }
    }
    return resdata;
  } else if (event.type == "toorder") { //预约操作
    var resdata = {
      code: 1,
      msg: "预约成功"
    };
    var appoint_obj = {};
    try {
      var res = await db.collection('appoint_appointment').doc(event.data.appoint_id).get();
      appoint_obj = res.data;
    } catch (e) {
      console.error('预约信息获取失败：'+e)
    }

    if (!appoint_obj.appoint_name) {
      resdata.code = 0;
      resdata.msg = "该预约不存在";
      return resdata;
    }

    if (!appoint_obj.appoint_type_id) {
      resdata.code = 0;
      resdata.msg = "不存在的预约类型";
      return resdata;
    }
    var appoint_type_obj = {};
    try {
      var res = await db.collection('appoint_type').doc(appoint_obj.appoint_type_id).get();
      appoint_type_obj = res.data;
    } catch (e) {
      console.error('预约类型获取失败：'+e);
      resdata.code = 0;
      resdata.msg = "该预约出现繁忙，请稍后再试";
    }
    if (resdata.code == 0) {
      return resdata;
    }



    var reserve_times = appoint_obj.slot.filter(function(ev) {
      return ev.reserve_info && ev.reserve_info.user_id&&ev.reserve_info.user_id == event.data.user_id;
    }).length;
    if (reserve_times >= appoint_obj.setting.one_times) {
      resdata.code = 0;
      resdata.msg = "你已经预约过" + reserve_times + "次，不能再预约了(最多只能预约" + appoint_obj.setting.one_times + "次)";
      return resdata;
    }
    if (appoint_obj.slot[event.data.slot_index].reserve_info&&(appoint_obj.slot[event.data.slot_index].reserve_info.user_id|| appoint_obj.slot[event.data.slot_index].reserve_info.but_info)) {

      if ((!event.data.from_user_id) || ((appoint_obj.slot[event.data.slot_index].reserve_info&&appoint_obj.slot[event.data.slot_index].reserve_info.user_id && event.data.from_user_id != appoint_obj.slot[event.data.slot_index].reserve_info.user_id) || (appoint_obj.appoint_user_info.user_id&&event.data.from_user_id != appoint_obj.appoint_user_info.user_id))){
        resdata.code = 0;
        resdata.msg = "你手速较慢，该时间段已经被预约啦！";
        return resdata;
      }
      
    }
    if (resdata.code == 0) {
      return resdata;
    }

    var userinfo = {};
    try {
      var res = await db.collection('user').doc(event.data.user_id).get();
      userinfo = res.data;

    } catch (e) {
      console.error('用户信息获取失败：'+e)
    }

    if (!userinfo._id) {
      resdata.code = 0;
      resdata.msg = "你登录有误";
      return resdata;
    }
    var stu = {};
    try {
      var res = await db.collection('appoint_tech_students').where({
        tech_user_id: appoint_obj.appoint_user_info.user_id,
        user_id: event.data.user_id
      }).get();
      if (res.data.length > 0) {
        stu = res.data[0];
      } else {
        stu = {}
      }
    } catch (e) {
      console.error('appoint_tech_students获取失败：'+e)
    }

    var thisrname = event.data.real_name ? event.data.real_name : (stu.user_real_name ? stu.user_real_name : "");
    var thism = event.data.mobile ? event.data.mobile : (stu.user_mobile ? stu.user_mobile : "");
    if (stu._id) {
      try {
        var res = await db.collection('appoint_tech_students').where({
          tech_user_id: appoint_obj.appoint_user_info.user_id,
          user_id: event.data.user_id
        }).update({
          data: {
            user_real_name: thisrname,
            user_mobile: thism
          },
        })
      } catch (e) {
        console.error('appoint_tech_students更新失败:'+e)
      }
    } else {
      try {
        var res = await db.collection('appoint_tech_students').add({
          data: {
            tech_user_id: appoint_obj.appoint_user_info.user_id,
            user_id: event.data.user_id,
            user_real_name: thisrname,
            user_mobile: thism,
            _openid: event.userInfo.openId,
          }
        })
      } catch (e) {
        console.error('appoint_tech_students新增失败：'+e)
      }
    }

    if ((!event.data.real_name) && appoint_obj.setting.reserve_info.is_real_name) {
      resdata.code = 0;
      resdata.msg = "请输入你的真实名字,以便" + appoint_type_obj.tech_name + "核对你的信息";
      return resdata;
    }
    if ((!event.data.mobile) && appoint_obj.setting.reserve_info.is_mobile) {
      resdata.code = 0;
      resdata.msg = "请输入你的手机号,以便" + appoint_type_obj.tech_name + "核对你的信息";
      return resdata;
    }

   //***************************************再次获取预约信息  为了防止又更新了
    try {
      var res = await db.collection('appoint_appointment').doc(event.data.appoint_id).get();
      appoint_obj = res.data;
    } catch (e) {
      console.error('预约信息获取失败：' + e)
    }
/****************************************************** */
    try {
      const _ = db.command;
      var newSlot = [];
      newSlot=newSlot.concat(appoint_obj.slot);
      newSlot[event.data.slot_index].reserve_info = {
        "user_id": event.data.user_id,
        "avatar_url": userinfo.avatar_url,
        "nick_name": userinfo.nick_name,
        "real_name": event.data.real_name,
        "mobile": event.data.mobile
      };
      var slotStr = "slot[" + event.data.slot_index + "].reserve_info";
      //var slotUseridStr = "slot[" + event.data.slot_index + "].reserve_info.user_id";
      //var slotButinfoStr = "slot[" + event.data.slot_index + "].reserve_info.but_info";
      var res = await db.collection('appoint_appointment').where(_.or([{
        _id: event.data.appoint_id
      }, {
        _id: event.data.appoint_id
      }])).update({
        data: {
          slot: newSlot,
          "reserve_num": _.inc(1)
        }
      })
      if (res.stats.updated <= 0) {
        resdata.code = 0;
        resdata.msg = "你慢了一步，该时间段已经被预约啦！";
      } else {

        try {
          await db.collection('appoint_records').add({
            data: {
              "user_id": event.data.user_id,
              "appoint_id": event.data.appoint_id,
              "appoint_name": appoint_obj.appoint_name,
              "date": appoint_obj.date,
              "date_begin": appoint_obj.slot[event.data.slot_index].date_begin,
              "date_end": appoint_obj.slot[event.data.slot_index].date_end,
              "date_add":new Date(),
              "_openid": event.userInfo.openId,
            }
          })
        } catch (e) {
          console.error('预约记录添加失败：'+e)
        }

      }
    } catch (e) {
      resdata.code = 0;
      resdata.msg = "预约失败，请稍后重试";
      console.error('预约失败：'+e);
    }

    return resdata;
  } else {
    return {
      code: 0,
      msg: "不支持的操作"
    };
  }
}