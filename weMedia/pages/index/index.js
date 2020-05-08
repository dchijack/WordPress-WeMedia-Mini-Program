/**
 * WordPres WeMedia Mini Program
 * Author : 丸子团队（波波、Chi、ONLINE.信）
 * Github 地址: https://github.com/dchijack/WordPress-WeMedia-Mini-Program
 * 技术博客： https://www.imahui.com
 */

const API = require('../../utils/api')

Page({
  data: {
    page: 1,
    posts: [],
    stickyPost: [],
    siteInfo: '',
    advert: '',
    navigation: [],
    isLoading: true,
    isLastPage: false
  },
  onLoad: function () {
    this.getSiteInfo()
    this.getMenuSetting()
    this.getStickyPosts()
    this.getPostList()
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
    this.getPostList()
    setTimeout(() => {
      if(this.data.posts.length == 0) {
        this.setData({
          isLoading: false
        })
      }
    }, 10000)
  },
  onReachBottom: function() {
    if (!this.data.isLastPage) {
      this.getPostList({
        page:this.data.page
      })
    }
  },
  onShareAppMessage: function() {
    return {
      title: '"' + this.data.siteInfo.name + '"小程序 - 基于丸子 WordPress 小程序创建',
      imageUrl: this.data.siteInfo.cover,
      path: '/pages/index/index'
    }
  },
  getSiteInfo: function() {
    API.getSiteInfo().then(res => {
      this.setData({
        siteInfo: res
      })
      wx.setNavigationBarTitle({
        title: res.name
      })
    })
    .catch(err => {
      console.log(err)
    })
  },
  getMenuSetting: function() {
    API.getMenuSetting().then(res => {
      console.log(res)
      if(res.status === 200) {
        this.setData({
          navigation: res.data
        })
      }
    })
    .catch(err => {
      console.log(err)
    })
  },
  getStickyPosts: function() {
    API.getStickyPosts().then(res => {
      console.log(res)
      this.setData({
        stickyPost: res
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
          isLastPage: true
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
    API.indexAdsense().then(res => {
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
  bindDetail: function(e) {
    let id = e.currentTarget.id;
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + id,
    })
  },
  bindMenu: function(e) {
    console.log(e)
    let type = e.currentTarget.dataset.type
    if (type == 'weapp') {
      let appid = e.currentTarget.dataset.appid
      wx.navigateToMiniProgram({
        appId: appid
      })
    } else if (type == 'contact') {
      console.log(e.path)
      console.log(e.query)
    } else if (type == 'tel') {
      let url = e.currentTarget.dataset.url
      wx.makePhoneCall({
        phoneNumber: url,
      })
    } else {
      let url = e.currentTarget.dataset.url
      wx.reLaunch({
        url: url
      })
    }
  },
  formSubmit: function (e) {
    let url = "/pages/list/list"
    let keyword = ""
    if (e.currentTarget.id == "key") {
      keyword = e.detail.value;
    } else {
      keyword = e.detail.value.input;
    }
    if (keyword == '') {
      wx.showModal({
        title: '温馨提示',
        content: '请输入查找关键词'
      })
    }
    wx.navigateTo({
      url: url + '?s=' + keyword
    })
  }
})
