const app = getApp()
const md5 = require("../../utils/md5.js")

Page({
  data: 
  {
    address: {},
    hasAddress: false,
    total: 0,
    orders: [],
    myList: [],
    openid: '',
    nonce_str: '',
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

  onReady() 
  {
    const self = this;
    // 32位随机字符串
    var nonce_str = app.RndNum()
    // 获取ip地址
    wx.cloud.callFunction({
      name: 'getIP'
    }).then(e => {
      if (e) {
        let spbill_create_ip = e.result.body.split("query\"\:\"")[1].split("\"\,\"")[0]
        console.log("IP地址为：" + spbill_create_ip)
        self.setData({
          spbill_create_ip: spbill_create_ip
        })
      }
    }).catch(err => {
      if (err) {
        wx.showModal({
          title: '错误',
          content: '请您重新下单~',
        })
      }
    })

    // 获取总价和openid
    self.setData({
      orders: app.globalData.carts,
      nonce_str: nonce_str
    })
    this.getOpenid();
    this.getTotalPrice();
  },


  onShow: function ()
   {
    const self = this;
    wx.getStorage({
      key: 'address',
      success(res) {
        self.setData({
          address: res.data,
          hasAddress: true
        })
      }
    })
  },

  /*计算总价*/
  getTotalPrice()
   {
    let orders = this.data.orders;
    let total = 0;
    for (let i = 0; i < orders.length; i++) {
      total += orders[i].num * orders[i].price;
    }
    this.setData({
      total: total.toFixed(2)
    })
  },


  // 获取用户openid
  getOpenid() 
  {
    var that = this;
    wx.cloud.callFunction({
      name: 'add',
      complete: res => {
        console.log('云函数获取到的openid: ', res.result.openId)
        var openid = res.result.openId;
        that.setData({
          openid: openid,
        })
      }
    })
  },

  // -------------支付------------------
  toPay() {
    var that = this
    if (that.data.hasAddress) {

      // ------获取prepay_id，所需的签名字符串------
      var p = new Promise((resolve, reject) => {
        // 生成订单号
        var out_trade_no = (new Date().getTime() + app.RndNum(6)).toString()

        // -----生成字符串------
        var stringA =
          "appid=" + app.globalData.appid +
          "&attach=test" +
          "&body=JSAPItest" +
          "&device_info=WEB" +
          "&mch_id=" + app.globalData.mch_id +
          "&nonce_str=" + that.data.nonce_str +
          "&notify_url=http://www.weixin.qq.com/wxpay/pay.php" +
          "&openid=" + that.data.openid +
          "&out_trade_no=" + out_trade_no +
          "&spbill_create_ip=" + that.data.spbill_create_ip +
          "&time_expire=" + app.beforeNowtimeByMin(-15) +
          "&time_start=" + app.CurrentTime() +
          "&total_fee=" + parseInt(that.data.total * 100) +
          "&trade_type=JSAPI";

        var stringSignTemp = stringA + "&key=" + app.globalData.apikey
        // 签名MD5加密
        var sign = md5.md5(stringSignTemp).toUpperCase()
        // console.log("签名：" + stringSignTemp)

        // openid
        var openid = that.data.openid
        resolve([sign, openid, out_trade_no])

        // ------生成订单信息-------
        let tmp = that.data.address
        tmp['provinceName'] = app.globalData.province_Arr[that.data.address['provinceName']]
        //tmp['addressItem'] = app.globalData.address_Arr[that.data.address['addressItem']]
        tmp['orderTime'] = app.CurrentTime_show()
        tmp['orderSuccess'] = true
        tmp['payTime'] = ''
        tmp['paySuccess'] = true
        tmp['sending'] = false
        tmp['finished'] = false

        const orderMaster = tmp

        var tmpList = []
        that.data.orders.forEach((val, idx, obj) => {
          tmpList.push([val.name, val.num, val.price])
        })
        orderMaster['teaList'] = tmpList
        orderMaster['total'] = that.data.total
        orderMaster['openid'] = that.data.openid
        orderMaster['out_trade_no'] = out_trade_no


        console.log(orderMaster)
        that.setData({
          address: orderMaster
        })

        // 上传数据库
        app.addRowToSet('orderMaster', orderMaster, e => {
          console.log("订单状态已修改：【订单生成】" + e)
        })
        wx.showToast({
          title: '支付成功',
        })
      })
    } 
    else 
    {
      wx.showModal({
        title: 'Oh No',
        content: '请填写收货地址~',
      })
    }
  },


  // 支付后的订单信息
  getListAfterPay: function (that)
   {
    var p = new Promise((resolve, reject) => {
      let theList = []
      that.data.orders.forEach((val, idx, obj) => {
        var 
        {
          name,
          num,
          price
        } = val
        var tmpInfo = {
          name,
          num,
          price
        }
        theList.push(tmpInfo)
      })
      resolve(theList)
    }).then(res => {
      // console.log(res)
      that.setData({
        myList: res
      })
    })
  },
})