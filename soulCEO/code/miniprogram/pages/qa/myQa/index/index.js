var sliderWidth = 96; // 需要设置slider的宽度，用于计算中间位置
var app = getApp();
var formid;
Page({
  data: {
    tabs: ["本PO主", "待回答"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    qa_homes: [],
    tmpEditShow: false,
    editHomeid: "",
    editHomeIndex: -1,
    editHome: {},
    user: {},
    noAnswers:[]
  },
  onLoad: function() {
    var that = this;
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
    app.getuserInfo({
      isGetInfo: true,
      success: function(user) {
        that.setData({
          user: user
        });
        toGetQa_homes(that);
        addHistory(that);
      }
    });

  },
  noAnswersNextPage:function(){
    var obj=this;
    getNoAnswers(obj);
  },
  tabClick: function(e) {
    var obj=this;
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });

    if (e.currentTarget.id==1){
      getNoAnswers(obj);
    }
  },
  radioChange: function(e) {
    this.setData({
      "editHome.answerer_info_type": e.detail.value
    });

  },
  account:function(e){
    var homeid = e.currentTarget.dataset.homeid;
    var index = e.currentTarget.dataset.index;
    wx.showActionSheet({
      itemList: ["复制该PO主页链接","复制APPID","配置方法"],
      itemColor: "#B22222",
      success: function (res) {
        if (res.tapIndex == 0) {
          wx.setClipboardData({
            data: "pages/qa/poQa/poQa/poQa?home_id=" + homeid, success:function(){
              app.com.showToast({ title: "复制成功",icon:"success" });
          }});
        }
        else if (res.tapIndex == 1){
          var appid = wx.getAccountInfoSync().miniProgram.appId;
          wx.setClipboardData({
            data: appid, success: function () {
              app.com.showToast({ title: "复制成功", icon: "success" });
            }
          });
        }
        else if (res.tapIndex == 2) {
          app.com.alert("复制该PO主页链接，然后在公众号后台配置为自定义菜单（关联小程序可复制APPID去进行关联）。");
        }
        else {
          app.com.showToast({ title: "不支持的操作" });
        }
      }
    });
  },
  ShowEdit: function(e) {
    var homeid = e.currentTarget.dataset.homeid;
    var index = e.currentTarget.dataset.index;
    var obj = this;
    obj.setData({
      tmpEditShow: true,
      editHomeid: homeid ? homeid : "",
      editHomeIndex: index!=undefined ? index : -1
    });
    if (!homeid) {
      obj.setData({
        "editHome": {
          po_avatar_url: obj.data.user.avatarUrl,
          po_nick_name: obj.data.user.nickName,
          answerer_info_type: 1
        }
      });
    } else {
      obj.setData({
        "editHome": obj.data.qa_homes[index]
      });
    }
  },
  closeBox: function() {
    var obj = this;
    obj.setData({
      tmpEditShow: false
    });
  },
  choosehead:function(){
    var obj=this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        console.log(res);
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths;
        if (tempFilePaths.length>0){
          obj.setData({ "editHome.po_avatar_url": tempFilePaths[0], "editHome.isTempAavatar": true });
        }
       
      }
    })
  },
  ShowACode:function(e){
    var homeid = e.currentTarget.dataset.homeid;
    var index = e.currentTarget.dataset.index;
    var obj = this;
    CreateACode(obj,index);
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: 'PO主问答'
    }
  },
  saveHome: function(e) {
    app.com.loading("正在保存中...");
    formid = e.detail.formId;
    console.log(e);
    var obj = this;
    obj.data.editHome.des = e.detail.value.des;
    obj.data.editHome.po_nick_name = e.detail.value.po_nick_name;
    obj.setData({
      editHome: obj.data.editHome
    });

    if (obj.data.editHome.isTempAavatar){
      upFile(obj,{success:function(){
        toSaveHome(obj, {
          finish: function () {
            wx.hideLoading();
          }
        });
      },fail:function(){
        wx.hideLoading();
      }});
    }else{
      toSaveHome(obj, {
        finish: function () {
          wx.hideLoading();
        }
      });
    }

    
  }, delpa:function(e){
    var id = e.currentTarget.dataset.id;
    var index = e.currentTarget.dataset.index;
    var obj=this;
    app.com.db.collection('qa').doc(id).remove()
      .then(res=>{
        obj.data.noAnswers.splice(index,1);
        obj.setData({ noAnswers: obj.data.noAnswers})
        app.com.showToast({
          title: "删除成功",
          icon: "success"
        });
      })
      .catch(console.error)
  }
});

