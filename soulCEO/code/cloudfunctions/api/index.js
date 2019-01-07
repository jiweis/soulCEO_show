// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const req = require('request')
var com=require('./com/com')
var msg = require('./msg/msg')
var soso=require('./soso/soso')
var radio=require('./radio/radio')
var account=require('./account/account')
const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  var oper_type = event.oper_type;
  if (oper_type == "send") {
    return msg.sendMsg(db, { com: com, req: req, to_user_id: event.to_user_id, userInfo: event.userInfo, msgtype: event.msgtype, msgcontent: event.msgcontent, formid: event.formid, path: event.path })
  }
  else if (oper_type=="send_qa_q"){
    return msg.sendQAQ(db, { com: com, req: req, msg: msg, q_id: event.q_id, formid: event.formid, userInfo: event.userInfo })
  }
  else if (oper_type == "send_qa_a"){
    return msg.sendQAA(db, { com: com, req: req, msg: msg, q_id: event.q_id, formid: event.formid, userInfo: event.userInfo  })
  }
  else if(oper_type=="qa_toq"){
    return qa_toq({ reqData: event.reqData, userInfo: event.userInfo });
  }
  else if (oper_type == "qa_toa") {
    return qa_toa({ reqData: event.reqData, userInfo: event.userInfo, q_id: event.q_id, formid: event.formid});
  }
  else if (oper_type == "soso") {
    return soso.soso(db,{tag:event.tag});
  }
  else if (oper_type == "radio_thumbs_up") {
    return radio.ThumbsUp(db, { radio_item_id: event.radio_item_id, reqData: event.reqData });
  }
  else if (oper_type =="get_flower"){
    return account.getFlower(db, { user_id: event.user_id, radio_item_id: event.radio_item_id});
  }
  else if (oper_type =="send_flower"){
    return radio.sendFlower(db, { user_id: event.user_id, radio_item_id: event.radio_item_id});
  }
  else {
    return { code: 0, msg: "不支持的操作" }
  }
}


function qa_toq(param){
  return new Promise((resolve, reject) => {
    param.reqData.date_add = db.serverDate();
    param.reqData.answer_url= null;//回答的语音url
      param.reqData.answer_user_id = null;
      param.reqData.answer_nick_name =null;
      param.reqData.answer_avatar_url = null;
      param.reqData.date_answer=null;
    db.collection('qa').add({
      data: param.reqData
    })
      .then(res => {
        console.log(res);

        msg.sendQAQ(db, { com: com, req: req, msg: msg, q_id: res._id, formid: param.reqData.formid, userInfo: param.userInfo }).then(res=>{
          resolve({ code: 1, msg: "提问成功" });
        }).catch(e=>{
          console.log("发送消息失败："+e);
          resolve({ code: 1, msg: "提问成功" });
        })


      })
      .catch(e => {
        console.log("qa新增失败："+JSON.stringify(e));
        resolve({ code: 0, msg: "服务繁忙，你等会再试吧~" });
      })
  })
  
}
function qa_toa(param){
  return new Promise((resolve, reject) => {
    param.reqData.date_answer = db.serverDate();
    param.reqData.answer_formid = param.formid;
    db.collection('qa').doc(param.q_id).update({
      data: param.reqData
    })
      .then(res => {
        msg.sendQAA(db, { com: com, req: req, msg: msg, q_id: param.q_id, formid: param.formid, userInfo: param.userInfo }).then(res=>{

          resolve({ code: 1, msg: "回答成功" });
        }).catch(e=>{
          console.log("发送消息失败：" + e);
          resolve({ code: 1, msg: "回答成功" });
        })
      })
      .catch(e => {
        console.log("qa修改失败：" + JSON.stringify(e));
        resolve({ code: 0, msg: "服务繁忙，你等会再试吧~" });
      })
  });
 
}