/*
 * 
 * WordPres Mini APP For Travel
 * Author: 艾码汇
 * Github:  https://github.com/dchijack/WordPress-MinAPP-For-Travel
 * 技术支持：https://www.imahui.com  微信公众号：WordPress(搜索微信号：WPGeek)
 * 
 */
// pages/rand/rand.js
import config from '../../utils/config.js'
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var wxApi = require('../../utils/wxApi.js');
var wxRequest = require('../../utils/wxRequest.js');
var WxParse = require('../../wxParse/wxParse.js');
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    postsList: [],
    loading: "nodisplay",
    isDidplay:"nodisplay"
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    self.fetchRandomPosts();    
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
    wx.setStorageSync('openLinkCount', 0);
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
    var self = this;
    self.setData({
      postsList: [],
      loading: "nodisplay",
      isDidplay: "nodisplay"
    });
    self.fetchRandomPosts();
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
      title: '“' + config.getAppSite + '”分享有趣旅行,讲述奇闻趣事',
      path: 'pages/index/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  /**
   * 获取滑动文章
   */
  fetchRandomPosts: function () {
    var self = this;
    var getPostsRequest = wxRequest.getRequest(Api.getRandomPosts());
    getPostsRequest.then(response => {
      //console.log(response);
      if (response.statusCode == '200' && response.data.length > 0) {
        self.setData({
          postsList: response.data,
          postsList: self.data.postsList.concat(response.data.map(function (item) {
            if (item.thumbnail) {
              if (item.thumbnail == null || item.thumbnail == '') {
                item.thumbnail = "../../images/default.png";
              }
            } else {
              if (item.meta.thumbnail == null || item.meta.thumbnail == '') {
                item.meta.thumbnail = "../../images/default.png";
              }
            }
            //console.log(item);
            item.title.rendered = util.ellipsisHTML(item.title.rendered); // 替换省略
            return item;
          })),
          isDidplay: "display",
          loading: "nodisplay",
        });
      } else {
        //console.log(response.data);
        self.setData({
          loading: "display",
        });
      }
    })
    .then(response => {
     
    })
    .catch(function (response) {
      //console.log(response);
      self.setData({
        loading: "display"
      });
    })
    .finally(function () {
		wx.stopPullDownRefresh;
    });
  },
  /**
   * 跳转至查看文章详情
   */
  redictDetail: function (e) {
    // console.log('查看文章');
    var id = e.currentTarget.id,
      url = '../detail/detail?id=' + id;
    wx.navigateTo({
      url: url
    })
  }
})