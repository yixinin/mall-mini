Page({
  data: {
    orders: [],
    loading: false,
    page: 1,
    size: 10,
    hasMore: true,
    status: '', 
    statusOptions: [
      { value: '', label: '全部' },
      { value: 'watting', label: '待处理' },
      { value: 'done', label: '已完成' },
      { value: 'canceled', label: '已取消' }
    ]
  },

  onLoad() {
    this.loadOrders()
  },

  loadOrders() {
    if (this.data.loading || !this.data.hasMore) return

    this.setData({ loading: true })
    const status=this.data.status; 
    wx.request({
      url: 'https://mini.iakl.top/api/v1/mini/order',
      method: 'GET',
      header: {
        'Authorization': wx.getStorageSync('token'),
        'lessee': wx.getStorageSync('lessee')
      },
      data: {      },
      success: (res) => {
        console.log(res.data);
        
        if (res.data.code === 0) {
          var datas = [];
          res.data.data.map((v,_)=>{
            if (!(status) || v.status === status){
              datas.push(v);
            }
          })
          this.setData({
            orders: datas,
            loading: false
          })
        }
      },
      fail: (err) => {
        console.error('获取订单失败', err)
        wx.showToast({ title: '加载失败', icon: 'none' })
        this.setData({ loading: false })
      }
    })
  },

  onReachBottom() {
    if (this.data.hasMore) {
      this.setData({ page: this.data.page + 1 })
      this.loadOrders()
    }
  },

  onPullDownRefresh() {
    this.setData({
      page: 1,
      orders: [],
      hasMore: true
    })
    this.loadOrders(() => {
      wx.stopPullDownRefresh()
    })
  },

  // 切换订单状态筛选
  changeStatus(e) {
    const status = e.currentTarget.dataset.status
    this.setData({
      status,
      page: 1,
      orders: [],
      hasMore: true
    })
    this.loadOrders()
  },

  // 跳转到订单详情
  goToDetail(e) {
    const orderId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/order/detail?id=${orderId}`
    })
  }
})