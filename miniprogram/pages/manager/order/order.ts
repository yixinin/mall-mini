Page({
  data: {
    orders: [],
    loading: false,
    page: 1,
    size: 10,
    hasMore: true,
    status: 'watting', 
    statusOptions: [
      { value: 'watting', label: '待上门' },
      { value: 'done', label: '已完成' },
      { value: 'canceled', label: '已取消' },
      { value: '', label: '全部' }
    ]
  },

  onLoad() {
    this.loadOrders()
  },

  loadOrders() {
    if (this.data.loading || !this.data.hasMore) return

    this.setData({ loading: true })
    const status=this.data.status; 
    const lessee = wx.getStorageSync("lessee")|| 0;
    wx.request({
      url: 'https://mini.iakl.top/api/v1/manage/mini/order',
      method: 'GET',
      header: {
        'Authorization': wx.getStorageSync('token'),
        'lessee': lessee,
      },
      data: {  
            lessee_id: lessee,
          },
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

  doneOrder(e){
    const id = e.currentTarget.dataset.id;
    this.updateOrderStatus(id,'done');
  },
  cancelOrder(e){
    const id = e.currentTarget.dataset.id;
    this.updateOrderStatus(id,'canceled');
  },
  updateOrderStatus(id:number,status: string){
    wx.request({
      url: 'https://mini.iakl.top/api/v1/manage/mini/order/'+ id.toString(),
      method: 'PUT',
      header: {
        'Authorization': wx.getStorageSync('token'),
        'lessee': wx.getStorageSync('lessee'),
        'content-type': 'application/json'
      },
      data: {  
             status: status,
          },
      success: (res) => {
        console.log(res.data); 
      },
      fail: (err) => {
        console.error('更新订单状态失败', err)
        wx.showToast({ title: '更新订单状态失败', icon: 'none' })
      }
    })
  }
})