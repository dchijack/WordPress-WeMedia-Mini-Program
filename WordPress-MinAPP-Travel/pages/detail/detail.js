/*
 * 
 * WordPres Mini APP For Travel
 * Author: 艾码汇
 * Github:  https://github.com/dchijack/WordPress-MinAPP-For-Travel
 * 技术支持：https://www.imahui.com  微信公众号：WordPress(搜索微信号：WPGeek)
 * 
 */
// pages/detail/detail.js
import config from '../../utils/config.js';
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var auth = require('../../utils/auth.js');
var wxApi = require('../../utils/wxApi.js');
var wxRequest = require('../../utils/wxRequest.js');
var WxParse = require('../../wxParse/wxParse.js');
var app = getApp();
let isFocusing = false
Page({
  /**
   * 页面的初始数据
   */
  data: {
    title: '文章内容',
    detail: {},
    commentsList: [],
    ReplyCommentsList: [],
    commentCount: '',
    detailDate: '',
    commentValue: '',
    wxParseData: [],
    display: 'display',
    page: 1,
    enComment: true,
    isRelate: false,
    isLastPage: false,
    isNoComment: true,
    parentID: "0",
    focus: false,
    placeholder: " 发表看法 ",
    postID: null,
    postList: [],
    prefix:'',
    logo: config.getAppLogo,
    prefixModal: false,
    dialog: {
      title: '',
      content: '',
      hidden: true
    },
    content: '',
    thumbsImage: "heart-o.png",
    thumbsList: [],
    thumbsCount: 0,
    thumbsDisplay: 'nodisplay',
    replayTemplateId: config.getReplayTemplateId,
    userid: "",
    toFromId: "",
    commentdate: "",
    flag: 1,
    enableComment:false,
    noComments:"nodisplay",
    userInfo: {},
    loginModal: false,
    userInfo: app.globalData.userInfo
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    self.getEnableComment();
    self.fetchDetailData(options.id);
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
  
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    if (this.data.detail.thumbnail) {
      var image = this.data.detail.thumbnail;
    } else {
      var image = this.data.detail.meta.thumbnail;
    }
    return {
      title: '"' + config.getAppSite + '"：' + util.ellipsisHTML(this.data.detail.title.rendered),
      path: 'pages/detail/detail?id=' + this.data.detail.id,
      imageUrl: image,
      success: function (res) {
        // 转发成功
        console.log(res);
      },
      fail: function (res) {
        console.log(res);
        // 转发失败
      }
    }
  },
  /**
   * 点赞头像
   */
  showthumbsImg: function () {
    var self = this;
    var flag = false;
    var _avatars = self.data.detail.avatar;
    var avatars = [];
    //console.log(self.data.detail);
    for (var i = 0; i < _avatars.length; i++) {
      var avatarurl = "../../images/gravatar.png";
      if (_avatars[i].avatar.indexOf('wx.qlogo.cn') != -1) {
        avatarurl = _avatars[i].avatar;
      }
      avatars[i] = avatarurl;
    }
    var temp = avatars;
    self.setData({
      thumbsList: avatars
    });
  },
  /**
   * 点赞/喜欢
   */
  thumbsUpClick: function (e) {
    var id = e.target.id;
    var self = this;
    if (app.globalData.isGetOpenid) {
      var data = {
        openid: app.globalData.openid,
        postid: self.data.postID
      };
      var url = Api.updateThumbsUrl();
      var postThumbsRequest = wxRequest.postRequest(url, data);
      postThumbsRequest.then(response => {
        if (response.data.status == '200') {
          var _thumbsList = []
          var _thumbs = app.globalData.userInfo.avatarUrl;
          _thumbsList.push(_thumbs);
          var tempthumbsList = _thumbsList.concat(self.data.thumbsList);
          var _thumbsCount = parseInt(self.data.thumbsCount) + 1;
          self.setData({
            thumbsList: tempthumbsList,
            thumbsCount: _thumbsCount,
            thumbsDisplay: 'display'
          });
          wx.showToast({
            title: '点赞支持',
            icon: 'success',
            duration: 900,
            success: function () {
              // 点赞成功
            }
          })
        } else if (response.data.status == '501') {
          console.log(response.data.message);
          wx.showToast({
            title: '谢谢,已赞过',
            icon: 'success',
            duration: 900,
            success: function () {
              // 已经点赞
            }
          })
        } else {
          console.log(response.data.message);
        }
        self.setData({
          thumbsImage: "heart.png"
        });
      })
    } else {
      self.userAuthorization();
    }
  },
  /**
   * 是否点赞
   */
  getthumbed: function () { // 判断当前用户是否点赞
    var self = this;
    if (app.globalData.isGetOpenid) {
      var data = {
        openid: app.globalData.openid,
        postid: self.data.postID
      };
      var url = Api.getThumbedUrl();
      var postThumbedRequest = wxRequest.postRequest(url, data);
      postThumbedRequest.then(response => {
        if (response.data.status == '200') {
          self.setData({
            thumbsImage: "heart.png"
          });
          console.log(" 已赞过 ");
        }
      })
    }
  },
  /**
   * A 链接跳转或复制
   */
  wxParseTagATap: function (e) {
    var self = this;
    var href = e.currentTarget.dataset.src;
    console.log(href);
    var domain = config.getDomain;
    //可以在这里进行一些路由处理
    if (href.indexOf(domain) == -1) {
      wx.setClipboardData({
        data: href,
        success: function (res) {
          wx.getClipboardData({
            success: function (res) {
              wx.showToast({
                title: '链接已复制',
                //icon: 'success',
                image: '../../images/link.png',
                duration: 2000
              })
            }
          })
        }
      })
    } else {
      var slug = util.GetUrlFileName(href, domain);
      if (slug == 'index') {
        wx.switchTab({
          url: '../index/index'
        })
      } else {
        var getPostSlugRequest = wxRequest.getRequest(Api.getPostBySlug(slug));
        getPostSlugRequest.then(res => {
          if (res.statusCode == 200) {
            if (res.data.length != 0) {
              var postID = res.data[0].id;
              var openLinkCount = wx.getStorageSync('openLinkCount') || 0;
              if (openLinkCount > 4) {
                wx.redirectTo({
                  url: '../detail/detail?id=' + postID
                })
              } else {
                wx.navigateTo({
                  url: '../detail/detail?id=' + postID
                })
                openLinkCount++;
                wx.setStorageSync('openLinkCount', openLinkCount);
              }
            } else {
              self.copyLink(href);
            }
          }
        })
        .catch(res => {
          console.log(response.data.message);
        })
      }
    }
  },
  /**
   * 点击预览图
   */
  wxParseImg: function (e) {
    var self = this;
    var href = e.currentTarget.dataset.src;
    self.setData({ previewList: href });
    wx.previewImage({
      current: href,
      urls: self.data.previewList
    })
  },
  /**
   * 上篇下篇
   */
  redictPrevious: function (e) {
    var id = this.data.detail.previous_id,
      url = '../detail/detail?id=' + id;
    wx.navigateTo({
      url: url
    })
  },
  redictNext: function (e) {
    var id = this.data.detail.next_id,
      url = '../detail/detail?id=' + id;
    wx.navigateTo({
      url: url
    })
  },
  /**
   * 返回首页
   */
  goHome: function () {
    wx.switchTab({
      url: '../index/index'
    })
  },
  /**
   * 底部加载刷新
   */
  loadMore: function (e) {
    var self = this;
    if (!self.data.isLastPage) {
      self.setData({
        page: self.data.page + 1
      });
      console.log('当前页' + self.data.page);
      self.fetchCommentData();
      //self.fetchCommentData(self.data, '0');
    }
    else {
      wx.showToast({
        title: '没有更多内容',
        mask: false,
        duration: 1000
      });
    }
  },
  /**
   * 获取文章内容
   */
  fetchDetailData: function (id) {
    var self = this;
    var getPostDetailRequest = wxRequest.getRequest(Api.getPostByID(id));
    var res;
    var _thumbsDisplay = 'nodisplay';
    getPostDetailRequest.then(response => {
      res = response;
      //console.log(response.data);
      WxParse.wxParse('article', 'html', response.data.content.rendered, self, 5);
      response.data.title.rendered = util.ellipsisHTML(response.data.title.rendered);
      if (response.data.comments != null && response.data.comments != '') {
        self.setData({
          noComments: 'display',
          commentCount: " 有 " + response.data.comments + " 条评论 "
        });
      };
      var _thumbsCount = response.data.thumbses;
      if (response.data.thumbses != '0') {
        _thumbsDisplay = "display"
      }
      self.setData({
        detail: response.data,
        thumbsCount: _thumbsCount,
        postID: id,
        link: response.data.link,
        detailDate: util.cutstr(response.data.date, 10, 1),
        display: 'display',
        thumbsDisplay: _thumbsDisplay
      });
      // 调用 API 从本地缓存中获取阅读记录并记录
      var logs = wx.getStorageSync('readLogs') || [];
      // 过滤重复值
      if (logs.length > 0) {
        logs = logs.filter(function (log) {
          return log[0] !== id;
        });
      }
      // 如果超过指定数量
      if (logs.length > 19) {
        logs.pop();// 去除最后一个
      }
      logs.unshift([id, util.ellipsisHTML(response.data.title.rendered), response.data.thumbnail]);
      wx.setStorageSync('readLogs', logs);
      //end 
    })
    .then(response => {
      wx.setNavigationBarTitle({
        title: util.ellipsisHTML(res.data.title.rendered)
      });
    })
    .then(response => {
      var tagsArr = [];
      tagsArr = res.data.tags
      var tags = "";
      for (var i = 0; i < tagsArr.length; i++) {
        if (i == 0) {
          tags += tagsArr[i];
        } else {
          tags += "," + tagsArr[i];
        }
      }
      if (tags != "") {
        var getPostTagsRequest = wxRequest.getRequest(Api.getPostsByTags(id, tags));
        getPostTagsRequest.then(response => {
          self.setData({
            //postList: response.data,
            postList: self.data.postList.concat(response.data.map(function (item) {
              var strdate = item.date
              if (item.thumbnail) {
                if (item.thumbnail == null || item.thumbnail == '') {
                  item.thumbnail = "../../images/default.jpg";
                }
              } else {
                if (item.meta.thumbnail == null || item.meta.thumbnail == '') {
                  item.meta.thumbnail = "../../images/default.jpg";
                }
              }
              item.date = util.cutstr(strdate, 10, 1);
              item.title.rendered = util.ellipsisHTML(item.title.rendered); // 替换省略
              //console.log(item);
              return item;
            })),
            isRelate:true
          });
        })
      }
    })
    .then(response => {
      var updateViewsRequest = wxRequest.getRequest(Api.updateViews(id));
      updateViewsRequest.then(result => {
        console.log(result.data.message);
      })
    })
    .then(response => {// 获取点赞记录
      self.showthumbsImg();
    })
    .then(response => {
      self.fetchCommentData(self.data, '0');// 获取评论
    })
    .then(resonse => {
      if (!app.globalData.isGetOpenid) {
        self.userAuthorization();
      }
    })
    .then(response => {// 获取是否已经点赞
      if (app.globalData.isGetOpenid) {
        self.getthumbed();
      }
    })
    .catch(function (response) {

    })
    .finally(function (response) {

    });
  },
  /** 
   * 获取是否开启评论设置
   */
  getEnableComment: function (id) {
    var self = this;
    var getEnableCommentRequest = wxRequest.getRequest(Api.getEnableComment());
    getEnableCommentRequest.then(response => {
      if (response.data.enableComment != null && response.data.enableComment != '') {
        if (response.data.enableComment === "false") {
          self.setData({
            enableComment: true
          });
          self.fetchCommentData(self.data, '0')
        } else {
          self.setData({
            enableComment: false
          });
        }
      };
    });
  },
  /**
   * 获取文章评论
   */
  fetchCommentData: function (data, flag) {
    var self = this;
    if (!data) data = {};
    if (!data.page) data.page = 1;
    self.setData({
      commentsList: [],
    });
    var getCommentsRequest = wxRequest.getRequest(Api.getComments(data));
    getCommentsRequest.then(response => {
      if (response.statusCode == 200) {
        if (response.data.length < 100) { // 评论字符长度小于 100 字符
          self.setData({
            isLastPage: true
          });
        }
        if (response.data) {
          self.setData({
            commentsList: self.data.commentsList.concat(response.data.map(function (item) {
              var strSummary = util.removeHTML(item.content.rendered);
              var dateStr = item.date;
              dateStr = dateStr.replace("T", " ");
              var strdate = util.getDateDiff(dateStr);
              item.date = strdate;
              item.dateStr = dateStr;
              item.summary = strSummary;
              if (item.author_url.indexOf('wx.qlogo.cn') != -1) {
                if (item.author_url.indexOf('https') == -1) {
                  item.author_url = item.author_url.replace("http", "https");
                }
              } else {
                item.author_url = "../../images/gravatar.png";
              }
              return item;
            }))
          });
        }
      }
    })
    .catch(response => {
      console.log(response.data.message);
    })
  },
  /**
   * 获取评论回复
   */
  fetchReplyCommentData: function (data, flag) {
    var self = this;
    var getReplyCommentsRequest = wxRequest.getRequest(Api.getReplyComments(data));
    getReplyCommentsRequest.then(response => {
      if (response.data) {
        self.setData({
          ReplyCommentsList: self.data.ReplyCommentsList.concat(response.data.map(function (item) {
            var strSummary = util.removeHTML(item.content.rendered);
            var strdate = item.date
            item.summary = strSummary;
            item.date = util.formatDateTime(strdate);
            if (item.author_url.indexOf('wx.qlogo.cn') != -1) {
              if (item.author_url.indexOf('https') == -1) {
                item.author_url = item.author_url.replace("http", "https");
              }
            } else {
              item.author_url = "../../images/gravatar.png";
            }
            return item;
          }))
        });
      }
      setTimeout(function () {
        if (flag == '1') {
          wx.showToast({
            title: '评论发布成功。',
            icon: 'success',
            duration: 900,
            success: function () {
              // 发布成功
            }
          })
        }
      }, 900);
    })
  },
  /**
   * 评论提交
   */
  formSubmit: function (e) {
    var self = this;
    var comment = e.detail.value.inputComment;
    var parent = self.data.parentID;
    var postID = e.detail.value.inputPostID;
    var formId = e.detail.formId;
    var userid = self.data.userid;
    var toFromId = self.data.toFromId;
    var commentdate = self.data.commentdate;
    if (comment.length === 0) {
      self.setData({
        'dialog.hidden': false,
        'dialog.title': '提示',
        'dialog.content': '没有填写评论内容'
      });
    } else {
      if (app.globalData.isGetOpenid) {
        var name = app.globalData.userInfo.nickName;
        var author_url = app.globalData.userInfo.avatarUrl;
        var email = app.globalData.openid + "@qq.com";
        var openid = app.globalData.openid;
        var fromUser = app.globalData.userInfo.nickName;
        var data = {
          post: postID,
          author_name: name,
          author_email: email,
          content: comment,
          author_url: author_url,
          parent: parent,
          openid: openid,
          userid: userid,
          formId: formId
        };
        var url = Api.wechatAddComment();
        var postCommentRequest = wxRequest.postRequest(url, data);
        postCommentRequest
          .then(res => {
            if (res.statusCode == 200) {
              if (res.data.status == '200') {
                self.setData({
                  content: '',
                  parent: "0",
                  userid: 0,
                  placeholder: " 输入评论 ",
                  focus: false,
                  commentsList: []
                });
                setTimeout(function () {
                  wx.showToast({
                    title: '评论发布成功。',
                    icon: 'success',
                    duration: 900,
                    success: function () {
                      //console.log(formId);
                      self.setData({
                        noComments:"display"
                      })
                    }
                  })
                }, 900);
                console.log(res.data.message);
                if (parent != "0" && !util.getDateOut(commentdate) && toFromId != "") {
                  var useropenid = res.data.useropenid;
                  var data = {
                    openid: useropenid,
                    postid: postID,
                    template_id: self.data.replayTemplateId,
                    form_id: toFromId,
                    total_fee: comment,
                    fromUser: fromUser,
                    flag: 3,
                    parent: parent
                  };
                  url = Api.sendMessagesUrl();
                  var sendMessageRequest = wxRequest.postRequest(url, data);
                  sendMessageRequest.then(response => {
                    if (response.data.status == '200') {
                      console.log(response.data.message);

                    } else {
                      console.log(response.data.message);
                    }
                  });
                }
                // console.log(res.data.code);
                self.fetchCommentData(self.data, '1');
              }
              else if (res.data.status == '500') {
                self.setData({
                  'dialog.hidden': false,
                  'dialog.title': '提示',
                  'dialog.content': '评论失败，请稍后重试。'
                });
              }
            }
            else {
              if (res.data.code == 'rest_comment_login_required') {
                self.setData({
                  'dialog.hidden': false,
                  'dialog.title': '提示',
                  'dialog.content': '需要开启在 WordPress rest api 的匿名评论功能！'
                });
              }
              else if (res.data.code == 'rest_invalid_param' && res.data.message.indexOf('author_email') > 0) {
                self.setData({
                  'dialog.hidden': false,
                  'dialog.title': '提示',
                  'dialog.content': 'email 填写错误！'
                });
              }
              else {
                console.log(res.data.code)
                self.setData({
                  'dialog.hidden': false,
                  'dialog.title': '提示',
                  'dialog.content': '评论失败,' + res.data.message
                });
              }
            }
          }).catch(response => {
            console.log(response)
            self.setData({
              'dialog.hidden': false,
              'dialog.title': '提示',
              'dialog.content': '评论失败,' + response
            });
          })
      }
      else {
        self.userAuthorization();
      }
    }
  },
  /**
   * 评论回复
   */
  replay: function (e) {
    var self = this;
    var id = e.target.dataset.id;
    var name = e.target.dataset.name;
    var userid = e.target.dataset.userid;
    var toFromId = e.target.dataset.formid;
    var commentdate = e.target.dataset.commentdate;
    isFocusing = true;
    self.setData({
      parentID: id,
      placeholder: " 回复 " + name + ":",
      focus: true,
      userid: userid,
      toFromId: toFromId,
      commentdate: commentdate
    });
    console.log('toFromId', toFromId);
    console.log('replay', isFocusing);
  },
  onReplyBlur: function (e) {
    var self = this;
    console.log('onReplyBlur', isFocusing);
    if (!isFocusing) {
      const text = e.detail.value.trim();
      if (text === '') {
        self.setData({
          parentID: "0",
          placeholder: " 输入评论 ",
          userid: "",
          toFromId: "",
          commentdate: ""
        });
      }
    }
    console.log(isFocusing);
  },
  onRepleyFocus: function (e) {
    var self = this;
    isFocusing = false;
    console.log('onRepleyFocus', isFocusing);
    if (!self.data.focus) {
      self.setData({ focus: true })
    }
  },
  /**
   * 评论页面自动加载
   */
  loadMore: function (e) {
    var self = this;
    if (!self.data.isLastPage) {
      self.setData({
        page: self.data.page + 1
      });
      console.log('当前页' + self.data.page);
      self.fetchCommentData(self.data, '0');
    } else {
      wx.showToast({
        title: '没有更多内容',
        mask: false,
        duration: 1000
      });
    }
  },
  /**
   * 相关阅读跳转
   */
  bindTagRedict: function (e) {
    var id = e.currentTarget.id,
    url = '../detail/detail?id=' + id;
    wx.navigateTo({
      url: url
    })
  },
  /**
   * 用户授权查询
   */
  userAuthorization: function () {
    var self = this;
    // 判断是否是第一次授权，非第一次授权且授权失败则进行提醒
    wx.getSetting({
      success: function success(res) {
        console.log(res.authSetting);
        var authSetting = res.authSetting;
        if (!('scope.userInfo' in authSetting)) {
          console.log('第一次授权');
          self.setData({ loginModal: true })
        } else {
          console.log('不是第一次授权', authSetting);
          // 没有授权的提醒
          if (authSetting['scope.userInfo'] === false) {
            wx.showModal({
              title: '用户未授权',
              content: '如需正常使用评论、点赞、赞赏等功能需授权获取用户信息。是否在授权管理中选中“用户信息”?',
              showCancel: true,
              cancelColor: '#296fd0',
              confirmColor: '#296fd0',
              confirmText: '设置权限',
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                  wx.openSetting({
                    success: function success(res) {
                      console.log('打开设置', res.authSetting);
                      var scopeUserInfo = res.authSetting["scope.userInfo"];
                      if (scopeUserInfo) {
                        auth.getUsreInfo(null);
                      }
                    }
                  });
                }
              }
            })
          } else {
            auth.getUsreInfo(null);
          }
        }
      }
    });
  },
  /**
   * 同意授权信息
   */
  bindGetUserinfo: function (e) {
    var userInfo = e.detail.userInfo;
    var self = this;
    if (userInfo) {
      auth.getUsreInfo(e.detail);
      self.setData({ userInfo: userInfo });
    }
    setTimeout(function () {
      self.setData({ loginModal: false })
    }, 1200);
  },
  /**
   * 弹出框蒙层截断 touchmove 事件
   */
  preventTouchMove: function () {

  },
  /**
   * 隐藏模态对话框
   */
  hideModal: function () {
    this.setData({
      loginModal: false,
      prefixModal: false
    });
  },
  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function () {
    this.hideModal();
  },
  /**
  * 确认数据
  */
  confirm: function () {
    this.setData({
      'dialog.hidden': true,
      'dialog.title': '',
      'dialog.content': ''
    })
  },
  /*
* 下载海报
*/
  downloadPrefix: function () {
    var self = this;
    var postid = self.data.detail.id;
    var title = self.data.detail.title.rendered;
    var path = "pages/detail/detail?id=" + postid;
    var excerpt = self.data.detail.excerpt.rendered;
    var prefixUrl = ""; // 定义海报头图
    var prefixPath = ""; // 定义海报路径
    var qrcodePath = ""; // 定义二维码路径
    var flag = false; // 判断标识
    var localImgFlag = false; // 本地图片标识
    var domain = config.getDomain; // 业务域名
    var downDomain = config.getDownloadDomain; // 允许下载图像域名
    //var thumbnail = self.data.detail.thumbnail;  // 海报缩略图
	if (self.data.detail.thumbnail) {
		var thumbnail = self.data.detail.thumbnail;  // 海报缩略图
	} else {
		var thumbnail = self.data.detail.meta.thumbnail;
	}
    //获取文章首图临时地址，若没有就用默认的图片,如果图片不是request域名，使用本地图片
    if (thumbnail) {
      var n = 0;
      for (var i = 0; i < downDomain.length; i++) {
        if (thumbnail.indexOf(downDomain[i].domain) != -1) {
          n++;
          break;
        }
      }
      if (n > 0) {
        localImgFlag = true;
        prefixUrl = thumbnail;
        prefixPath = prefixUrl;
      } else {
        prefixUrl = config.getThumbnail; // 默认海报地址
        prefixPath = prefixUrl;
        localImgFlag = true;
      }
    } else {
      prefixUrl = config.getThumbnail;
      prefixPath = prefixUrl;
      localImgFlag = true;
    }
    console.log(prefixUrl);
    if (app.globalData.isGetOpenid) {
      var openid = app.globalData.openid;
      var data = {
        postid: postid,
        path: path,
        openid: openid
      };
      //console.log(data);
      var url = Api.creatPoster();
      var prefixQrcode = Api.getQrcodeUrl() + "qrcode-" + postid + ".png"; // 海报二维码地址
      //生成二维码
      var creatPosterRequest = wxRequest.postRequest(url, data);
      creatPosterRequest.then(response => {
        //console.log(response);
        if (response.statusCode == 200) {
          if (response.data.status == '200') {
            const downloadTaskQrcodeImage = wx.downloadFile({
              url: prefixQrcode,
              success: res => {
                if (res.statusCode === 200) {
                  qrcodePath = res.tempFilePath;
                  console.log("二维码图片本地位置：" + res.tempFilePath);
                  if (localImgFlag) {
                    const downloadTaskForPostImage = wx.downloadFile({
                      url: prefixUrl,
                      success: res => {
                        if (res.statusCode === 200) {
                          prefixPath = res.tempFilePath;
                          console.log("文章图片本地位置：" + res.tempFilePath);
                          flag = true;
                          if (prefixPath && qrcodePath) {
                            self.createPostPrefix(prefixPath, qrcodePath, title, excerpt);
                          }
                        } else {
                          console.log(res);
                          wx.hideLoading();
                          wx.showToast({
                            title: "生成海报失败...",
                            mask: true,
                            duration: 2000
                          });
                          return false;
                        }
                      }
                    });
                    downloadTaskForPostImage.onProgressUpdate((res) => {
                      wx.showLoading({
                        title: "正在下载图片...",
                        mask: true,
                      });
                      console.log('下载文章图片进度：' + res.progress)
                    })
                  } else {
                    if (prefixPath && qrcodePath) {
                      self.createPostPrefix(prefixPath, qrcodePath, title, excerpt);
                    }
                  }
                } else {
                  console.log(res);
                  flag = false;
                  wx.showToast({
                    title: "生成海报失败...",
                    mask: true,
                    duration: 2000
                  });
                  return false;
                }
              }
            });
            downloadTaskQrcodeImage.onProgressUpdate((res) => {
              wx.showLoading({
                title: "正在下载二维码...",
                mask: true,
              });
              console.log('下载二维码进度', res.progress)
            })
          } else {
            console.log(response);
            flag = false;
            wx.showToast({
              title: "生成海报失败...",
              mask: true,
              duration: 2000
            });
            return false;
          }
        } else {
          console.log(response);
          flag = false;
          wx.showToast({
            title: "生成海报失败...",
            mask: true,
            duration: 2000
          });
          return false;
        }
      });
    }
  },
  //将canvas转换为图片保存到本地，然后将路径传给image图片的src
  createPostPrefix: function (prefixPath, qrcodePath, title, excerpt) {
    //console.log(excerpt);
    var that = this;
    wx.showLoading({
      title: "正在生成海报",
      mask: true,
    });
    var context = wx.createCanvasContext('prefix');
    context.setFillStyle('#ffffff');//填充背景色
    context.fillRect(0, 0, 600, 970);
    context.drawImage(prefixPath, 0, 0, 600, 400);//绘制首图
    context.drawImage(qrcodePath, 90, 720, 180, 180);//绘制二维码
    context.drawImage(that.data.logo, 350, 740, 130, 130);//画logo
    context.setFillStyle("#696969");
    context.setFontSize(20);
    context.setTextAlign('center');
    context.fillText("阅读详情,请长按识别二维码", 300, 940);
    context.setFillStyle("#000000");
    context.beginPath()//分割线
    context.moveTo(30, 700)
    context.lineTo(570, 700)
    context.stroke();
    // this.setUserInfo(context);//用户信息        
    util.drawTitleExcerpt(context, title, util.removeHTML(excerpt));//文章标题
    context.draw();
    //将生成好的图片保存到本地，需要延迟一会，绘制期间耗时
    setTimeout(function () {
      wx.canvasToTempFilePath({
        canvasId: 'prefix',
        success: function (res) {
          var tempFilePath = res.tempFilePath;
          wx.hideLoading();
          that.setData({
            prefixModal:true,
            prefix: res.tempFilePath
          });
          console.log("海报图片路径：" + res.tempFilePath);
        },
        fail: function (res) {
          console.log(res);
        }
      });
    }, 900);
  },
  /**
   * 保存海报至相册
   */
  saveToPhotosAlbum: function () {
    var self = this;
    var postPrefix = self.data.prefix;
    wx.saveImageToPhotosAlbum({
      filePath: postPrefix,
      success: function (data) {
        console.log(data);
        wx.showModal({
          title: '提示',
          content: '二维码海报已存入手机相册，赶快分享到朋友圈吧',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              console.log(res);
            }
          }
        })
      },
      fail: function (result) {
        console.log(result);
        if (result.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
          wx.showModal({
            title: '提示',
            content: '保存图片至相册需要授权允许',
            showCancel: false,
            success: function (res) {
              console.log(res);
            }
          })
        }
      }
    });
    self.hideModal();
  }
})