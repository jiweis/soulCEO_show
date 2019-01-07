

//SaveAppoint请求参数
/* var SaveAppointParam = {
  "type": "saveappoint",
  "data": {
    "user_id": "",
    "real_name": "", //老师的真实姓名
    "appoint": {
      "_id": "",
      "appoint_type_id": "", //预约类型
      "appoint_name": "",
      "date": 0,
      "remark": "",
      "slot": [{
        "date_begin": 0,
        "date_end": 0,
        "reserve_info": {
          "user_id": "",
          "avatar_url": "",
          "nick_name": "",
          "real_name": "",
          "mobile": "",
          "but_info": ""
        }

      }],
      "setting": {
        "one_times": 0, //每人能预约几个时间段
        "reserve_info": { //希望预约者提供的信息
          "is_real_name": true,
          "is_mobile": true
        }
      }
    },
    "save_tmp_type": 1, //保存模板方式  0:不保存模板,1:保存为新模板,2:覆盖原模板
    "tmp_id": 0 //模板_id,save_tmp_type为2时必须传
  }
} */



/* var ToOrderParam = {
  "type": "toorder",
  "data": {
    "user_id": "",
    "appoint_id": "",
    "real_name": "", //is_real_name时必传
    "slot_index": 0,
    "mobile": "" //is_mobile时必传
  }
}; */
