export const request = <T>(options: WechatMiniprogram.RequestOption): Promise<T> => {
  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      header: {
        'Authorization': wx.getStorageSync('token'),
        'lessee': wx.getStorageSync('lessee')
      },
      success: (res) => {
        console.log(options.url, res);
        resolve(res.data as T)
      },
      fail: reject,
    });
  });
};