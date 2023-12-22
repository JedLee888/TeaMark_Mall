// miniprogram/pages/homepage/homepage.js
const app = getApp()

Page({
  data:
   {
    swiperImgNo: 1,
    imgSwiperUrl: '',
    teaInfo: [],
    typeCat: [
      { id: 0, name: "品质茶叶" },
      { id: 1, name: "今日特惠" },
      { id: 2, name: "新鲜上架" },
      { id: 3, name: "店主推荐" },
    ],

    activeTypeId: 0,
    isShow:true, 
    openid: '',   
    offLine:null //是否维护
  },

  // 获取用户openid
  getOpenid() 
  {
    let that = this;
    wx.cloud.callFunction({
      name: 'add',
      complete: res => {
        console.log('云函数获取到的openid: ', res.result.openId)
        var openid = res.result.openId;
        that.setData({
          openid: openid
        })
      }
    })
  },

  // ------------加入购物车------------
  addCartByHome: function(e) {
    // console.log(e.currentTarget.dataset._id)
    var self = this
    let newItem = {}
    app.getInfoWhere('teaBoard', { _id: e.currentTarget.dataset._id },
      e => {
        // console.log(e.data["0"])
        var newCartItem = e.data["0"]
        newCartItem.num = 1
        app.isNotRepeteToCart(newCartItem)
        wx.showToast({
          title: '已添加至购物车',
        })
      }
    )
  },


  // ------------分类展示切换---------
  typeSwitch: function(e) {
    console.log(e.currentTarget.id)
    getCurrentPages()["0"].setData({
      activeTypeId: parseInt(e.currentTarget.id)
    })
    switch (e.currentTarget.id) {
      // 全部展示
      case '0':
        app.getInfoByOrder('teaBoard', 'time', 'desc',
          e => {
            getCurrentPages()["0"].setData({
              teaInfo: e.data
            })
          }
        )
        break;
      // 今日特惠
      case '1':
        app.getInfoWhere('teaBoard', {myClass:'1'},
          e => {
            getCurrentPages()["0"].setData({
              teaInfo: e.data
            })
          }
        )
        break;
      // 销量排行
      case '2':
        app.getInfoByOrder('teaBoard','time','desc',
          e => {
            getCurrentPages()["0"].setData({
              teaInfo: e.data
            })
          }
        )
        break;
      // 店主推荐
      case '3':
        app.getInfoWhere('teaBoard', { recommend: '1' },
          e => {
            getCurrentPages()["0"].setData({
              teaInfo: e.data
            })
          }
        )
        break;
    }
  },


  // ---------点击跳转至详情页面-------------
  tapToDetail: function(e) {
    wx.navigateTo({
      url: '../detail/detail?_id=' + e.currentTarget.dataset.fid,
    })
  },


  // ------------生命周期函数------------
  onLoad: function (options) {
    var that = this
    wx.showLoading({
      title: '茶文化宣传者',
    })
    that.setData({
      isShow: false
    })
    // 获取openId
    this.getOpenid();
  },

  onReady: function () { },

  onShow: function () {
    var that = this

    app.getInfoByOrder('teaBoard', 'time', 'desc',
      e => {
        getCurrentPages()["0"].setData({
          teaInfo: e.data,
          isShow: true
        })
        wx.hideLoading()
      }
    )

    // 是否下线
    app.getInfoWhere('Setting', { option:that.offLine },
      e => {
        console.log(e.data)
        that.setData({
          offLine: e.data["0"].offLine
          //offLine:true
        })
      }
    )
  },

  onHide: function () { },

  onUnload: function () { },

  onPullDownRefresh: function () {
  },

  onReachBottom: function () {

  },

  onShareAppMessage: function () {
    return {
      title: '茶印商城',
      imageUrl: 'cloud://teamark-9gpzbsagb399ab38.7465-teamark-9gpzbsagb399ab38-1319631338/图标/logo图.jpg',
      path: '/pages/homepage/homepage'
    }
  }
})