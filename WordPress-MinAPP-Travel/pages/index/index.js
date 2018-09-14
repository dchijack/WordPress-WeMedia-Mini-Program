/*
 * 
 * WordPres Mini APP For Travel
 * Author: 艾码汇
 * Github:  https://github.com/dchijack/WordPress-MinAPP-For-Travel
 * 技术支持：https://www.imahui.com  微信公众号：WordPress(搜索微信号：WPGeek)
 * 
 */
//index.js
import config from '../../utils/config.js'
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var wxApi = require('../../utils/wxApi.js');
var wxRequest = require('../../utils/wxRequest.js');
var WxParse = require('../../wxParse/wxParse.js');
const app = getApp();

Page({
  data: {
    postsList: [],
    swiperList: [],
    Swiper:false,
    isLastPage: false,
    page: 1,
    search: '',
    categories: 0,
    per_page:10,
    loading: false,
    isLoading: "nospinner",
    isDisplay: "display",
    noDisplay: "nodisplay",
    Navigation: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var self = this;
    self.fetchSwiperPosts();
    self.setData({
      Navigation: config.getNavigation
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
      loading: false,
      isDisplay: "nodisplay",
      noDisplay: "nodisplay",
      isLastPage: false,
      page: 0,
      swiperList: []
    });
    this.fetchSwiperPosts();
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var self = this;
    if (!self.data.isLastPage) {
      self.setData({
        page: self.data.page + 1,
      });
      //console.log('当前页' + self.data.page);
      this.fetchPostsData(self.data);
    } else {
      console.log('当前页' + self.data.page);
    }
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
   * 关键词查询
   */
  formSubmit: function (e) {
    var url = '../list/list'
    var key = '';
    if (e.currentTarget.id == "search-input") {
      key = e.detail.value;
    } else {
      key = e.detail.value.input;
    }
    if (key != '') {
      url = url + '?search=' + key;
      wx.navigateTo({
        url: url
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '请输入内容',
        showCancel: false,
      });
    }
  },
  /**
   * 获取滑动文章
   */
  fetchSwiperPosts: function () {
    var self = this;
    var getPostsRequest = wxRequest.getRequest(Api.getSwiperPosts());
    getPostsRequest.then(response => {
      if (response.data.status == '200' && response.data.posts.length > 0) {
        self.setData({
          swiperList: response.data.posts,
          swiperList: self.data.swiperList.concat(response.data.posts.map(function (item) {
            if (item.thumbnail == null || item.thumbnail == '') {
              item.thumbnail = "../../images/default.jpg";
            }
            //console.log(item);
            return item;
          })),
          Swiper: true,
          isDisplay: "display"
        });
      } else {
        self.setData({
          isDisplay: "display"
        })
      }
    })
    .then(response => {
      self.fetchPostsData(self.data);
    })
    .catch(function (response) {
      console.log(response);
      self.setData({
        noDisplay: "nodisplay"
      })
    })
    .finally(function () {

    });
  },
  /**
   * 获取文章数据列表
   */
  fetchPostsData: function (data) {
    var self = this;
    if (!data) data = {};
    if (!data.page) data.page = 1;
    if (!data.per_page) data.per_page = 10;
    if (!data.categories) data.categories = 0;
    if (!data.search) data.search = '';
    if (data.page === 1) {
      self.setData({
        postsList: []
      });
    };
    wx.showLoading({
      title: '正在加载',
      mask: true
    });
    var getPostsRequest = wxRequest.getRequest(Api.getPosts(data));
    getPostsRequest.then(response => {
      if (response.statusCode === 200) {
        if (response.data.length < self.data.per_page) {
          self.setData({
            isLastPage: true
          });
        }
        self.setData({
          isDisplay:"display",
          noDisplay: "display",
          postsList: self.data.postsList.concat(response.data.map(function (item) {
            var strdate = item.date
            if (item.category != null) {
              item.categoryImage = "../../images/ganeral-o.png";
            } else {
              item.categoryImage = "";
            }
            if (item.thumbnail == null || item.thumbnail == '') {
              item.thumbnail = "../../images/default.png";
            }
            item.date = util.cutstr(strdate, 10, 1);
            item.title.rendered = util.ellipsisHTML(item.title.rendered); // 替换省略
            //console.log(item);
            return item;
          }))
        });
        setTimeout(function () {
          wx.hideLoading();
        }, 900);
      } else {
        if (response.data.code == "rest_post_invalid_page_number") {
          self.setData({
            isLastPage: true
          });
          wx.showToast({
            title: '没有更多内容',
            mask: false,
            duration: 1500
          });
        } else {
          wx.showToast({
            title: response.data.message,
            duration: 1500
          })
        }
      }
    })
    .catch(function (response) {
      if (data.page == 1) {
        self.setData({
          loading: true,
          noDisplay: "nodisplay"
        });
      } else {
        wx.showModal({
          title: '加载失败',
          content: '加载数据失败, 请重试.',
          showCancel: false,
        });
        self.setData({
          page: data.page - 1
        });
      }
    })
    .finally(function (response) {
      wx.hideLoading();
      wx.stopPullDownRefresh();
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
  },
  /**
   * 返回小程序首页
   */
  redictHome: function (e) {
    //console.log('查看某类别下的文章');  
    var id = e.currentTarget.dataset.id,
    url = '/pages/index/index';
    wx.switchTab({
      url: url
    });
  },
  /**
   * 首页图标跳转
   */
  navRedirect: function (e) {
    var url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: url
    })
  }
})
