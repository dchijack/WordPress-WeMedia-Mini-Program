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
    page: 1,
    siteInfo: "",
    categories: [],
    isLoading: true,
    isLastPage: false
  },
  onLoad: function () {
    this.getSiteInfo()
    this.getCategories()
    setTimeout(() => {
      if(this.data.categories.length == 0) {
        this.setData({
          isLoading: false
        })
      }
    }, 10000)
  },
  onPullDownRefresh: function() {
    this.setData({
      page:1,
      categories:[],
      isLoading: true,
      isLastPage: false
    })
    this.getCategories()
    setTimeout(() => {
      if(this.data.categories.length == 0) {
        this.setData({
          isLoading: false
        })
      }
    }, 10000)
  },
  onReachBottom: function() {
    this.setData({isBottom: true})
    if (!this.data.isLastPage) {
      this.getCategories({
        page:this.data.page
      })
    }
  },
  onShareAppMessage: function() {
    return {
      title: '分享"' + this.data.siteInfo.name + '"小程序分类,基于丸子 WordPress 小程序创建',
      imageUrl: this.data.siteInfo.cover,
      path: '/pages/category/category'
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
  getCategories: function () {
    API.getCategories().then(res => {
      let args = {}
      if (res.length < 10) {
        this.setData({
          isLastPage: true
        })
      }
      if (this.data.isBottom) {
        wx.showToast({
          title: '加载下一页',
          icon: 'loading',
          duration: 1000
        })
        args.categories = [].concat(this.data.categories, res)
        args.page = this.data.page + 1
      } else {
        args.categories = res
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
  bindTopic: function (e) {
    let id = e.currentTarget.id;
    wx.navigateTo({
      url: '/pages/list/list?id=' + id,
    })
  }
})
