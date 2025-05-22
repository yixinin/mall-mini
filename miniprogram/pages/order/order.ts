
import { formatDate } from "../../utils/util";
Page({
  data: {
    mode: 'own',
    orders: [] as Order[],
    loading: false,
    page: 1,
    size: 10,
    hasMore: true,
    status: '',
    statusOptions: [
      { value: '', label: '全部' },
      { value: 'watting', label: '待处理' },
      { value: 'confirmed', label: '待上门' },
      { value: 'done', label: '已完成' },
      { value: 'cancelled', label: '已取消' }
    ]
  },

  onLoad(options: { mode?: string }) {
    if (options.mode) {
      this.setData({
        mode: options.mode,
      })
    }
    const mode = this.data.mode;
    this.loadOrders(mode, wx.getStorageSync('lessee'))
  },

  loadOrders(mode: string, lessee: number) {
    if (this.data.loading || !this.data.hasMore) return
    this.setData({ loading: true })
    const status = this.data.status;
    var url = 'https://mini.iakl.top/api/v1/mini/order'
    if (mode == 'manage') {
      url = url + '?manage=true&lessee_id=' + lessee.toString();
    }
    wx.request({
      url: url,
      method: 'GET',
      header: {
        'Authorization': wx.getStorageSync('token'),
        'lessee': wx.getStorageSync('lessee')
      },
      data: {},
      success: (res) => {
        console.log(res.data);
        const ack = res.data as Ack<Order[]>;
        if (ack.code === 0) {
          var datas = [] as Order[];
          if (ack.data) {
            ack.data.map((v, _) => {
              if (!(status) || v.status === status) {
                v.create_time = formatDate(new Date(Date.parse(v.create_time)))
                datas.push(v);
              }
            })
            this.setData({
              orders: datas,
              loading: false
            })
          }
        }
      },
      fail: (err) => {
        console.error('获取订单失败', err)
        wx.showToast({ title: '加载失败', icon: 'none' })
        this.setData({ loading: false })
      }
    })
  },
  // 切换订单状态筛选
  changeStatus(e: any) {
    const status = e.currentTarget.dataset.status
    this.setData({
      status,
      page: 1,
      orders: [],
      hasMore: true
    })
    const lessee = wx.getStorageSync("lessee") || 0;
    this.loadOrders(this.data.mode, lessee)
  },
  onOrderTap(e: any) {
    const id = e.currentTarget.dataset.id;

    wx.navigateTo({
      url: '/pages/order/detail/detail?id=' + id.toString() + '&mode=' + this.data.mode
    })
  }
})