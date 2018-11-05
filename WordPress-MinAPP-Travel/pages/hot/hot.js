/*
 * 
 * WordPres Mini APP For Travel
 * Author: 艾码汇
 * Github:  https://github.com/dchijack/WordPress-MinAPP-For-Travel
 * 技术支持：https://www.imahui.com  微信公众号：WordPress(搜索微信号：WPGeek)
 * 
 */
// pages/hot/hot.js
import config from '../../utils/config.js';
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var wxApi = require('../../utils/wxApi.js');
var wxRequest = require('../../utils/wxRequest.js');
var WxParse = require('../../wxParse/wxParse.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    title: '文章专题',
    postsList: {},
    loading: false,
    hasitmes: false,
    noitems: false,
    isDisplay: "nodisplay",
    tabsItems: [
      // id name selected 选中状态
      { id: '1', name: '热门阅读', selected: true },
      { id: '2', name: '大家喜欢', selected: false },
      { id: '3', name: '热评文章', selected: false },
      { id: '4', name: '最新评论', selected: false }
    ],
    tab: '1',
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    self.fetchPostsData("1");
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
   * 页面点击重新加载事件的处理函数
   */
  reLoad: function (e) {
    var self = this;
    self.fetchPostsData(self.data.tab);
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var title = "分享“" + config.getAppSite + "”文章排行榜";
    var path = "pages/hot/hot";
    return {
      title: title,
      path: path,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  /**
   * 切换标签
   */
  onTapTag: function (e) {
    var self = this;
    var tab = e.currentTarget.id;
    var tabsItems = self.data.tabsItems;
    // 切换 topBarItem 
    for (var i = 0; i < tabsItems.length; i++) {
      if (tab == tabsItems[i].id) {
        tabsItems[i].selected = true;
      } else {
        tabsItems[i].selected = false;
      }
    }
    self.setData({
      tabsItems: tabsItems,
      tab: tab
    })
    if (tab !== 0) {
      self.fetchPostsData(tab);
    } else {
      self.fetchPostsData("1");
    }
  },
  /**
   * 获取文章数据
   */
  fetchPostsData: function (tab) {
    var self = this;
    self.setData({
      postsList: []
    });
    wx.showLoading({
      title: '正在加载',
      mask: true
    });
    var getTopHotPostsRequest = wxRequest.getRequest(Api.getRankingPosts(tab));
    getTopHotPostsRequest.then(response => {
      if (response.statusCode === 200) {
        self.setData({
          hasitmes:true,
          noitems: false,
          isDisplay: "display",
          postsList: self.data.postsList.concat(response.data.map(function (item) {
            //console.log(item);
            var strdate = item.date
            if (item.thumbnail) {
              if (item.thumbnail == null || item.thumbnai == '') {
                item.thumbnail = '../../images/default.png';
              }
            } else {
              if (item.meta.thumbnail == null || item.meta.thumbnai == '') {
                item.meta.thumbnail = '../../images/default.png';
              }
            }
            item.date = util.cutstr(strdate, 10, 1);
            item.title.rendered = util.ellipsisHTML(item.title.rendered); // 替换省略
            return item;
          })),
        });
      } else if (response.statusCode === 404) {
        console.log('加载数据失败, 可能缺少相应的数据');
        self.setData({
          noitems:true
        });
      }
    })
    .catch(function () {
      wx.hideLoading();
      if (data.page == 1) {
        self.setData({
          loading: true,
        });
      } else {

      }
    })
    .finally(function () {
      setTimeout(function () {
        wx.hideLoading();
      }, 1500);
    });
  },
  /**
   * 查看文章详情
   */
  redictDetail: function (e) {
    var id = e.currentTarget.id,
    url = '../detail/detail?id=' + id;
    wx.navigateTo({
      url: url
    })
  }
})