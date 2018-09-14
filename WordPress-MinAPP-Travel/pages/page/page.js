/*
 * 
 * WordPres Mini APP For Travel
 * Author: 艾码汇
 * Github:  https://github.com/dchijack/WordPress-MinAPP-For-Travel
 * 技术支持：https://www.imahui.com  微信公众号：WordPress(搜索微信号：WPGeek)
 * 
 */
// pages/page/page.js
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
    title: '页面内容',
    page: {},
    previewList: [],
    isDisplay: 'nodisplay',
    wxParseData: [],
    dialog: {
      title: '',
      content: '',
      hidden: true
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    self.fetchData(options.id);
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
  onPullDownRefresh: function (options) {
    var self = this;
    self.setData({
      page: {},
      previewList: [],
      isDisplay: 'nodisplay',
      wxParseData: []
    });
    self.fetchData(options.id);
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
      title: '分享“' + config.getAppSite + '”：' + this.data.page.title.rendered + '页面',
      path: 'pages/page/page?id=' + this.data.page.id,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  /**
   * 点击预览图
   */
  wxParseImg: function (e) {
    var self = this;
    var href = e.currentTarget.dataset.src;
    self.setData({ previewList: href });
    wx.previewImage({
      current: href,
      urls: self.data.previewList
    })
  },
  /**
   * 获取页面数据
   */
  fetchData: function (id) {
    var self = this;
    var getPageRequest = wxRequest.getRequest(Api.getPageByID(id));
    getPageRequest.then(response => {
      //console.log(response);
      WxParse.wxParse('article', 'html', response.data.content.rendered, self, 5);
      self.setData({
        page: response.data,
        isDisplay: "display"
      });
    })
    .then(response => {

    })
  }
})