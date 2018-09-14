/*
 * 
 * WordPres Mini APP For Travel
 * Author: 艾码汇
 * Github:  https://github.com/dchijack/WordPress-MinAPP-For-Travel
 * 技术支持：https://www.imahui.com  微信公众号：WordPress(搜索微信号：WPGeek)
 * 
 */
// pages/person/person.js
import config from '../../utils/config.js'
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var auth = require('../../utils/auth.js');
var wxApi = require('../../utils/wxApi.js');
var wxRequest = require('../../utils/wxRequest.js');
var WxParse = require('../../wxParse/wxParse.js');
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    telphone:"4008850663",
    pagelist: [],
    loginModal: false,
    userInfo: app.globalData.userInfo
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    if (!app.globalData.isGetOpenid) {
      self.getUsreInfo();
    } else {
      self.setData({
        userInfo: app.globalData.userInfo
      });
    }
    self.fetchPostsData();
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
    return {
      title: '“' + config.getAppSite + '”：分享有趣旅行,讲述奇闻趣事。',
      path: 'pages/person/person',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  /**
   * 点击拔打电话
   */
  dailTelTap: function () {
    var telphone;
    telphone = this.data.telphone;
    wx.makePhoneCall({
      phoneNumber: telphone,
    });
  },
  /**
   * 获取页面列表
   */
  fetchPostsData: function () {
    var self = this;
    self.setData({
      pagelist: []
    });
    var getPagesRequest = wxRequest.getRequest(Api.getPages());
    getPagesRequest.then(response => {
      if (response.statusCode === 200) {
        self.setData({
          pagelist: self.data.pagelist.concat(response.data.map(function (item) {
            //console.log(item);
            return item;
          })),
        });
      } else if (response.statusCode === 404) {
        console.log('加载数据失败,可能缺少相应的数据');
      }
    })
      .then(resonse => {
        self.setData({
          userInfo: app.globalData.userInfo
        });
      })
  },
  /**
   * 用户授权查询
   */
  userAuthorization: function () {
    var self = this;
    // 判断是否是第一次授权，非第一次授权且授权失败则进行提醒
    wx.getSetting({
      success: function success(res) {
        console.log(res.authSetting);
        var authSetting = res.authSetting;
        if (!('scope.userInfo' in authSetting)) {
          console.log('第一次授权');
          self.setData({ loginModal: true })
        } else {
          console.log('不是第一次授权', authSetting);
          // 没有授权的提醒
          if (authSetting['scope.userInfo'] === false) {
            wx.showModal({
              title: '用户未授权',
              content: '如需正常使用评论、点赞、赞赏等功能需授权获取用户信息。是否在授权管理中选中“用户信息”?',
              showCancel: true,
              cancelColor: '#296fd0',
              confirmColor: '#296fd0',
              confirmText: '设置权限',
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                  wx.openSetting({
                    success: function success(res) {
                      console.log('打开设置', res.authSetting);
                      var scopeUserInfo = res.authSetting["scope.userInfo"];
                      if (scopeUserInfo) {
                        auth.getUsreInfo(null);
                      }
                    }
                  });
                }
              }
            })
          } else {
            auth.getUsreInfo(null);
          }
        }
      }
    });
  },
  /**
   * 同意授权信息
   */
  bindGetUserinfo: function (e) {
    var userInfo = e.detail.userInfo;
    var self = this;
    if (userInfo) {
      auth.getUsreInfo(e.detail);
      self.setData({ userInfo: userInfo, loginModal: false })
    }
    setTimeout(function () {
      self.setData({ loginModal: false })
    }, 1200);
  },
  /**
   * 弹出框蒙层截断 touchmove 事件
   */
  preventTouchMove: function () {

  },
  /**
   * 隐藏模态对话框
   */
  hideModal: function () {
    this.setData({
      loginModal: false
    });
  },
  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function () {
    this.hideModal();
  },
  /**
  * 获取用户信息
  */
  getUsreInfo: function () {
    var self = this;
    var wxLogin = wxApi.wxLogin();
    var jscode = '';
    wxLogin().then(response => {
      jscode = response.code
      var wxGetUserInfo = wxApi.wxGetUserInfo()
      return wxGetUserInfo()
    })
      //获取用户信息
      .then(response => {
        console.log(response.userInfo);
        console.log("成功获取用户信息(公开信息)");
        app.globalData.userInfo = response.userInfo;
        app.globalData.isGetUserInfo = true;
        self.setData({
          userInfo: response.userInfo
        });
        var url = Api.getOpenidUrl();
        var data = {
          js_code: jscode,
          encryptedData: response.encryptedData,
          iv: response.iv,
          avatarUrl: response.userInfo.avatarUrl
        }
        var postOpenidRequest = wxRequest.postRequest(url, data);
        //获取openid
        postOpenidRequest.then(response => {
          if (response.data.status == '200') {
            console.log("openid 获取成功");
            app.globalData.openid = response.data.openid;
            app.globalData.isGetOpenid = true;
          } else {
            console.log(response.data.message);
          }
        })
      }).catch(function (error) {
        console.log('error: ' + error.errMsg);
        self.userAuthorization();
      })
  },
  /**
  * 确认数据
  */
  confirm: function () {
    this.setData({
      'dialog.hidden': true,
      'dialog.title': '',
      'dialog.content': ''
    })
  }
})