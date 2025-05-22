Page({
  data: {
    goodsList: [] as GoodsItem[],
    filteredGoods: [] as GoodsItem[],
    searchKeyword: '',
    showDeleteModal: false,
    currentGoods: null as GoodsItem | null,
    deletingId: 0,
    domain: 'https://mini.iakl.top'
  },

  onLoad() {
    this.loadGoodsList();
  },

  onShow() {
    // 从编辑页面返回时刷新数据
    this.loadGoodsList();
  },

  // 加载商品列表
  async loadGoodsList() {
    wx.showLoading({ title: '加载中...' });
    try {
      const goodsList = await this.fetchGoodsList();
      this.setData({
        goodsList,
        filteredGoods: goodsList
      });
    } catch (error) {
      wx.showToast({ title: '加载失败', icon: 'none' });
      console.error('加载商品列表失败:', error);
    } finally {
      wx.hideLoading();
    }
  },

  fetchGoodsList(): Promise<GoodsItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        wx.request({
          url: 'https://mini.iakl.top/api/v1/mini/goods/manage',
          method: 'GET',
          header: {
            'Authorization': wx.getStorageSync('token'),
            'lessee': wx.getStorageSync('lessee')
          },
          data: {},
          success: (res) =>{
            console.log(res);
            
            const ack = res.data as Ack<GoodsItem[]>;
            resolve( ack.data);
          },fail: (res) =>{
            console.log("get goods list error",res);
          }
        })
      }, 800);
    });
  },

  // 搜索输入处理
  onSearchInput(e: WechatMiniprogram.Input) {
    const keyword = e.detail.value.trim();
    this.setData({
      searchKeyword: keyword,
      filteredGoods: this.filterGoods(keyword)
    });
  },

  // 过滤商品列表
  filterGoods(keyword: string): GoodsItem[] {
    if (!keyword) return this.data.goodsList;
    return this.data.goodsList.filter(goods => 
      goods.name.includes(keyword) || 
      goods.tags.some(tag => tag.includes(keyword))
    );
  },

  // 跳转到添加商品页面
  navigateToAddGoods() {
    wx.navigateTo({
      url: '/pages/manage/goods/edit/edit'
    });
  },

  // 跳转到编辑商品页面
  navigateToEditGoods(e: WechatMiniprogram.TouchEvent) {
    const goodsId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/manage/goods/edit/edit?id=${goodsId}`
    });
  },

  // 切换商品状态(上架/下架)
  async toggleGoodsStatus(e: WechatMiniprogram.TouchEvent) {
    const goodsId = e.currentTarget.dataset.id;
    const currentStatus = e.currentTarget.dataset.status;
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    wx.showLoading({ title: '处理中...' });
    try {
      await this.updateGoodsStatus(goodsId, newStatus);
      
      this.setData({
        goodsList: this.data.goodsList.map(goods => 
          goods.id === goodsId ? { ...goods, status: newStatus } : goods
        ),
        filteredGoods: this.filterGoods(this.data.searchKeyword)
      });
      
      wx.showToast({ 
        title: `商品已${newStatus === 'active' ? '上架' : '下架'}`,
        icon: 'success'
      });
    } catch (error) {
      wx.showToast({ title: '操作失败', icon: 'none' });
      console.error('切换商品状态失败:', error);
    } finally {
      wx.hideLoading();
    }
  },

  // 模拟更新商品状态API
  updateGoodsStatus(goodsId: number, newStatus: string) {
    
  },

  // 显示删除确认弹窗
  showDeleteConfirm(e: WechatMiniprogram.TouchEvent) {
    const goodsId = parseInt(e.currentTarget.dataset.id);
    const goods = this.data.goodsList.find(g => g.id === goodsId);
    if (goods) {
      this.setData({
        showDeleteModal: true,
        currentGoods: goods,
        deletingId: goodsId
      });
    }
  },

  // 隐藏删除确认弹窗
  hideDeleteModal() {
    this.setData({
      showDeleteModal: false,
      currentGoods: null,
      deletingId: 0
    });
  },

  // 确认删除商品
  async confirmDelete() {
    if (!this.data.deletingId) return;
    
    wx.showLoading({ title: '删除中...' });
    try {
      await this.deleteGoods(this.data.deletingId);
      
      this.setData({
        goodsList: this.data.goodsList.filter(goods => goods.id !== this.data.deletingId),
        filteredGoods: this.filterGoods(this.data.searchKeyword),
        showDeleteModal: false,
        currentGoods: null,
        deletingId: 0
      });
      
      wx.showToast({ title: '删除成功', icon: 'success' });
    } catch (error) {
      wx.showToast({ title: '删除失败', icon: 'none' });
      console.error('删除商品失败:', error);
    } finally {
      wx.hideLoading();
    }
  },

  // 模拟删除商品API
  deleteGoods(goodsId: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`删除商品 ${goodsId}`);
        resolve();
      }, 500);
    });
  }
});