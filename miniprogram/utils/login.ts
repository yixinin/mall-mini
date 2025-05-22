
export const userLogin = () => {
  return new Promise((resolve, reject) => {
    var token = wx.getStorageSync("token") || '';
    wx.removeStorageSync('token');
    if (token) {
      getUserInfoByToken(token, resolve, reject);
    } else {
      login(resolve, reject);
    }
  })
}

function login(resolve: any, reject: any) {
  wx.getUserInfo({
    success: res => {
      const { nickName, avatarUrl } = res.userInfo;
      wx.login({
        success(res) {
          if (res.code) {
            wx.request({
              url: 'https://mini.iakl.top/api/v1/login',
              method: 'POST',
              data: {
                code: res.code,
                nickname: nickName,
                avatar_url: avatarUrl
              },
              success(res) {
                const ack = res.data as LoginRes;
                // 存储token到本地
                if (ack.token) {
                  console.log('登录成功', ack)
                  wx.setStorageSync('token', ack.token);
                  wx.setStorageSync('userInfo', ack.userinfo);
                  resolve(ack.token);
                  return
                }
                reject("login failed");
              },
              fail(res) {
                reject("login failed");
              }
            })
          }
        }
      })
    }
  });
  return false
}
function getUserInfoByToken(token: string,resolve: any, reject: any) {
  wx.request({
    url: 'https://mini.iakl.top/api/v1/mini/user/info',
    method: 'GET',
    header: {
      "Authorization": token
    },
    data: {},
    success(res) {
      console.log(res);
      if (res.statusCode == 200) {
        var ack = res.data as Ack<UserInfo>;
        if (ack.data) {
          wx.setStorageSync('userInfo', ack.data);
          wx.setStorageSync('token', token);
          resolve(token);
          return
        }
      }
      login(resolve, reject);
    }, fail(res) {
      login(resolve, reject);
    }
  });
}