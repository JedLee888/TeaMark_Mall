Page({
  data: {
    address: 
    {
    name: '',
    phone: '',
    detail: 0,
    message: "",
    provinceName:0,  //省份编号
    addressItem:"", //详细地址
    },

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
    ]
  },

  onLoad() 
  {
    var self = this;
    wx.getStorage({
      key: 'address',
      success: function (res) 
      {
        self.setData({
          address: res.data
        })
      }
    })
  },
  // 省份
  getProvince:function(e)
  {
    var that = this
    let tmp = getCurrentPages()["0"].data.address
    tmp['provinceName'] = parseInt(e.detail.value) 
    that.setData({
      address:tmp
    })
  },

  formSubmit(e) 
  {
    const value = e.detail.value;
    console.log(value)
    if (value.name && value.phone.length === 11 )
     {
      console.log(value)
      wx.setStorage({
        key: 'address',
        data: value,
        success() 
        {
          wx.navigateBack();
        }
      })
    } 
    else 
    {
      console.log(value)
      wx.showModal({
        title: '提示',
        content: '请填写完整资料',
        showCancel: false
      })
    }
  }
})