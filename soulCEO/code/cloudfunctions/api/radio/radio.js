function ThumbsUp(db, param) {
  return new Promise((resolve, reject) => {
    var radio_item_id = param.radio_item_id;
    var reqData = param.reqData;
    var user_id = reqData.user_id;
    db.collection('radio_dynamic')
      .where({
        user_id: user_id,
        type:1,
        radio_item_id: radio_item_id
      }).count().then(res => {
        console.log("res.total:"+res.total);
        if (res.total>0){
          resolve({ code: 0, msg: "你已经点过赞了哦" });
        }
        else{
          db.collection('user').doc(user_id).get().then(res => {
            var user=res.data;
            var radio_dynamicReqdata = {
              type: 1,
              user_id: user_id,
              user_name: user.nick_name,
              user_avatar: user.avatar_url,
              content: user.nick_name + "觉得很赞👍",
              date_add: db.serverDate(),
              date_update: db.serverDate(),
              radio_item_id: radio_item_id};
            db.collection('radio_dynamic').add({
              // data 字段表示需新增的 JSON 数据
              data: radio_dynamicReqdata
            })
              .then(res => {
                radio_dynamicReqdata._id=res._id;
                const _ = db.command;
                db.collection('radio_item').doc(radio_item_id).update({
                  data: {
                    thumbs_num: _.inc(1)
                  }
                })
                  .then(res => {
                    db.collection('radio_item').doc(radio_item_id).get().then(res => {
                      var radio_item = res.data;

                      db.collection('radio_collect').add({
                        data: {
                          user_id: user_id,
                          radio_item_id: radio_item_id,
                          date_add: db.serverDate(),
                          radio_title: radio_item.title + "-" + radio_item.author
                        }
                      })
                        .then(res => {
                          console.log(res);
                          radio_dynamicReqdata.date_add=new Date();
                          radio_dynamicReqdata.date_update=new Date();
                          resolve({ code: 1, msg: "点赞成功", radio_dynamic: radio_dynamicReqdata});
                        })
                        .catch(err => {
                          console.log("radio_item更新点赞次数出错：" + JSON.stringify(err));
                          resolve({ code: 0, msg: "点赞失败，稍后再试吧" });
                        }) 
                     
                    }).catch(err => {
                      console.log("radio_item更新点赞次数出错：" + JSON.stringify(err));
                      resolve({ code: 0, msg: "点赞失败，稍后再试吧" });
                    }) 



                  

                  })
                  .catch(err => {
                    console.log("radio_item更新点赞次数出错：" + JSON.stringify(err));
                    resolve({ code: 0, msg: "点赞失败，稍后再试吧" });
                  }) 




              })
              .catch(err=>{
                console.log("radio_dynamic新增出错："+JSON.stringify(err));
                resolve({ code: 0, msg: "点赞失败，稍后再试吧" });
              }) 
          }).catch(err => {
            console.log("user查询出错：" + JSON.stringify(err));
            resolve({ code: 0, msg: "点赞失败，稍后再试吧" });
          }) 


        }
        
      })
      .catch(err => {
        console.error(err);
        resolve({ code: 0, msg: "点赞繁忙，请稍后再试哦" });
      })


  });
}
function sendFlower(db, param) {
  return new Promise((resolve, reject) => {
    var user_id = param.user_id;
    var radio_item_id = param.radio_item_id;
    var flower_type = ["可爱", "勇敢", "萌萌", "非常傲娇", "高大上", "羞死人", "充满爱意", "闭月羞花", "清艳脱俗","见多识广"];
    var ran = Math.ceil(Math.random() * flower_type.length)-1;
    db.collection('user_account')
      .where({
        user_id: user_id
      })
      .limit(1)
      .get()
      .then(res => {
        if(res.data.length<=0){
          resolve({ code: 2, msg: "鲜花余额不足" });
        }
        else{
          if (res.data[0].flower_num<=0){
            resolve({ code: 2, msg: "鲜花余额不足" });
          }
          else{
            var user_account_id = res.data[0]._id;
            db.collection('user').doc(user_id).get().then(res=>{
              var user = res.data;
              var content = user.nick_name + "送了一朵" + flower_type[ran] + "的小花 🌹";
              var reqData = {
                type: 2,//1:点赞 2:送花
                user_id: user_id,
                user_name: user.nick_name,
                user_avatar: user.avatar_url,
                content: content,
                date_add: db.serverDate(),
                date_update: db.serverDate(),
                radio_item_id: radio_item_id
              };
              const _ = db.command;
              db.collection('user_account').doc(user_account_id).update({
                data: {
                  flower_num: _.inc(-1)
                }
              })
                .then(res => {
                  db.collection('radio_dynamic').add({
                    data: reqData
                  }).then(res => {
                    reqData.date_add = new Date(); reqData.date_update = new Date();
                    reqData._id = res._id;
                    resolve({ code: 1, msg: "送花成功", radio_dynamic: reqData });
                  }).catch(err => {
                    console.error("radio_dynamic新增异常：" + JSON.stringify(err));
                    resolve({ code: 0, msg: "送花繁忙，请稍后再试哦" });
                  })

                })
                .catch(err => {
                  console.error("user_account减少鲜花数量异常：");
                  console.log(err);
                  resolve({ code: 0, msg: "送花繁忙，请稍后再试哦" });
                })





            })
            
          }
        }
      })
      .catch(err => {
        console.error("user_account查询异常：");
        console.log(err);
        resolve({ code: 0, msg: "送花繁忙，请稍后再试哦" });
      })

  });
}
module.exports.ThumbsUp = ThumbsUp;
module.exports.sendFlower = sendFlower;