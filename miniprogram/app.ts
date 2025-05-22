// app.ts
App<IAppOption>({
  globalData: {
    userInfo: {
      avatarUrl: '',
      city: '',
      country: '',
      gender :0,
      language:'zh_CN', 
      nickName:'',
      province:'',
    }, 
  },
  onLaunch() {
    wx.setStorageSync("lessee", 1026); 
  },
})