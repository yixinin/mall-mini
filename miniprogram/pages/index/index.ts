// pages/index/index.ts

Page({
  data: {
    userInfo: {} as WxUserInfo,
    hasUserInfo: false,
    isManager: false
  },
  onLoad() {  
    this.goGoods();
  },
  goOrders() {
    wx.navigateTo({
      url: "/pages/manage/order/order"
    })
  },
  goGoods() { 
    const url = "/pages/goods-list/goods-list";
    wx.switchTab({
      url: url,
    });
  }
});