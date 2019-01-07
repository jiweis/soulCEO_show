function getFlower(db, param) {
  return new Promise((resolve, reject) => {
    var date = getFormatDate(new Date());
    var user_id = param.user_id;

    db.collection('system_para')
      .limit(1)
      .get()
      .then(res=>{
        var flower_num_everyday=5;
        if (res.data.length>0){
          if (res.data[0].flower_num_everyday){
            flower_num_everyday = res.data[0].flower_num_everyday;
          }
        }

        var system_para=res.data[0];
        db.collection('user_account')
          .where({
            user_id: user_id,
            date_update: db.ser
          })
          .limit(1)
          .get()
          .then(res => {
            if (res.data.length > 0) {
              var account = res.data[0];
              if (getFormatDate(account.date_update) == date) {
                resolve({ code: 0, msg: "你今天已经领过鲜花了哟" });
              }
              else {
                const _ = db.command;
                db.collection('user_account').doc(account._id).update({
                  data: {
                    date_update: db.serverDate(),
                    flower_num: _.inc(flower_num_everyday)
                  }
                })
                  .then(res => {
                    resolve({ code: 1, msg: "恭喜你，成功领取" + flower_num_everyday+"朵鲜花" });
                  })
                  .catch(err => {
                    resolve({ code: 0, msg: "领取失败，请稍后再试！" });
                  })
              }
            }
            else {

              var reqData = {
                user_id: user_id,
                date_update: db.serverDate(),
                flower_num: flower_num_everyday,
                date_add: db.serverDate()
              };
              db.collection('user_account').add({
                data: reqData
              })
                .then(res => {
                  if (res._id) {
                    resolve({ code: 1, flower_num: flower_num_everyday, msg: "恭喜你，成功领取" + flower_num_everyday+"朵鲜花" });
                  }
                  console.log(res)
                }).catch(err => {
                  resolve({ code: 0, msg: "领取失败，请稍后再试！" });
                })
            }

          })
          .catch(err => {
            console.error(err);
            resolve({ code: 0, msg: "领取失败，请稍后再试！" });
          })

      })

  });
}
function getFormatDate(date) {
  var seperator1 = "-";
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var currentdate = year + seperator1 + month + seperator1 + strDate;
  return currentdate;
}

module.exports.getFlower = getFlower;