function toGetQa_homes(obj) {
  getQa_homes(obj, obj.data.user);
}

function getQa_homes(obj, user) {
  app.com.db.collection('qa_home')
    .where({
      user_id: user.user_id,
    })
    .skip(0) // 跳过结果集中的前 10 条，从第 11 条开始返回
    .limit(10) // 限制返回数量为 10 条
    .get()
    .then(res => {
      console.log(res.data);
      obj.setData({
        qa_homes: res.data
      });
    })
    .catch(err => {
      console.error(err)
    })
}
function upFile(obj,param){
  if ((!obj.data.editHome.po_avatar_url) || obj.data.editHome.isTempAavatar==false) {
      app.com.showToast({
        title: "操作失败，请重试"
      });
      return;
    }
    var dat = new Date();
    var filename = (dat.getFullYear() + "" + dat.getMonth() + "" + dat.getDate() + "" + dat.getHours() + "" + dat.getMinutes() + "" + dat.getSeconds() + "" + dat.getMilliseconds() + ".jpg");
    var cloudPath = 'test/minione/userdata/po_home/' + obj.data.user.user_id + "/" + (dat.getFullYear() + "-" + dat.getMonth() + "-" + dat.getDate() + "/" + filename);
    console.log("cloudPath:" + cloudPath);
    wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: obj.data.editHome.po_avatar_url, // 小程序临时文件路径
    }).then(res => {
      // get resource ID
      console.log(res.fileID);
      obj.setData({ "editHome.po_avatar_url": res.fileID,"editHome.isTempAavatar":false});
      if (param.success) { param.success();}
    }).catch(error => {
      // handle error
      if(param.fail){param.fail();}
      app.com.showToast({
        title: "操作异常，请稍后再试哦"
      });
    })
}

function toSaveHome(obj, param) {
  if (!obj.data.user.user_id) {
    if (param.finish) {
      param.finish();
    }
    app.com.showToast({
      title: "初始化中,等一会..."
    });
    return;
  }
  if (!obj.data.editHome.des) {
    if (param.finish) {
      param.finish();
    }
    app.com.showToast({
      title: "你还没输入PO主描述呢"
    });
    return;
  }
  if (!obj.data.editHome.po_nick_name) {
    if (param.finish) {
      param.finish();
    }
    app.com.showToast({
      title: "你还没输入PO主名称"
    });
    return;
  }
  if ((!obj.data.editHome.po_avatar_url) || obj.data.editHome.isTempAavatar) {
    if (param.finish) {
      param.finish();
    }
    app.com.showToast({
      title: "你还没添加主页头像呢"
    });
    return;
  }
  if (!obj.data.editHome.answerer_info_type) {
    if (param.finish) {
      param.finish();
    }
    app.com.showToast({
      title: "你还没设置回答者信息展示呢"
    });
    return;
  }
  var reqData = {
    des: obj.data.editHome.des,
    user_id: obj.data.user.user_id,
    po_nick_name: obj.data.editHome.po_nick_name,
    po_avatar_url: obj.data.editHome.po_avatar_url,
    acode_url: null,
    answerer_info_type: obj.data.editHome.answerer_info_type,
    date_update: app.com.db.serverDate(),
    formid: formid
  };
  if (obj.data.editHome._id) {
    app.com.db.collection('qa_home').doc(obj.data.editHome._id).update({
        data: reqData
      })
      .then(res => {
        obj.data.qa_homes[obj.data.editHomeIndex] = reqData;
        obj.setData({
          qa_homes: obj.data.qa_homes,
          tmpEditShow: false
        });
        if (param.finish) {
          param.finish();
        }
        app.com.showToast({
          title: "保存成功",
          icon: "success"
        });
      })
      .catch(e => {
        console.log(e);
        if (param.finish) {
          param.finish();
        }
        app.com.showToast({
          title: "保存失败"
        });
      })
  } else {

    app.com.db.collection('qa_home').where({
      user_id: obj.data.user.user_id
    }).count().then(res => {
      console.log(res.total);

      if (res.total > 10) {
        if (param.finish) {
          param.finish();
        }
        app.com.alert("主页不能超过10个哦，你不能再添加了哦");
        return;
      } else {
        //添加

        reqData.date_add = app.com.db.serverDate();
        app.com.db.collection('qa_home').add({
            // data 字段表示需新增的 JSON 数据
            data: reqData
          })
          .then(res => {
            console.log(res);
            obj.data.editHome._id = res._id;
            obj.data.qa_homes = [obj.data.editHome].concat(obj.data.qa_homes);
            obj.setData({
              qa_homes: obj.data.qa_homes,
              tmpEditShow: false
            });
            if (param.finish) {
              param.finish();
            }
            app.com.showToast({
              title: "保存成功",
              icon: "success"
            });
          })
          .catch(e => {
            console.log(e);
            if (param.finish) {
              param.finish();
            }
            app.com.showToast({
              title: "保存失败"
            });
          })
      }

    }).catch(e=>{
      console.log(e);
      if (param.finish) {
        param.finish();
      }
      app.com.showToast({
        title: "保存失败"
      });
    })



  }

}

