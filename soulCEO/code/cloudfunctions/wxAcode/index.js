// 云函数入口文件
const cloud = require('wx-server-sdk')
const req = require('request')
var md5 = require("md5")
const fs = require('fs')
const path = require('path')
cloud.init()
const db = cloud.database()
// 云函数入口函数
//请求参数
/* {
  page:"",//小程序码路径
  acode_scene:""//小程序码参数
} */

exports.main = async(event, context) => {
  var appId = event.userInfo.appId;
  var openId = event.userInfo.openId;
  var page = event.page; //例如 pages/index/index
  var sceneMd5 = md5(event.acode_scene);

  return new Promise((resolve, reject) => {

    db.collection('app_info')
      .where({
        appid: appId
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

            req(access_token_url, function(error, response, data) {
              var apitokenobj = JSON.parse(data);
              var access_token = apitokenobj.access_token;
              var expires_in = apitokenobj.expires_in;
              console.log(apitokenobj);
              console.log("access_token的结果：" + JSON.stringify(apitokenobj));




              db.collection('app_info').where({
                appid: appId
              }).update({
                data: {
                  access_token: access_token,
                  date_update: db.serverDate(),
                  expires_in: expires_in
                },
              }).then(res => {
                console.log("access_token获取成功后：" + JSON.stringify(res));
                //access_token获取成功后
                access_token_after(event, sceneMd5, page, access_token).then(res => {
                  resolve(res);
                });
              }).catch(e => {
                console.error(e);
                console.log("app_info修改异常异常：：：appId:" + appId + "......expires_in:" + expires_in + "....." + JSON.stringify(e));
                resolve({
                  code: 0,
                  msg: "操作失败"
                }); //此为返回结果
              })




            });
          } else {
            //access_token获取成功后
            access_token_after(event, sceneMd5, page, app_info.access_token).then(res => {
              resolve(res);
            });
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




  })


}

function access_token_after(event, sceneMd5, page, access_token) {
  return new Promise((resolve, reject) => {
    db.collection('wx_acode').where({
      scene_md5: sceneMd5,
      page: page
    }).get().then(res => {
      var wx_acode_obj = null;
      if (res.data.length > 0) {
        wx_acode_obj = res.data[0];
      }

      if (wx_acode_obj != null) {

        if (wx_acode_obj.acode_cloud_id) {
          resolve({
            code: 1,
            msg: "",
            acode_cloud_id: wx_acode_obj.acode_cloud_id,
            acode_cloud_Path: wx_acode_obj.acode_cloud_path
          }); //此为返回结果
        } else {
          var thisRes = getWXACodeUnlimit({
            access_token: access_token,
            wx_acode: wx_acode_obj,
            event:event
          });
          resolve(thisRes); //此为返回结果
        }

      } else {
        var _id = "";
        db.collection('wx_acode').add({
          data: {
            page: page,
            scene_md5: sceneMd5,
            scene: event.acode_scene
          }
        }).then(res => {
          _id = res._id;
          if (_id) {

            var thisRes = getWXACodeUnlimit({
              access_token: access_token,
              wx_acode: {
                _id: _id,
                page: page,
                scene_md5: sceneMd5,
                scene: event.acode_scene
              },
              event: event
            });
            resolve(thisRes); //此为返回结果
          } else {
            console.error("wx_acode新增失败");
            resolve({
              code: 0,
              msg: "操作失败"
            }); //此为返回结果
          }
        }).catch(e => {
          console.error("wx_acode新增失败_" + JSON.stringify(e));
          resolve({
            code: 0,
            msg: "操作失败"
          }); //此为返回结果
        })





      }


    }).catch(e => {
      console.error("wx_acode获取异常：" + JSON.stringify(e));
      resolve({
        code: 0,
        msg: "操作失败"
      });
    });



  })
}

function getWXACodeUnlimit(param) {
  return new Promise((resolve, reject) => {
    if (!param.access_token) {
      resolve({
        code: 0,
        msg: "操作失败"
      });
    }
    var url = "https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=" + param.access_token;

    var filename = "acode_" + md5(param.wx_acode.page + "_" + param.wx_acode.scene) + ".jpg";

    var requestData = JSON.stringify({
      scene: param.wx_acode.scene_md5,
      page: param.wx_acode.page,
      width: 430,
      auto_color: true,
      line_color: {
        "r": "178",
        "g": "34",
        "b": "34"
      },
      is_hyaline: true
    });

    req({
        method: 'POST',
        url: url,
        body: requestData
      }).pipe(fs.createWriteStream(path.join("/tmp", filename)))
      .on('close', function() {
        var dat = new Date();

        const fileStream = fs.createReadStream(path.join("/tmp", filename))
        var acode_cloud_Path = 'test/minione/acode/' + (dat.getFullYear().toString() + "-" + dat.getMonth().toString() + "-" + dat.getDate().toString()) + "/" + filename;
        console.log("acode_cloud_Path:" + acode_cloud_Path);
        cloud.uploadFile({
          cloudPath: acode_cloud_Path,
          fileContent: fileStream,
        }).then(res => {
          // get resource ID
          console.log(res.fileID)
          acode_cloud_id = res.fileID;
          update_wx_acode(param.wx_acode.scene_md5, param.wx_acode.page, acode_cloud_id, acode_cloud_Path, param.event).then(res => {

            if (res.code == 1) {
              resolve({
                code: 1,
                msg: "",
                acode_cloud_id: acode_cloud_id,
                acode_cloud_Path: acode_cloud_Path
              }); //此为返回结果
            } else {
              resolve({
                code: 1,
                msg: "",
                acode_cloud_id: acode_cloud_id,
                acode_cloud_Path: acode_cloud_Path
              }); //此为返回结果
            }

          }).catch(e => {
            console.log("保存文件后更新失败:");
            console.log(e);
            resolve({
              code: 0,
              msg: "操作失败"
            });
          })

        }).catch(error => {
          // handle error
          console.log("保存文件失败:");
          console.log(error);
          resolve({
            code: 0,
            msg: "操作失败"
          });
        })

      }); //将返回的数据流保存为图片 


  })


}

function update_wx_acode(sceneMd5, page, acode_cloud_id, acode_cloud_Path,event) {
  return new Promise((resolve, reject) => {
    console.log("update_wx_acode入参：sceneMd5:" + sceneMd5 + ",page:" + page);
    db.collection('wx_acode').where({
      scene_md5: sceneMd5,
      page: page
    }).update({
      data: {
        acode_cloud_id: acode_cloud_id,
        acode_cloud_path: acode_cloud_Path
      },
    }).then(res => {
      

     //更新需要缓存的表
      if (event.acode_table && event.acode_table_id && event.acode_field){
        try {
          db.collection(event.acode_table).doc(event.acode_table_id).update({
            data: {
              [event.acode_field]: acode_cloud_id
            }
          }).then(res=>{
            resolve({
              code: 1,
              msg: ""
            });
          })
        } catch (e) {
          console.error("更新需要缓存的表异常"+JSON.stringify(e));
          resolve({
            code: 1,
            msg: ""
          });
        }
      }else{
        resolve({
          code: 1,
          msg: ""
        });
      }
     
    



    }).catch(e => {
      console.error("最后更新wx_acode异常：" + JSON.stringify(e));
      resolve({
        code: 0,
        msg: "...wx_acode更新失败"
      });
    })

  })



}