// pages/index/index.ts

Page({
  data: {
    userInfo: {} as WxUserInfo,
    hasUserInfo: false,
    lessee: 1033,
    isManager: false
  },
  onLoad() {
    console.log("current lessee", this.data.lessee);
    
    wx.setStorageSync('lessee', this.data.lessee);
    this.goGoods();
  },
  login() {
    var token = wx.getStorageSync("token") || '';
    if (token) {
      wx.request({
        url: 'https://mini.iakl.top/api/v1/mini/user/info',
        method: 'GET',
        header: {
          "Authorization": token
        },
        data: {},
        success(res) {
          console.log(res);

          if (res.statusCode != 200) {
            token = ''
          }

          var ack = res.data as Ack<UserInfo>;
          if (ack.data.kind === "customer") {
            wx.switchTab({
              url: "/pages/goods-list/goods-list"
            })
            return
          } else {
          }
        }
      });
    }

    wx.setStorageSync("lessee", this.data.lessee);
    wx.getUserInfo({
      success: res => {
        console.log("userinfo:", res.userInfo);
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        const { nickName, avatarUrl } = res.userInfo;
        console.log("nickname:", nickName, "avatar:", avatarUrl);

        wx.login({
          success(res) {
            if (res.code) {
              wx.request({
                url: 'https://mini.iakl.top/api/v1/login',
                method: 'POST',
                data: {
                  code: res.code,
                  nickname: nickName,  // 可选
                  avatar_url: avatarUrl  // 可选
                },
                success(res) {
                  console.log('登录成功', res.data)
                  const ack = res.data as Ack<LoginRes>;
                  // 存储token到本地
                  if (ack.code == 0) {
                    wx.setStorageSync('token', ack.data.token);
                    if (ack.data.userinfo.kind === "customer") {
                      wx.switchTab({
                        url: "/pages/goods-list/goods-list"
                      })
                      return
                    } else {

                    }
                  }


                }
              })
            }
          }
        })

      }
    });
    this.setData({
      isManager: true,
    })
  },
  goOrders() {
    wx.navigateTo({
      url: "/pages/manager/order/order"
    })
  },
  goGoods() {
    wx.switchTab({
      url: "/pages/goods-list/goods-list"
    });
  }
});