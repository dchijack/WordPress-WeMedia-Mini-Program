/*
 * 
 * WordPres WeMedia Mini Program
 * Author : 丸子团队（波波、Chi、ONLINE.信）
 * Github 地址: https://github.com/dchijack/WordPress-WeMedia-Mini-Program
 * 技术博客： https://www.imahui.com
 * 
 */

const app = getApp()
const API = require('../../utils/api')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: 0,
    page: 1,
    posts: [],
    advert: "",
    search: "",
    category: "",
    isLoading: true,
    isLastPage: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.id) {
      this.setData({
        id: options.id
      })
      this.getCategoryByID(options.id)
      this.getPostList({
        categories: options.id
      })
      this.getAdvert()
    }
    if(options.s) {
      let category = {}
      category.name = options.s
      category.description = '关键词“' + options.s + '”的结果'
      this.setData({
        search: options.s,
        category: category
      })
      this.getPostList({
        search: options.s
      })
      wx.setNavigationBarTitle({
        title: '关键词:' + options.s
      })
      this.getAdvert()
    }
    setTimeout(() => {
      if(this.data.posts.length == 0) {
        this.setData({
          isLoading: false
        })
      }
    }, 10000)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      page:1,
      posts:[],
      isLoading: true,
      isLastPage: false
    })
    if (this.data.id) {
      this.getPostList({
        categories: this.data.id
      });
    }
    if (this.data.search) {
      this.getPostList({
        search: this.data.search
      });
    }
    setTimeout(() => {
      if(this.data.posts.length == 0) {
        this.setData({
          isLoading: false
        })
      }
    }, 10000)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (!this.data.isLastPage) {
      if (this.data.id) {
        this.getPostList({
          categories: this.data.id,
          page: this.data.page
        });
      }
      if (this.data.search) {
        this.getPostList({
          search: this.data.search,
          page: this.data.page
        });
      }
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: this.data.category.name + ' - ' + this.data.category.description,
      imageUrl: this.data.category.cover ? this.data.category.cover : '../../images/default.jpg',
      path: this.data.id ? '/pages/list/list?id=' + this.data.id : '/pages/list/list?s=' + this.data.search
    }
  },

  getCategoryByID: function(id) {
    API.getCategoryByID(id).then(res => {
      this.setData({
        category: res
      })
      wx.setNavigationBarTitle({
        title: res.name
      })
    })
    .catch(err => {
      console.log(err)
    })
  },

  getPostList: function(data) {
    API.getPostsList(data).then(res => {
      let args = {}
      if (res.length < 10) {
        this.setData({
          isLastPage: true,
          loadtext: '到底啦',
          showloadmore: false
        })
      }
      if (this.data.isBottom) {
        args.posts = [].concat(this.data.posts, res)
        args.page = this.data.page + 1
      } else {
        args.posts = [].concat(this.data.posts, res)
        args.page = this.data.page + 1
      }
      this.setData(args)
      wx.stopPullDownRefresh()
    })
    .catch(err => {
      console.log(err)
      wx.stopPullDownRefresh()
    })
  },

  getAdvert: function() {
    API.listAdsense().then(res => {
      console.log(res)
      if(res.status === 200) {
        this.setData({
          advert: res.data
        })
      }
    })
    .catch(err => {
      console.log(err)
    })
  },

  bindDetail: function(e) {
    let id = e.currentTarget.id;
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + id,
    })
  }

})