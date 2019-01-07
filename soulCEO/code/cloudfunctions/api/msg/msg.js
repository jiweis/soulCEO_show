function sendMsg(db, param){
  return new Promise((resolve, reject) =>{
    var com = param.com;
    var req=param.req;
    com.getAppInfo(db, { req: req, appId: param.userInfo.appId}).then(res=>{
      if (res.code==0){
        resolve({code:0,msg:res.msg});
      }
      else{
        var access_token = res.app_info.access_token;
        var url = "https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=" + access_token;
        com.getUser(db, { user_id: param.to_user_id}).then(res=>{
          if(res.code==0){
            resolve({ code: 0, msg: res.msg });
          }
          else{
            var user=res.user;
            var tmp = getTemp(param.msgtype, param.msgcontent);//todo...
            if (tmp==null){
              resolve({ code: 0, msg: '不支持的消息类型' });
              return;
            }
            var requestData={
              "touser": user._openid,
              "template_id": tmp.template_id,
              "page": param.path,
              "form_id": param.formid,
              "data": tmp.data,
              "emphasis_keyword": tmp.emphasis_keyword
            }
            req({
              url: url,
              method: "POST",
              json: true,
              headers: {
                "content-type": "application/json",
              },
              body: requestData
            }, function (error, response, body) {
              console.log("请求成功");
              console.log(body); // 请求成功的处理逻辑
              if (!error && response.statusCode == 200) {
                resolve({ code: 1, msg: "发送成功" });
              }
              else{
                resolve({ code: 0, msg: "发送失败" });
              }
            });
          }
        })
      }
    })
  });
}

function getTemp(msgtype,content){
  if (msgtype == 1) {//问题处理通知
    return { template_id: "Rwp6dK88T8PP8ymdarLdQpVhvMec2iGme-omHDLWMpQ", data:{
      "keyword1": {
        "value": content.remark//备注
      },
      "keyword2": {
        "value": content.qtype//问题类型
      },
      "keyword3": {
        "value": content.date//提交时间
      }
    }}
  }
  else if (msgtype == 2) {//提问回复通知
    return {
      template_id: "-umPTHzMx51OAIdkf3vT04Z5BHt_rv2eZMrMt9KQIcA", data: {
        "keyword1": {
          "value": content.title//提问主题
        },
        "keyword2": {
          "value": content.answer_user_name//回复人
        },
        "keyword3": {
          "value": content.date_answer//回复时间
        },
        "keyword4": {
          "value": content.q_content//提问内容
        },
        "keyword5": {
          "value": content.a_content//回复内容
        }
      }, emphasis_keyword: "keyword1.DATA"}
  }
  else{
    return null;
  }
}


function sendQAQ(db,param){
  return new Promise((resolve, reject) => {
    console.log("开始发送模板消息");
    var q_id = param.q_id;
    db.collection('qa').doc(q_id).get().then(res=>{
      var qa = res.data;

      const _ = db.command;
      db.collection('qa').orderBy('date_answer', 'desc')
        .where({
          "answer_user_id": qa.home_user_id,
          "_id": _.neq(q_id)
        })
        .limit(1)
        .get().then(res=>{
          console.log("q_id：" + q_id + "answer_user_id:" + qa.home_user_id+",上一条回答查询结果");
          console.log(res);
          if(res.data.length>0){
            var forwardqa=res.data[0];
            var msgcontent = {
              remark: "收到来自" + qa.question_nick_name + "的提问：" + qa.question_title,//备注
              qtype: qa.home_title,//问题类型
              date: qa.date_add.Format("yyyy-MM-dd hh:mm")//提交时间
            }
            param.msg.sendMsg(db, { com: param.com, req: param.req, to_user_id: qa.home_user_id, userInfo: param.userInfo, msgtype: 1, msgcontent: msgcontent, formid: forwardqa.answer_formid, path: "pages/qa/myQa/qDetail/qDetail?qa_id=" + q_id }).then(res => {
              resolve(res);
            })

          }
          else{
            db.collection('qa_home').doc(qa.home_id).get().then(res => {
              var home = res.data;
              console.log(home);
              var msgcontent = {
                remark: "收到来自" + qa.question_nick_name + "的提问：" + qa.question_title,//备注
                qtype: qa.home_title,//问题类型
                date: qa.date_add.Format("yyyy-MM-dd hh:mm")//提交时间
              }
              param.msg.sendMsg(db, { com: param.com, req: param.req, to_user_id: qa.home_user_id, userInfo: param.userInfo, msgtype: 1, msgcontent: msgcontent, formid: home.formid, path: "pages/qa/myQa/qDetail/qDetail?qa_id=" + q_id }).then(res => {
                resolve(res);
              })



            }).catch(e => {
              console.log("获取home异常:" + JSON.stringify(e));
              console.log(e);
              resolve({ code: 0, msg: "问题找不到了哦" });
            })

          }
        }).catch(e=>{
          console.log(e);
          console.log("error:"+JSON.stringify(e));
          resolve({ code: 0, msg: "以前的问题找不到咯" });
        })


     



      
    }).catch(e=>{
      console.log("发送异常："+JSON.stringify(e));
      console.log(e);
      resolve({code:0,msg:"问题找不到了哦"});
    })

    
  })
  
}
function sendQAA(db,param){
  return new Promise((resolve, reject) => {

    var q_id = param.q_id;
    db.collection('qa').doc(q_id).get().then(res => {
      var qa = res.data;
      var msgcontent = {
        title: qa.home_title,
        answer_user_name: qa.answer_nick_name,
        date_answer: qa.date_answer.Format("yyyy-MM-dd hh:mm"),
        q_content: qa.question_title,
        a_content: qa.answer_url?"语音回复（点击查看...）":"点击查看..."
      }
      param.msg.sendMsg(db, { com: param.com, req: param.req, to_user_id: qa.question_user_id, userInfo: param.userInfo, msgtype: 2, msgcontent: msgcontent, formid: qa.formid, path: "pages/qa/myQa/qDetail/qDetail?qa_id=" + q_id }).then(res => {
        resolve(res);
      })
    }).catch(e => {
      console.log("qa查询出错：" + JSON.stringify(e));
      resolve({ code: 0, msg: "问题找不到了哦" });
    })


  })
}
Date.prototype.Format = function (fmt) { //author: meizz   
  var o = {
    "M+": this.getMonth() + 1,                 //月份   
    "d+": this.getDate(),                    //日   
    "h+": this.getHours(),                   //小时   
    "m+": this.getMinutes(),                 //分   
    "s+": this.getSeconds(),                 //秒   
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度   
    "S": this.getMilliseconds()             //毫秒   
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}  
module.exports.sendMsg = sendMsg;
module.exports.sendQAQ = sendQAQ;
module.exports.sendQAA = sendQAA;