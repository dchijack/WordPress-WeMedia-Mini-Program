/**
 * WordPres WeMedia Mini Program
 * Author : 丸子团队（波波、Chi、ONLINE.信）
 * Github 地址: https://github.com/dchijack/WordPress-WeMedia-Mini-Program
 * 技术博客： https://www.imahui.com
 */
//app.js
const API = require('/utils/base')
App({
  onLaunch: function () {
    API.login()
  },
  onShow: function () {
    this.globalData.user = API.getUser()
  },
  globalData: {
    user: '',
  }
})