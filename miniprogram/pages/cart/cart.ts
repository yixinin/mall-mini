import { userLogin } from "../../utils/login";

// pages/cart/cart.ts
Page({
  data: {
    domain: 'https://mini.iakl.top',
    cartList: [] as CartGoodsItem[],
    totalPrice: 0, 
    showAgreementModal: false,
    agreements: {
      user: false,
      privacy: false
    },
    canConfirm: false
  },

  onShow() {
    this.loadCartData();   
  },

  getCartKey(){
    const lessee = wx.getStorageSync('lessee');
    const key = lessee.toString() + '/cart';
    console.log("cart key ",key);
    return key
  },

  loadCartData() {
    const cart = wx.getStorageSync(this.getCartKey()) || [];
    this.calculateTotal(cart);
    this.setData({ cartList: cart });
    this.updateTabBarBadge();
  },

  calculateTotal(cart: any[]) {
    const total = cart.reduce((sum, item) => {
      return sum + (item.info.final_price * item.quantity);
    }, 0);
    console.log("total price", total);
    
    this.setData({ totalPrice: total });
  },

  changeQuantity(e: WechatMiniprogram.TouchEvent) {
    const { index, type } = e.currentTarget.dataset;
    let { cartList } = this.data;

    if (type === 'plus') {
      cartList[index].quantity += 1;
    } else if (type === 'minus') {
      cartList[index].quantity -= 1;
      if (cartList[index].quantity < 1) {
        this.removeItem(e);
        return;
      }
    }
    
    this.updateCart(cartList);
  },

  removeItem(e: WechatMiniprogram.TouchEvent) {
    const { index } = e.currentTarget.dataset;
    let { cartList } = this.data;
    
    wx.showModal({
      title: '提示',
      content: '确定删除该商品吗？',
      success: (res) => {
        if (res.confirm) {
          cartList.splice(index, 1);
          this.updateCart(cartList);
        }
      }
    });
  },

  updateCart(cartList: CartGoodsItem[]) {
    wx.setStorageSync(this.getCartKey(), cartList);
    this.calculateTotal(cartList);
    this.setData({ cartList });
    this.updateTabBarBadge();
  },

  updateTabBarBadge() {
    const total = this.data.cartList.reduce((sum, item) => sum + item.quantity, 0);
    if (total > 0) {
      wx.setTabBarBadge({
        index: 1,
        text: total.toString()
      });
    } else {
      wx.removeTabBarBadge({ index: 1 });
    }
  },
  handleReserve(e: WechatMiniprogram.TouchEvent) {
    var userInfo = wx.getStorageSync('userInfo')
    if (!userInfo){
        this.setData({
          showAgreementModal: true
        });
    } else{
      this.goReverse();
    }
  },
  goReverse(){
    const products = this.data.cartList;
    var goods = [] as OrderGoods[];
    products.map((v,_)=>{
      goods.push({
        id: v.info.id,
        count: v.quantity
      })
    })
    wx.navigateTo({
      url: `/pages/cart/reverse/reverse?goods=${encodeURIComponent(JSON.stringify(goods))}`
    });
  },
  // 用户同意协议
  confirmAgreement() {
    if (this.data.canConfirm){
      this.setData({ showAgreementModal: false });
      this.getUserProfile();
    }else{
      wx.showToast({
        title: '请先阅读并勾选用户协议和隐私协议',
        icon: 'none',
      });
    } 
  },
  getUserProfile() {
    userLogin().then(() => {
      wx.setStorageSync('hasAgreed', true);
      const userInfo = wx.getStorageSync('userInfo');
      this.setData({
        userInfo: userInfo,
        hasAgreed: true,
      });
      wx.showToast({
        title: '登录成功',
        icon: 'success',
      });
      this.goReverse();
    }).catch(() => {
      wx.showToast({
        title: '获取信息失败',
        icon: 'error',
      });
    })
  },
  cancelAgreement() {
    this.setData({ showAgreementModal: false });
    wx.showToast({
      title: '需要同意协议才能使用，您可自行关闭并退出当前小程序。',
      icon: 'none',
    });
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
});