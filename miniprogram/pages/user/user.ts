
import { deleteUser, getCurrentUserInfo } from '../../service/user';
import { userLogin } from '../../utils/login';

Page({
  data: {
    userInfo: {} as UserInfo,
    hasAgreed: false,
    showAgreementModal: false,
    agreements: {
      user: false,
      privacy: false
    },
    canConfirm: false,
    manageGoods: false,
    managedUser: false,
    managedOrder: false,
    showLogoutModal: false,
  },

  onLoad() {
    this.initUserInfo();
  },

  updatetManage() {
    const userinfo = this.data.userInfo;
    var manageGoods = false
    var manageUser = false
    var manageOrder = false
    console.log("user: ", userinfo);

    switch (userinfo.kind) {
      case 'admin':
        manageGoods = true;
        manageOrder = true;
        manageUser = true;
        break
      case "manager":
        manageGoods = true
        manageOrder = true
        break
      case 'tech':
        manageOrder = true
        break
    }
    console.log("goods,order,user:", manageGoods, manageOrder, manageUser);

    this.setData({
      manageGoods,
      manageOrder,
      manageUser,
    })
  },

  async initUserInfo() {
    const hasAgreed = wx.getStorageSync('hasAgreed');
    if (hasAgreed) {
      const userInfo = await getCurrentUserInfo();
      if (userInfo) {
        wx.setStorageSync('userInfo', userInfo);
        this.setData({
          userInfo: {
            ...userInfo,
          },
          hasAgreed,
        });
        this.updatetManage();
      }
    }
  },

  // 生成简短用户ID
  generateShortId(): string {
    return Math.random().toString(36).substr(2, 8).toUpperCase();
  },

  handleLogin() {
    if (this.data.userInfo.nickname) return;

    this.setData({
      showAgreementModal: true,
    });
  },

  confirmAgreement() {
    if (this.data.canConfirm) {
      this.setData({ showAgreementModal: false });
      this.getUserProfile();
    } else {
      wx.showToast({
        title: '请先阅读并勾选用户协议和隐私协议',
        icon: 'none',
      });
    }
  },

  cancelAgreement() {
    this.setData({ showAgreementModal: false });
    wx.showToast({
      title: '需要同意协议才能使用，您可自行关闭并退出当前小程序。',
      icon: 'none',
    });
  },

  getUserProfile() {
    userLogin().then(() => {
      wx.setStorageSync('hasAgreed', true);
      const userInfo = wx.getStorageSync('userInfo');
      this.setData({
        userInfo: userInfo,
        hasAgreed: true,
      });
      this.updatetManage();
      wx.showToast({
        title: '登录成功',
        icon: 'success',
      });
    }).catch(() => {
      wx.showToast({
        title: '获取信息失败',
        icon: 'error',
      });
    })
  },

  navigateToOrders() {
    if (!this.checkLogin()) return;
    wx.navigateTo({ url: '/pages/order/order' });
  },

  navigateToJoin() {
    if (!this.checkLogin()) return;
    wx.navigateTo({ url: '/pages/join/join' });
  },

  contactCustomerService() {
    if (!this.checkLogin()) return;
    wx.makePhoneCall({ phoneNumber: '18858157313' });
  },

  navigateToAbout() {
    wx.navigateTo({ url: '/pages/about/about' });
  },

  checkLogin(): boolean {
    if (!this.data.hasAgreed) {
      this.handleLogin();
      return false;
    }
    return true;
  },
  toggleAgreement(e: WechatMiniprogram.TouchEvent) {
    const type = e.currentTarget.dataset.type as 'user' | 'privacy';
    const newValue = !this.data.agreements[type];

    this.setData({
      [`agreements.${type}`]: newValue,
      canConfirm: newValue && (type === 'user' ? this.data.agreements.privacy : this.data.agreements.user)
    });
  },
  navigateToUserAgreement() {
    wx.navigateTo({
      url: '/pages/user/agreement/agreement'
    });
  },

  navigateToPrivacyPolicy() {
    wx.navigateTo({
      url: '/pages/user/privacy/privacy'
    });
  },
  navigateToManageOrder() {
    wx.navigateTo({
      url: '/pages/order/order'
    })
  },
  navigateToManageUser() {
    wx.navigateTo({
      url: '/pages/manage/users/users'
    })
  },
  navigateToManageGoods() {
    wx.navigateTo({
      url: '/pages/manage/goods/goods'
    })
  },
  navigateToManageLessee() {
    wx.navigateTo({
      url: '/pages/manage/lessee/lessee'
    })
  },
  showLogoutConfirm() {
    this.setData({
      showLogoutModal: true
    });
  },

  // 隐藏注销确认弹窗
  hideLogoutModal() {
    this.setData({
      showLogoutModal: false
    });
  },

  async logoutUser() {

  },
  // 确认注销账号
  async confirmLogout() {
    wx.showLoading({ title: '处理中...' });

    try {
      // 调用注销API
      await deleteUser(this.data.userInfo.id);

      // 清除本地用户数据
      wx.removeStorageSync('userInfo');
      wx.removeStorageSync('hasAgreed');

      wx.reLaunch({
        url: '/pages/goods-list/goods-list'
      });

      wx.showToast({
        title: '账号已注销',
        icon: 'success'
      });
    } catch (error) {
      wx.showToast({
        title: '注销失败，请联系管理员',
        icon: 'none'
      });
      console.error('注销失败:', error);
    } finally {
      wx.hideLoading();
      this.setData({ showLogoutModal: false });
    }
  },
});