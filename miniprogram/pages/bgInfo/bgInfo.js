// miniprogram/pages/bgInfo/bgInfo.js
const app = getApp()

Page({

  /*页面的初始数据*/
  data: {
    teaInfo: {},
    tmpUrlArr: [],
    delTeaId: "",
    cardNum: 1,
    files: [],
    time:0,
    manageList:[], //管理页面信息列表
    option:null,

    // 上传的信息
    teaID:null, //茶叶编号
    name:null,    //茶叶名称
    price:null,   //价格
    unit:null,    //单位
    detail:"",    //描述
    myClass:0,    //今日特惠
    recommend:0,  //店主推荐
    onShow:true,  //上架
    
    myClass_Arr: 
    [
      '否',
      '是'
    ],

    recommend_Arr: 
    [
      '否',
      '是'
    ],
    reFresh:null
  },

  // ------------------------获取信息------------------------
  // 获取茶叶编号
  getTeaID: function (e) 
  {
    this.setData({
      teaID: parseInt(e.detail.value)
    })
  },

  // 获取茶叶名称
  getName: function (e)
   {
    this.setData({
      name: e.detail.value
    })
  },

  // 获取价格
  getPrice: function (e)
   {
    this.setData({
      price: e.detail.value
    })
  },

  // 获取单位
  getUnit: function (e) 
  {
    this.setData({
      unit: e.detail.value
    })
  },

  //选择照片并预览（预览地址在files，上传后的地址在tmpUrlArr）
  chooseImage: function (e) 
  {
    var that = this;
    wx.chooseImage({
      success: function (res) 
      {
        that.setData({
          files: that.data.files.concat(res.tempFilePaths)
        });
        
        app.upToClound("imgSwiper", that.data.name + Math.random().toString(), 
        res.tempFilePaths["0"], tmpUrl => 
        {
          // console.log(tmpUrl)
          that.data.tmpUrlArr.push(tmpUrl)
          // console.log(getCurrentPages())
        })
      }
    })
    // console.log(getCurrentPages())
  },

  //预览图片
  previewImage: function (e) 
  {
    var that = this
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: that.data.tmpUrlArr // 需要预览的图片http链接列表
    })
  },

  //茶叶详细信息
  getInfoText: function (e) 
  {
    var that = this
    that.setData({
    })

    this.data.detail = e.detail.value;
  },

  // 今日特惠
  getMyClass: function (e) 
  {
    var that = this
    this.setData({
      myClass: e.detail.value.toString()
    })
  },

  // 店主推荐
  getRecommend: function (e) {
    var that = this
    this.setData({
      recommend: e.detail.value.toString()
    })
  },

  /*--------------------选项卡切换----------------------*/

  //添加
  tapTo1: function()
   {  
    var that = this
    that.setData({
      cardNum: 1
    })
  },

  //修改和删除
  tapTo2: function () 
  { 
    var that = this
    that.setData({
      cardNum: 2
    })
    // console.log(getCurrentPages())
  }, 

  tapTo3: function () 
  {
    var that = this
    that.setData({
      cardNum: 3
    })
  },

  /*----------------------提交操作---------------------*/

  // 添加茶叶信息表单
  addTeaInfo: function(e)
  {
    const that = this
    if (that.data.name && that.data.price){
      new Promise((resolve, reject) => {
        const { teaID, name, price, unit, detail, myClass, recommend, tmpUrlArr, onShow } = that.data
        const theInfo = { teaID, name, price, unit, detail, myClass, recommend, tmpUrlArr, onShow }
        theInfo['imgUrl'] = that.data.tmpUrlArr[0]
        theInfo['time'] = parseInt(app.CurrentTime())
        resolve(theInfo)
      }).then(theInfo => 
        {
        // 上传所有信息
        app.addRowToSet('teaBoard', theInfo, e => 
        {
          console.log(e)
          wx.showToast({
            title: '添加成功',
          })
        })
        app.getInfoByOrder('teaBoard', 'time', 'desc',
          e => 
          {
            that.setData({
              manageList: e.data
            })
          }
        )
      })
    }
    else
    {
      wx.showToast({
        title: '信息不完全',
      })
    }
    
  },

  /*----------------------修改茶叶参数----------------------*/

  // 上架茶叶
  upToLine:function(e)
  {
    var that = this
    app.updateInfo('teaBoard', e.currentTarget.id,
    {
      onShow: true
    },e=>{
      that.getManageList()
      wx.showToast({
        title: '已上架',
      })
    })
  },
  
  // 下架茶叶
  downFromLine: function (e) {
    var that = this
   
    app.updateInfo('teaBoard', e.currentTarget.id,
     {
      onShow: false
    }, e => 
    {
      that.getManageList()
      wx.showToast({
        title: '已下架',
      })
    })
  },

  // 绑定删除茶叶名称参数
  getDelTeaId: function(e) 
  {
    var that = this
    app.getInfoWhere('teaBoard',{
      name: e.detail.value
    },res=>{
      that.setData({
        delTeaId: res.data["0"]._id
      })
    })
  },

  // 删除茶叶
  deleteTea: function()
   {
    var that = this
    console.log(that.data.delTeaId)
    new Promise((resolve,reject)=>{
      app.deleteInfoFromSet('teaBoard', that.data.delTeaId)
    })
    .then(that.getManageList())
  },

  // 程序下线打烊
  offLine: function () 
  {
    var that = this
    app.getInfoWhere('Setting', {
      option:that.offLine,
    }, 
    res =>
     {
      console.log(res.data)
      let ch = !res.data["0"].offLine
      console.log(ch)
      app.updateInfo('Setting', res.data["0"]._id,{
        
        offLine: ch
      },e=>{
        wx.showToast({
          title: '操作成功',
        })
      })
       
    })
  },


  /*----------------------生命周期函数--监听页面加载----------------------*/
  getManageList:function(){
    var that = this
    app.getInfoByOrder('teaBoard', 'time', 'desc',
      e => {
        that.setData({
          manageList: e.data
        })
      }
    )
  },

  onLoad: function (options) {
    this.getManageList()
  },

  /*生命周期函数--监听页面初次渲染完成*/
  onReady: function () { },


  /*生命周期函数--监听页面显示*/
  onShow: function () 
  {
    this.getManageList()
  },


  /*生命周期函数--监听页面隐藏*/
  onHide: function () 
  {

  },


  /*生命周期函数--监听页面卸载*/
  onUnload: function () {

  },


  /*页面相关事件处理函数--监听用户下拉动作*/
  onPullDownRefresh: function () 
  {
    (timer = setTimeout(function () 
    {
      wx.stopPullDownRefresh()
    }, 500));
  },

  
  /*页面上拉触底事件的处理函数*/
  onReachBottom: function () {},


  /*用户点击右上角分享*/
  onShareAppMessage: function () {}

})