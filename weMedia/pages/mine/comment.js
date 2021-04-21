/*
 * 
 * WordPres WeMedia Mini Program
 * Author : 丸子团队（波波、Chi、ONLINE.信）
 * Github 地址: https://github.com/dchijack/WordPress-WeMedia-Mini-Program
 * 技术博客： https://www.imahui.com
 * 
 */
// pages/mine/comment.js
const API = require('../../utils/api')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    user: '',
    posts: [],
    isLoading: true,
    isLastPage: false,
    user: app.globalData.user
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    setTimeout(() => {
      if(this.data.posts.length == 0) {
        this.setData({
          isLoading: false
        })
      }
    }, 10000)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let user = API.getUser()
    if( user ) {
      this.setData({
        user: user
      })
    }
    if(this.data.user) {
      this.getCommentsPosts()
    }
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
    if(this.data.user) {
      this.getCommentsPosts()
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
    this.setData({isBottom: true})
    if (!this.data.isLastPage) {
      this.getCommentsPosts({
        page: this.data.page
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  getProfile: function () {
    wx.showLoading({
      title: '正在登录...',
    })
    API.getProfile().then(res => {
      //console.log(res)
      this.setData({
        user: res
      })
      wx.hideLoading()
    })
    .catch(err => {
      console.log(err)
      wx.hideLoading()
    })
  },

  getCommentsPosts: function(args) {
    API.getCommentsPosts(args).then(res => {
      let args = {}
      if (res.length < 10) {
        this.setData({
          isLastPage: true
        })
      }
      if (this.data.isBottom) {
        args.posts = [].concat(this.data.posts, res)
        args.page = this.data.page + 1
        wx.showToast({
          title: '加载下一页',
          icon: 'loading',
          duration: 1000
        })
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

  bindDetail: function (e) {
    let id = e.currentTarget.id;
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + id,
    })
  }

})