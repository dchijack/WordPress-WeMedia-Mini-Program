/*
 * 
 * WordPres WeMedia Mini Program
 * Author : 丸子团队（波波、Chi、ONLINE.信）
 * Github 地址: https://github.com/dchijack/WordPress-WeMedia-Mini-Program
 * 技术博客： https://www.imahui.com
 * 
 */
// pages/detail/detail.js
const app = getApp()
let isFocusing = false
const API = require('../../utils/api')
const WxParse = require('../../wxParse/wxParse')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: 0,
    page: 1,
    user: '',
    detail:'',
    parent: 0,
    content:'',
    prefix: '',
    comments: [],
    isFocus: false,
    isLoading: true,
    isLastPage: false,
    placeholder: '输入评论'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if( options.id ) {
      this.setData({
        id: options.id
      })
      this.getPostsbyID(options.id)
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
      page: 1,
      detail: '',
      comments: [],
      isLoading: true,
      isLastPage: false
    })
    this.getPostsbyID(this.data.id)
    setTimeout(() => {
      if( !this.data.detail ) {
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
      this.getComments();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: this.data.detail.title.rendered,
      path: '/pages/detail/detail?id=' + this.data.detail.id,
      imageUrl: this.data.detail.meta.thumbnail
    }
  },

  getProfile: function () {
    if(app.globalData.user){
      this.setData({user: app.globalData.user})
    }else{
      wx.showLoading({
        title: '正在登录!',
        mask: true
      })
      API.getProfile().then(res => {
        console.log(res)
        this.setData({user:res})
        wx.hideLoading()
      })
      .catch(err => {
        console.log(err)
        wx.hideLoading()
      })
    }
  },

  getPostsbyID: function(id) {
    let that = this;
    API.getPostsbyID(id).then(res => {
      that.setData({
        id: id,
        detail: res
      })
      wx.setNavigationBarTitle({
        title: res.title.rendered
      })
      WxParse.wxParse('article', 'html', res.content.rendered, this, 5);
      if (res.comments != 0) {
        this.getComments()
      }
    })
    .catch(err => {
      console.log(err)
    })
  },

  getComments: function() {
    API.getComments({
      id: this.data.id,
      page: this.data.page
    }).then(res => {
      let data = {}
      if (res.length < 10) {
        this.setData({
          isLastPage: true,
        })
      }
      if (this.data.isBottom) {
        data.comments = [].concat(this.data.comments, res)
        data.page = this.data.page + 1
      } else {
        data.comments = [].concat(this.data.comments, res)
        data.page = this.data.page + 1
      }
      this.setData(data)
    })
  },

  wxParseTagATap: function(e) {
    let isUrl = true
    let href = e.currentTarget.dataset.src
    let domain = API.getHost()
	  let slug = href.substring(href.lastIndexOf("/") + 1)
    let id = slug.substring(0, slug.lastIndexOf("."))
    if (!/\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/.test(href)) {
      isUrl = false
    } else{
      isUrl = true
    } 
    if (!isUrl) {
      if (href.indexOf(domain) == -1 || !is_numeric(id)) {
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
      } else {
        let url = '/pages/detail/detail?id=' + id
        wx.navigateTo({
          url: url
        })
      }
    }
  },

  getAdvert: function() {
    API.detailAdsense().then(res => {
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

  bindLike: function(e) {
    let id = e.currentTarget.id
    let detail = this.data.detail
    API.like({id: id}).then(res => {
      if(res.status === 200) {
        detail.islike = true
        wx.showToast({
          title: '谢谢点赞!',
          icon: 'success',
          duration: 900,
        })
        this.setData({
          detail: detail
        })
      } else if(res.status === 202) {
        detail.islike = false
        wx.showToast({
          title: '取消点赞!',
          icon: 'success',
          duration: 900,
        })
        this.setData({
          detail: detail
        })
      } else {
        wx.showToast({
          title: '数据出错!',
          icon: 'success',
          duration: 900,
        })
      }
    })
    .catch(err => {
      console.log(err)
    })
  },

  bindFav: function(e) {
    let id = e.currentTarget.id
    let detail = this.data.detail
    API.fav({id: id}).then(res => {
      if(res.status === 200) {
        detail.isfav = true
        wx.showToast({
          title: '谢谢收藏!',
          icon: 'success',
          duration: 900,
        })
        this.setData({
          detail: detail
        })
      } else if(res.status === 202) {
        detail.isfav = false
        wx.showToast({
          title: '取消收藏!',
          icon: 'success',
          duration: 900,
        })
        this.setData({
          detail: detail
        })
      } else {
        wx.showToast({
          title: '数据出错!',
          icon: 'success',
          duration: 900,
        })
      }
    })
    .catch(err => {
      console.log(err)
    })
  },

  inputContent: function(e) {
    if (e.detail.value.length > 0) {
      this.setData({
        content: e.detail.value
      })
    }
  },

  formSubmit: function () {
    let args = {}
    let that = this
    args.id = this.data.detail.id
	  args.content = this.data.content
    args.parent = this.data.parent
    if (this.data.content.length === 0) {
      wx.showModal({
        title: '提示',
        content: '评论内容不能为空'
      })
      return
    }
    API.addComment(args).then(res => {
      if(res.status === 200) {
        let templates = ['EVYt5ypSxWpGEAypU_y35CduHwYKTUQghhJKBLts2mg','Db2ZXVbUzc_97Y05JENZp4O9ZuxHzyc7O55dAaPWSU8']
        wx.requestSubscribeMessage({
          tmplIds: templates,
					success(res) {
					  console.log(res)
					  for (let i = 0; i < templates.length; i++) {
							let template = templates[i]
							that.bindSubscribe(template, 'accept')
					  }
					  if (res.errMsg == "requestSubscribeMessage:ok") {
							wx.showToast({
							  title: '订阅消息完成',
							  icon: 'success',
							  duration: 1000
							})
					  }
					},
					fail:function(res){
					  console.log(res);
					}
        })
        this.setData({
					page: 1,
					content: "",
          comments: [],
          isFocus: false,
					placeholder: "请输入评论内容"
				})
				setTimeout(function () {
					wx.showToast({
						title: '评论发布成功。',
						icon: 'success',
						duration: 900,
					})
				}, 900)
				that.getComments()
      } else {
        wx.showModal({
          title: '提示',
          content: '评论失败，请稍后重试。'
        })
      }
    })
    .catch(err => {
      console.log(err)
      wx.showModal({
        title: '提示',
        content: '评论失败，请稍后重试。'
      })
    })
  },

  onReplyBlur: function (e) {
    console.log('onReplyBlur', isFocusing);
    if (!isFocusing) {
      const text = e.detail.value.trim();
      if (text === '') {
        this.setData({
          parent: "0",
          placeholder: "请输入评论内容"
        });
      }
    }
    console.log(isFocusing);
  },

  onRepleyFocus: function () {
    let isFocusing = false;
    console.log('onRepleyFocus', isFocusing);
    if (!this.data.isFocus) {
      this.setData({ isFocus: true })
    }
  },

  replyComment: function (e) {
    //console.log(e)
    let parent = e.currentTarget.dataset.parent
    let reply = e.currentTarget.dataset.reply
    this.setData({
      isFocus: true,
      parent: parent,
      placeholder: " 回复 " + reply + ":"
    })
  },

  bindCanvas: function() {
    let prefix = this.data.prefix
    if( prefix ) {
    	wx.previewImage({
    		current: prefix,
        urls: [prefix]
    	})
    } else {
		  this.CreatCanvas()
    }
  },

  CreatCanvas: function() {
    wx.showToast({
      title: '准备生成...',
      icon: 'success',
      duration: 900,
    })
    let args = {}
    let that = this
    let prefix = ''
    let qrcode = ''
    args.id = this.data.detail.id
    API.getCodeImg(args).then(res => {
      if(res.status === 200) {
        let qrcodeurl = res.qrcode
        let coverurl = res.cover
        wx.downloadFile({
          url: qrcodeurl,
          success: res => {
            wx.showToast({
              title: '下载二维码...',
              icon: 'success',
              duration: 1200,
            })
            if (res.statusCode === 200) {
              qrcode = res.tempFilePath
              console.log("二维码图片本地位置：" + res.tempFilePath)
              wx.downloadFile({
                url:coverurl,
                success: res => {
                  wx.showToast({
                    title: '下载封面图...',
                    icon: 'success',
                    duration: 1200,
                  })
                  if (res.statusCode === 200) {
                    prefix = res.tempFilePath
                    console.log("文章图片本地位置：" + res.tempFilePath)
                    that.CanvasImage(qrcode, prefix)
                  }
                }
              })
            }
          }
        })
      }
    })
    .catch(err => {
      console.log(err)
    })
  },
  
  CanvasImage: function(qrcode, prefix) {
    let that = this;
    wx.showLoading({
      title: "正在生成海报",
      mask: true,
    });
    let title = this.data.detail.title.rendered
    let excerpt = this.data.detail.excerpt.rendered
    let context = wx.createCanvasContext('prefix')
    context.setFillStyle('#ffffff');//填充背景色
    context.fillRect(0, 0, 600, 970);
    context.drawImage(prefix, 0, 0, 600, 400);//绘制首图
    context.drawImage(qrcode, 90, 720, 180, 180);//绘制二维码
    context.drawImage('../../images/logo.png', 350, 740, 130, 130);//画logo
    context.setFillStyle("#696969");
    context.setFontSize(20);
    context.setTextAlign('center');
    context.fillText("阅读详情,请长按识别二维码", 300, 940);
    context.setFillStyle("#000000");
    context.beginPath()//分割线
    context.moveTo(30, 700)
    context.lineTo(570, 700)
    context.stroke();
    context.setFillStyle("#000000");
    context.setTextAlign('left');
    if( title.replace(/[\u0391-\uFFE5]/g, "aa").length <= 18 ) {
      context.setFontSize(30);
      context.fillText(title, 40, 520);
    } else {
      context.setFontSize(30);
      context.fillText(title.substring(0, 18), 40, 460);
      context.fillText(title.substring(18, 32) + '...', 40, 520);
    }
    context.setFontSize(24);
    context.setTextAlign('left');
    context.setGlobalAlpha(0.7);
    context.fillText(excerpt.substring(0, 20), 40, 580);
    context.fillText(excerpt.substring(20, 40), 40, 620);
    context.fillText(excerpt.substring(40, 54) + '...', 40, 660);
    context.stroke();
    context.save();
    context.draw();
    setTimeout(function () {
      wx.canvasToTempFilePath({
        canvasId: 'prefix',
        success: function (res) {
          wx.hideLoading();
          that.setData({
            prefix: res.tempFilePath
          });
          console.log("海报图片路径：" + res.tempFilePath);
          wx.previewImage({
            current: res.tempFilePath,
            urls: [res.tempFilePath]
          })
          wx.showModal({
            content: '是否保存海报到相册？',
            confirmColor: '#D0104C',
            success: response => {
              if (response.confirm) {
                that.saveToPhotosAlbum()
              }
            }
          })
        },
        fail: function (res) {
          console.log(res);
        }
      });
    }, 900);
  },

  saveToPhotosAlbum: function () {
    let prefixPath = this.data.prefix;
    wx.saveImageToPhotosAlbum({
      filePath: prefixPath,
      success: function (res) {
        console.log(res);
        wx.showModal({
          title: '提示',
          content: '二维码海报已存入手机相册，赶快分享到朋友圈吧'
        })
      },
      fail: function (err) {
        console.log(err);
        if (err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
          wx.showModal({
            title: '提示',
            content: '保存图片至相册需要授权允许'
          })
        }
      }
    })
  }

})