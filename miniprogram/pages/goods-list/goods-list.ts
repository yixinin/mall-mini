import { getGoodsList } from '../../service/goods';

type SortType = 'default' | 'sales' | 'price' | 'price';
type PriceOrder = 'asc' | 'desc'; // 新增价格排序方向
Page({
  data: {
    domain: 'https://mini.iakl.top',
    goodsList: [] as GoodsItem[], // 商品列表
    sortType: 'default' as SortType, // 当前排序方式
    priceOrder: 'desc' as PriceOrder, // 新增价格排序方向状态
    isLoading: false, // 是否正在加载
    lessee: 0,
  },

  onLoad() {
    wx.getStorage({
      key: 'lessee',
      success: (res) => {
        console.log('lessee:', res.data);
        this.loadGoodsList(res.data);
      },
      fail: (res) => {
        console.log('load lessee fail:', res);
      }
    })
  },
  async onRefresh() {
    this.setData({ refreshing: true });

    try {
      await this.loadGoodsList(this.data.lessee);
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    } catch (error) {
      wx.showToast({
        title: '刷新失败',
        icon: 'none'
      });
      console.error('刷新商品列表失败:', error);
    } finally {
      this.setData({ refreshing: false });
    }
  },


  loadGoodsList(lessee: number) {
    this.setData({ isLoading: true, lessee: lessee });
    getGoodsList().then((goodsList) => {
      goodsList.map((v, i, _) => {
        goodsList[i].discount = Math.floor((v.final_price / v.price) * 100) / 10;
      })
      this.setData({
        goodsList: goodsList,
        isLoading: false,
      });
    }).catch((err) => {
      console.error('获取商品列表失败', err);
      wx.showToast({ title: '加载失败, 请稍后再试。', icon: 'none' });
      this.setData({ loading: false });
    });
  },

  // 排序商品列表
  sortGoodsList(type: SortType) {
    const { goodsList, priceOrder } = this.data;
    let sortedList = [...goodsList];

    switch (type) {
      case 'sales':
        sortedList.sort((a, b) => b.sold - a.sold);
        break;
      case 'price':
        sortedList.sort((a, b) =>
          priceOrder === 'asc'
            ? a.final_price - b.final_price
            : b.final_price - a.final_price
        );
        break;
      case 'default':
      default:
        // 默认排序
        sortedList.sort((a, b) => a.id - b.id);
        break;
    }

    this.setData({
      goodsList: sortedList,
      sortType: type
    });
  },

  // 切换排序方式
  handleSortChange(e: WechatMiniprogram.TouchEvent) {
    const { type } = e.currentTarget.dataset;

    if (type === 'price') {
      // 价格排序切换方向
      const newOrder = this.data.priceOrder === 'asc' ? 'desc' : 'asc';
      this.setData({
        priceOrder: newOrder,
        sortType: type
      }, () => {
        this.sortGoodsList(type);
      });
    } else {
      // 其他排序
      this.setData({
        sortType: type as SortType
      }, () => {
        this.sortGoodsList(type);
      });
    }
  },

  // 跳转到商品详情
  goToDetail(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/goods-detail/goods-detail?id=${id}`
    });
  },

  getCartKey() {
    const lessee = wx.getStorageSync('lessee');
    const key = lessee.toString() + '/cart';
    console.log("cart key ", key);
    return key
  },
  // 添加购物车方法
  addToCart(e: WechatMiniprogram.TouchEvent) {
    const { id } = e.currentTarget.dataset;
    const product = this.data.goodsList.find(item => item.id === id);
    if (!product) {
      console.log("unknown id")
      return
    }
    // 获取当前购物车
    let cart: CartGoodsItem[] = wx.getStorageSync(this.getCartKey()) || [];
    console.log(cart);
    console.log('goods id', id);
    // 检查是否已存在
    const existIndex = cart.findIndex(item => item.info.id === id);
    var added = false;
    if (existIndex >= 0) {
      if (cart[existIndex].quantity < 5) {
        cart[existIndex].quantity += 1;
        added = true
      } else {
        // 显示反馈
        wx.showToast({
          title: '最多添加5个',
          icon: 'error'
        });
      }
    } else {
      cart.push({
        info: product,
        quantity: 1
      });
      added = true;
    }

    if (added) {
      // 显示反馈
      wx.showToast({
        title: '添加成功',
        icon: 'success'
      });
      // 保存到本地
      wx.setStorageSync(this.getCartKey(), cart);
      // 更新购物车角标
      this.updateTabBarBadge();
    }





  },

  // 更新购物车角标
  updateTabBarBadge() {
    const cart: CartGoodsItem[] = wx.getStorageSync(this.getCartKey()) || [];
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (total > 0) {
      wx.setTabBarBadge({
        index: 1,
        text: total.toString()
      });
    } else {
      wx.removeTabBarBadge({ index: 1 });
    }
  },

  // 页面显示时更新角标
  onShow() {
    this.updateTabBarBadge();
  },
});