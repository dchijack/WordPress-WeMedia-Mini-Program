/**
 * WordPres WeMedia Mini Program
 * Author : 丸子团队（波波、Chi、ONLINE.信）
 * Github 地址: https://github.com/dchijack/WordPress-WeMedia-Mini-Program
 * 技术博客： https://www.imahui.com
 */

const app = getApp()
const API = require('../../utils/api')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    page: 1,
    pages: [],
    advert: "",
    siteInfo: "",
    isLoading: true,
    isLastPage: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.getSiteInfo()
    this.getPages()
    this.getAdvert()
    setTimeout(() => {
      if(this.data.pages.length == 0) {
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
      pages:[],
      isLoading: true,
      isLastPage: false
    })
    this.getPages()
    setTimeout(() => {
      if(this.data.pages.length == 0) {
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
      this.getPages({
        page:this.data.page
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

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

  getPages: function () {
    API.getPagesList().then(res => {
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
        args.pages = [].concat(this.data.pages, res)
        args.page = this.data.page + 1
      } else {
        args.pages = res
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
    API.pageAdsense().then(res => {
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

  bindPage: function (e) {
    let id = e.currentTarget.id;
    wx.navigateTo({
      url: '/pages/page/page?id=' + id,
    })
  }

})