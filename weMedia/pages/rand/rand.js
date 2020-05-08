/**
 * WordPres WeMedia Mini Program
 * Author : 丸子团队（波波、Chi、ONLINE.信）
 * Github 地址: https://github.com/dchijack/WordPress-WeMedia-Mini-Program
 * 技术博客： https://www.imahui.com
 */

const app = getApp()
const API = require('../../utils/api')

Page({
  data: {
    posts: [],
    siteInfo: "",
    advert: "",
    isLoading: true,
    isLastPage: false
  },
  onLoad: function () {
    this.getSiteInfo()
    this.getRandPosts()
    this.getAdvert()
    setTimeout(() => {
      if(this.data.posts.length == 0) {
        this.setData({
          isLoading: false
        })
      }
    }, 10000)
  },
  onPullDownRefresh: function() {
    this.setData({
      page:1,
      posts:[],
      isLoading: true,
      isLastPage: false
    })
    this.getRandPosts()
    setTimeout(() => {
      if(this.data.posts.length == 0) {
        this.setData({
          isLoading: false
        })
      }
    }, 10000)
  },
  onShareAppMessage: function() {
    return {
      title: '发现"' + this.data.siteInfo.name + '"小程序好内容,值得阅读',
      imageUrl: this.data.siteInfo.cover,
      path: '/pages/rand/rand'
    }
  },
  getSiteInfo: function() {
    API.getSiteInfo().then(res => {
      this.setData({
        siteInfo: res
      })
    })
    .catch(err => {
      console.log(err)
    })
  },
  getRandPosts: function () {
    API.getRandPosts().then(res => {
      let args = {}
      args.posts = res
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
      //console.log(res)
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
  bindDetail: function (e) {
    let id = e.currentTarget.id;
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + id,
    })
  }
})
