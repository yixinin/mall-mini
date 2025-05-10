Page({
  data: {
    userInfo: {}
  },

  onLoad() {
    this.getUserInfo();
  },

  getUserInfo() {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              this.setData({
                userInfo: res.userInfo
              });
            }
          });
        }
      }
    });
  }
});