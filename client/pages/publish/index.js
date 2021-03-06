Page({

  /**
   * 页面的初始数据
   */
  data: {
    publishList: [],
    scrollHeight: getApp().globalData.scrollHeight - 48,
    isShowRefresh: false,
    isShowLoadMore: false,
    limit: getApp().globalData.limit,
    times: 0, //加载更多的次数
    imageWidth:0, // 图片宽度
    inputVal: '',
    searchPublishList: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      imageWidth: (getApp().globalData.windowWidth - 30 - 18) / 3
    })
    
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
    this.getList(this.data.limit, this.data.limit * this.data.times, '')
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
    this.setData({
      isShowRefresh: true,
      times: 0
    })
    this.getList(this.data.limit, this.data.limit * this.data.times, 'down')
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let _t = this;
    this.setData({
      isShowLoadMore: true,
      times: _t.data.times + 1
    })
    this.getList(this.data.limit, this.data.limit * this.data.times, 'up')
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  },

  quickAsk: function () {
    this.getuploadtoken();
    wx.showActionSheet({
      // itemList: ['提问', '发图文', '拍视频', '上传视频'],
      itemList: ['提问', '发图文'],
      success: function (res) {
        if (res.tapIndex === 0) {
          wx.navigateTo({
            url: '/pages/publish/ask/ask?category=0'
          })
        }
        if (res.tapIndex === 1) {
          wx.navigateTo({
            url: '/pages/publish/ask/ask?category=1'
          })
        }
        if (res.tapIndex === 2) {
          wx.navigateTo({
            url: '/pages/publish/ask/ask'
          })
        }
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  },

  getList: function (limit, offset, types) {
    let _t = this;

    const requestTask = wx.request({
      url: getApp().globalData.url + '/miniapps/getpublishlist',
      method: 'POST',
      data: {
        limit: limit,
        offset: offset
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (types === 'down') {
          _t.setData({
            isShowRefresh: false
          })
          wx.stopPullDownRefresh(); // 数据请求成功后，停止刷新
        }
        if (types === 'up') {
          _t.setData({
            isShowLoadMore: false
          })
        }
        if (_t.data.times === 0 ) {
          _t.data.publishList = [];
        }
        res['data']['data'].forEach(cell => {
          let _time = new Date().getTime() - new Date(cell.date).getTime();
          // 1小时 = 60 * 60 * 1000
          // 1天 = 24 * 3600000
          if (_time < 60 * 1000) {
            cell.date = '刚刚';
          }else if (_time < 24 * 3600000) {
            if (_time < 60 * 60 * 1000) {
              cell.date =  Math.ceil( _time / 60000) + '分钟前';
            }
            if (_time > 60 * 60 * 1000 && _time < 24 * 60 * 60 * 1000) {
              cell.date = Math.ceil(_time / 3600000) + '小时前';
            }
          } else if (_time < 2 * 24 * 3600000) {
            cell.date = '昨天';
          } else if (_time < 10 * 24 * 3600000) {
            cell.date = Math.ceil(_time / (24 * 3600000)) + '天前'
          }
          _t.data.publishList.push(cell);
        });
        _t.setData({
          publishList: _t.data.publishList
        })
      }
    })
  },

  previewImage: function (e) {
    let list = [];
    e.currentTarget.dataset.list.forEach(item => {
      list.push('http://' + item);
    })
    wx.previewImage({
      current: e.currentTarget.id,
      urls: list // 需要预览的图片http链接列表
    })
  },

  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false
    });
  },
  clearInput: function () {
    this.setData({
      inputVal: ""
    });
  },
  inputTyping: function (e) {
    this.setData({
      inputVal: e.detail.value
    });
    // 查询后台
    this.search(e.detail.value);
  },
  search: function (keyWords) {
    let _t = this;
    const requestTask = wx.request({
      url: getApp().globalData.url + '/miniapps/searchpublish',
      method: 'POST',
      data: {
        keywords: keyWords
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        _t.setData({
          searchPublishList: res['data']['data']
        })
      }
    })
  },

  getuploadtoken: function () {
    let _t = this;
    const requestTask = wx.request({
      url: getApp().globalData.url + '/qiniu/getuploadtoken',
      method: 'GET',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.status === 1) {
          getApp().globalData.uploadtoken = res.data.data;
        }
      }
    })
  }
})