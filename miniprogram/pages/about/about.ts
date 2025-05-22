interface VersionInfo {
  currentVersion: string;
  latestVersion: string;
  updateDate: string;
}

Page({
  data: {
    versionInfo: {
      currentVersion: '', 
    } as VersionInfo
  },

  onLoad() {
    const acc =  wx.getAccountInfoSync();
    console.log("version:", acc.miniProgram.version );
    
    this.setData({
      currentVersion: acc.miniProgram.version,
    })
  },

  // 检查版本信息
  checkVersion() {
    // 这里可以加入实际获取版本信息的逻辑
    // 模拟网络请求
    setTimeout(() => {
      this.setData({
        'versionInfo.latestVersion': '2.2.0'
      });
    }, 1000);
  },

  // 检查更新
  checkUpdate() {
    if (this.data.versionInfo.currentVersion === this.data.versionInfo.latestVersion) {
      wx.showToast({
        title: '已是最新版本',
        icon: 'success'
      });
    } else {
      wx.showModal({
        title: '发现新版本',
        content: `最新版本 ${this.data.versionInfo.latestVersion}，是否立即更新？`,
        success: (res) => {
          if (res.confirm) {
            // 实际项目中这里调用更新逻辑
            wx.showToast({
              title: '开始下载更新...',
              icon: 'loading'
            });
          }
        }
      });
    }
  },

  // 拨打电话
  makePhoneCall() {
    wx.makePhoneCall({
      phoneNumber: '400-123-4567'
    });
  },

  // 复制微信公众号
  copyWeChat() {
    wx.setClipboardData({
      data: 'ExampleTech',
      success: () => {
        wx.showToast({
          title: '已复制微信公众号',
          icon: 'success'
        });
      }
    });
  },

  // 打开邮箱
  openEmail() {
    wx.setClipboardData({
      data: 'contact@example.com',
      success: () => {
        wx.showToast({
          title: '已复制邮箱地址',
          icon: 'success'
        });
      }
    });
  },

  // 打开地图
  openMap() {
    wx.openLocation({
      latitude: 31.2017,
      longitude: 121.5876,
      name: '张江高科技园区',
      address: '上海市浦东新区张江高科技园区'
    });
  }
});