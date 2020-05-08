/*
 * 
 * WordPres WeMedia Mini Program
 * Author : 丸子团队（波波、Chi、ONLINE.信）
 * Github 地址: https://github.com/dchijack/WordPress-WeMedia-Mini-Program
 * 技术博客： https://www.imahui.com
 * 
 */
// pages/page/page.js
const app = getApp()
const API = require('../../utils/api')
const WxParse = require('../../wxParse/wxParse')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: 0,
    user: '',
    detail: '',
    isLoading: true,
    isLastPage: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if( options.id ) {
      this.setData({
        id: options.id
      })
      this.getPageByID(options.id)
    }
    this.getAdvert()
    setTimeout(() => {
      if( !this.data.detail ) {
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
    let user = app.globalData.user
    if (!user) {
      user = '';
    }
    this.setData({
      user: user,
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      detail: '',
      isLoading: true,
      isLastPage: false
    })
    this.getPageByID(this.data.id)
    setTimeout(() => {
      if( !this.data.detail ) {
        this.setData({
          isLoading: false
        })
      }
    }, 10000)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  wxParseTagATap: function(e) {
    let href = e.currentTarget.dataset.src
    wx.setClipboardData({
      data: href,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            wx.showToast({
              title: '复制链接',
              icon: 'success',
              duration: 2000
            })
          }
        })
      }
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

  getPageByID: function(id) {
    let that = this;
    API.getPageByID(id).then(res => {
      that.setData({
        id: id,
        detail: res
      })
      wx.setNavigationBarTitle({
        title: res.title.rendered
      })
      WxParse.wxParse('article', 'html', res.content.rendered, this, 5);
    })
    .catch(err => {
      console.log(err)
    })
  }

})