// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
var del= require('./manage/del')
const db = cloud.database();
// 云函数入口函数
//参数
/* var param={
  oper_type:"del",
  question_id:""
} */
exports.main = async (event, context) => {
  var oper_type = event.oper_type;
  if (oper_type=="del"){
    return del.del(db, { event: event})
  }
  else{
    return {code:0,msg:"不支持的操作"}
  }
}