function getNoAnswers(obj){
  if (!obj.data.user.user_id){
    app.com.showToast({
      title: "未登录成功，请重新进入"
    });
    return;
  }
  var skip = obj.data.noAnswers.length;
  const _ = app.com.db.command;
  app.com.db.collection('qa')
    .where({
      home_user_id: obj.data.user.user_id,
      answer_user_id:_.eq(null)
    })
    .skip(skip)
    .limit(10)
    .get()
    .then(res => {
      console.log(res.data);
      if(res.data.length>0){
        for(var i=0;i<res.data.length;i++){
          res.data[i].date_add_str = app.com.dateFtt("yyyy-MM-dd hh:mm",res.data[i].date_add)
        }
        obj.setData({ noAnswers: res.data.concat(obj.data.noAnswers) });
      }
      else{
        app.com.showToast({
          title: "没有更多了"
        });
      }
    })
    .catch(err => {
      console.error(err)
    })
}

function CreateACode(obj,index){
  if (obj.data.qa_homes[index].acode_field){
    wx.navigateTo({
      url: '/pages/qa/poQa/poQa/poQa?home_id=' + obj.data.qa_homes[index]._id,
    })
    return;
  }
  wx.cloud.callFunction({
    // 要调用的云函数名称
    name: 'wxAcode',
    // 传递给云函数的event参数
    data: {
      page: "pages/qa/poQa/poQa/poQa",
      acode_scene: "{\"home_id\":\"" + obj.data.qa_homes[index]._id + "\"}",
      acode_table: "qa_home",
      acode_table_id: obj.data.qa_homes[index]._id,
      acode_field: "acode_fileid"
    }
  }).then(res => {
    // output: res.result === 3
    console.log("获取小程序码结果：");
    console.log(res);

    if (res.result.code == 1) {
      obj.setData({ ["qa_homes[" + index+"].acode_field"]: res.result.acode_cloud_id });
    }
    else {

    }
    wx.hideLoading();
    wx.navigateTo({
      url: '/pages/qa/poQa/poQa/poQa?home_id=' + obj.data.qa_homes[index]._id,
    })
  }).catch(err => {
    // handle error
    console.log("获取小程序码出错：");
    console.log(err);
    wx.hideLoading();
  })
}

function addHistory(obj){
  app.com.addHistory({
    user: obj.data.user,
    url: "/pages/qa/myQa/index/index",
    ico: obj.data.user.avatarUrl,
    title: "本PO主"
  });
}