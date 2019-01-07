// miniprogram/pages/question/question.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    themeInfo: {},
    question_list: [],
    act_question_index: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id = options.id;
    var obj = this;
    app.getuserInfo({
      isGetInfo: true,
      success: function (user) {
        obj.setData({ user: user });
        getThemeInfo(obj, id);
        getQuestions(obj, id);
      }
    });

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  optionChange: function (e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail.value);
    var obj = this;
    var question_id = e.target.dataset.question_id;
    var qindex = e.target.dataset.qindex;
    var checks = e.detail.value;
    if (checks.length <= 0) { return; }
    var optionIndex = checks[checks.length - 1];
    console.log(optionIndex);
    var questionIndex = obj.data.question_list.indexOf(obj.data.question_list.filter(function (ev) { return ev.question_id == question_id && ev.theme_id == obj.data.themeInfo._id; })[0]);
    var question = obj.data.question_list[questionIndex];
    for (var i = 0; i < question.option.length; i++) {
      var setStr = "question_list[" + questionIndex + "].option[" + i + "].selected";
      if (i == optionIndex) {
        obj.setData({ [setStr]: true });
      }
      else {
        obj.setData({ [setStr]: false });
      }
    }

    var animation = wx.createAnimation({
      duration: 1000,
      timingFunction: 'ease',
    })
    this.animation = animation
    animation.rotate(360).step()

    this.setData({
      animationData: animation.export()
    })
    setTimeout(function () {

      if (obj.data.act_question_index < obj.data.question_list.length - 1) {
        obj.setData({ "act_question_index": qindex + 1 });
      }
      if (qindex == obj.data.question_list.length - 1) {
        submitAnswer(obj);
      }
    }.bind(this), 500)


  }
})


function getThemeInfo(obj, id) {
  const themes = app.com.db.collection('theme').doc(id);
  themes.get({
    success: function (res) {
      console.log(res);
      obj.setData({ "themeInfo": res.data });
      wx.setNavigationBarTitle({ "title": res.data.title })
    }
  })
}

function getQuestions(obj, themeid) {
  const _ = app.com.db.command;
  app.com.db.collection('theme_questions').where({
    theme_id: themeid,
    only_user_id:obj.data.user.user_id
  }).get({
    success: function (res) {
      if(res.data.length<=0){
        app.com.db.collection('theme_questions').where({
          theme_id: themeid,
          only_user_id: _.eq(null)
        }).get({
          success: function (res) {
              console.log(res.data);
              obj.setData({ "question_list": res.data })
          }
        })
      }
      else{
        console.log(res.data);
        obj.setData({ "question_list": res.data })
      }
    }
  })
}
function submitAnswer(obj) {
  wx.showLoading({ title: "正在施展魔法...", mask: true });
  app.getuserInfo({
    isGetInfo: true,
    success: function (user) {
      testResult(obj, user, {
        finish: function () {
          wx.hideLoading();
        }
      });
    }
  });

}

function testResult(obj, user, param) {
  var userid = user.user_id;
  var nickname = user.nickName;
  var themeid = obj.data.themeInfo._id;
  var themetitle = obj.data.themeInfo.title;
  var tag_num = obj.data.themeInfo.tag_num;
  var questions = [];
  var optionids = [];
  var tagtitles = [];
  var DescStr = "";
  for (var i = 0; i < obj.data.question_list.length; i++) {
    var question = obj.data.question_list[i];
    var question_id = question.question_id;
    var question_title = question.question_title;
    var optionIndex = question.option.indexOf(question.option.filter(function (ev) { return ev.selected == true; })[0]);
    var option_id = question.option[optionIndex].option_id;
    var option_title = question.option[optionIndex].title;
    questions.push({
      question_id: question_id,
      question_title: question_title,
      option_id: option_id,
      option_title: option_title
    });
    optionids.push(option_id);
  }
  if (questions.length != obj.data.question_list.length) {
    if (param.finish) { param.finish(); }
    wx.showToast({
      title: "嘿嘿 你还没选完呢",
      icon: 'none',
      duration: 2000
    });
    return;
  }

  if (optionids.length > 5) {
    optionids = getRandomArrayElements(optionids, 5);
  }

  const _ = app.com.db.command
  app.com.db.collection('que_opt_tags').where({
    option_id: _.in(optionids)
  }).count().then(res => {
    //查询总数后
    console.log(res.total);
    var total = res.total;
    var max = total; var min = 0;
    var skipint = parseInt(Math.floor(Math.random() * (max - min + 1) + min));
    if (skipint + tag_num > total) {
      skipint = skipint - tag_num;
    }

    app.com.db.collection('que_opt_tags').where({
      option_id: _.in(optionids)
    }).orderBy('_id', 'desc').limit(skipint).get().then(res => {
      console.log(res.data)
      //查询数据后
      var tags = res.data;
      for (var i = 0; i < tags.length; i++) {
        tagtitles.push({ "tag_id": tags[i].tag_id, "title": tags[i].title });
      }
      if (tagtitles.length <= 0) {
        DescStr = "天机此刻不可泄露，你过一会儿再来吧。";
      }
      else {
        DescStr = tags[parseInt(Math.floor(Math.random() * (tags.length - 0) + 0))].desc;
      }
      var ran = Math.ceil(Math.random() * 7);
      console.log("ran:" + ran);
      //开始提交测试
      var reqdata = {
        dat_answer: new Date(),
        theme_id: themeid,
        theme_title: themetitle,
        user_id: userid,
        nick_name: nickname,
        questions: questions,
        tags: tagtitles,
        Desc: DescStr,
        ran: ran
      };
      app.com.db.collection('answer_record').add({
        data: reqdata
      })
        .then(res => {
          console.log(res);
          var recordid = res._id;
          if (param.finish) { param.finish(); }
          wx.redirectTo({ url: "../testResult/testResult?record_id=" + recordid });

        })
        .catch(console.error)


    })

  })
}

function getRandomArrayElements(arr, count) {
  var shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
  while (i-- > min) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(min);
}