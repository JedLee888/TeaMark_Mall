// page/component/new-pages/user/user.js
const app = getApp();

Page({
  data: {
    orders: [],
    hasAddress: false,
    address: {},
    isAdmin: -1,
    openid: '',
    adiminArr: [
      '',
      'opk6E65DVvEfgpPkD-IcJgCcXjBg',
      'opk6E65DVvEfgpPkD-IcJgCcXjBg'
    ],

    province_Arr: [
      "河北省",
      "山西省",
      "辽宁省",
      "吉林省",
      "黑龙江省",
      "江苏省",
      "浙江省",
      "安徽省",
      "福建省",
      "江西省",
      "山东省",
      "河南省",
      "湖北省",
      "湖南省",
      "广东省",
      "广西自治区",
      "海南省",
      "四川省",
      "贵州省",
      "云南省",
      "陕西省",
      "甘肃省",
      "台湾省",
      "内蒙古自治区",
      "西藏自治区",
      "宁夏自治区",
      "新疆自治区",
      "北京市",
      "天津市",
      "上海市",
      "重庆市",
      "香港特区",
      "澳门特区"
    ],
  },
  onLoad() {
    var that = this;
    that.getOpenidAndOrders();
    // console.log(that.data)
  },

  onShow() {
    var self = this;
    // console.log(self.data)
    /**
     * 获取本地缓存 地址信息
     */
    wx.getStorage({
      key: 'address',
      success: function (res) {
        self.setData({
          hasAddress: true,
          address: res.data
        })
      }
    })
  },
  onPullDownRefresh: function () {
    var that = this
    that.getOpenidAndOrders()
    var timer

    (timer = setTimeout(function () {
      wx.stopPullDownRefresh()
    }, 500));

  },

  // 获取用户openid
  getOpenidAndOrders() {
    var that = this;
    wx.cloud.callFunction({
      name: 'add',
      complete: res => {
        console.log('云函数获取到的openid: ', res.result.openId)
        var openid = res.result.openId;
        var isAdmin = null;
        that.setData({
          openid: openid,
          isAdmin: that.data.adiminArr.indexOf(openid)
        })
        app.getInfoWhere('orderMaster', {
          openid: openid
        }, e => {
          console.log(e.data)
          var tmp = []
          var len = e.data.length
          for (var i = 0; i < len; i++) {
            tmp.push(e.data.pop())
          }
          that.setData({
            orders: tmp
          })
        })
      }
    })
  },



  goToBgInfo: function () {
    wx.navigateTo({
      url: '/pages/bgInfo/bgInfo',
    })
  },

  goToBgManage: function () {
    wx.navigateTo({
      url: '/pages/bgManage/bgManage',
    })
  }

})