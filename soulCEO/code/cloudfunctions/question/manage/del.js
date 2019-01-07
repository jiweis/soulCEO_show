
function deleteFunc(db,param){
  return new Promise((resolve, reject) => {
    var question_id=param.event.question_id;
    db.collection('question').doc(question_id).remove().then(res=>{
      if (res.stats.removed>0){

        db.collection('option').where({
          question_id: question_id
        }).remove().then(res=>{

          if (res.stats.removed==0){
            console.log("option删除失败:" + JSON.stringify(res));  
          }
          db.collection('que_opt_tags').where({
            question_id: question_id
          }).remove().then(res => {
            if (res.stats.removed > 0){
              resolve({ code: 1, msg: "删除成功" });
            }
            else{
              resolve({ code: 0, msg: "删除成功，但que_opt_tags删除失败" });
            }
          }).catch(e=>{
            console.log("que_opt_tags删除异常:" + JSON.stringify(e));
            resolve({ code: 0, msg: "删除成功，但que_opt_tags删除异常" });
          })

        }).catch(e=>{
          console.log("option删除异常:" + JSON.stringify(e));
          resolve({ code: 0, msg: "删除成功，但option删除异常" });
        })

      }
      else{
        console.log("question删除失败:"+JSON.stringify(res));
        resolve({code:0,msg:"删除失败"});
      }
    }).catch(e=>{
      console.log("question删除异常:" + JSON.stringify(e));
      resolve({ code: 0, msg: "删除异常" });
    });
  })
}

module.exports.del=deleteFunc;