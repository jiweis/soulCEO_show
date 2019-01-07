function soso(db, param) {
  return new Promise((resolve, reject) => {
    var tag = param.tag;
    db.collection('soso')
      .where({
        tags: tag
      })
      .limit(10)
      .get()
      .then(res => {
        console.log(res.data);
        resolve({ code: 1, msg: "查询成功",data:res.data });
      })
      .catch(err => {
        console.error(err);
        resolve({ code: 0, msg: "查询失败" });
      })
  });
}

module.exports.soso = soso;