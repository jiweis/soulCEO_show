function getAppInfo(db, param) {
  return new Promise((resolve, reject) => {
    var req = param.req;
    db.collection('app_info')
      .where({
        appid: param.appId
      })
      .limit(1)
      .get().then(res => {
        var app_info = {};
        if (res.data.length > 0) {
          app_info = res.data[0];
          var access_token_url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + app_info.appid + "&secret=" + app_info.appsecret;
          var t_s = app_info.date_update.getTime();
          var exTime = new Date();
          exTime.setTime(t_s + app_info.expires_in * 1000 - 5 * 1000 * 60); //提前5分钟刷新
          if (exTime < new Date()) { //已过期重新获取

            req(access_token_url, function (error, response, data) {
              var apitokenobj = JSON.parse(data);
              var access_token = apitokenobj.access_token;
              var expires_in = apitokenobj.expires_in;
              console.log(apitokenobj);
              console.log("access_token的结果：" + JSON.stringify(apitokenobj));
              db.collection('app_info').where({
                appid: app_info.appid
              }).update({
                data: {
                  access_token: access_token,
                  date_update: db.serverDate(),
                  expires_in: expires_in
                },
              }).then(res => {
                console.log("access_token获取成功后：" + JSON.stringify(res));
                //access_token获取成功后
                resolve({ code: 1, app_info: { access_token: access_token}});
              }).catch(e => {
                console.error(e);
                console.log("app_info修改异常异常：：：appId:" + app_info.appid + "......expires_in:" + expires_in + "....." + JSON.stringify(e));
                resolve({
                  code: 0,
                  msg: "操作失败"
                }); //此为返回结果
              })




            });
          } else {
            //access_token获取成功后
            resolve({ code: 1, app_info: { access_token: app_info.access_token } });
          }



        } else {
          console.log("app_info没查询到");
          resolve({
            code: 0,
            msg: "操作失败"
          }); //此为返回结果
        }
      }).catch(e => {
        console.log("app_info查询异常：" + JSON.stringify(e));
        resolve({
          code: 0,
          msg: "操作失败"
        }); //此为返回结果
      });



  });
}
function getUser(db, param){
  return new Promise((resolve, reject) =>{
    db.collection('user').doc(param.user_id).get().then(res=>{
      resolve({code:1,user:res.data});
    }).catch(e=>{
      resolve({ code: 0, user: "接受者信息获取失败" });
    })
  })
}
module.exports.getAppInfo = getAppInfo;
module.exports.getUser = getUser;