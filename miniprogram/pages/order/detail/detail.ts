import { formatDate } from '../../../utils/util';
import { getMinDate } from '../../../utils/time';
import { getOrder, updateOrder } from '../../../service/order';
// 定义类型
type OrderStatus = 'watting' | 'confirmed' | 'completed' | 'cancelled';


type UserRole = 'customer' | 'tech' | 'manager' | 'admin';

Page({
  data: {
    orderId: 0,
    mode: '',
    orderData: {} as Order,
    userInfo: {} as UserInfo,

    // 状态显示映射
    statusIconMap: {
      watting: 'icon-watting.png',
      confirmed: 'icon-confirmed.png',
      completed: 'icon-completed.png',
      cancelled: 'icon-cancelled.png'
    },
    statusTextMap: {
      watting: '待接单',
      confirmed: '待上门',
      completed: '已完成',
      cancelled: '已取消'
    },
    statusDescMap: {
      watting: '订单已提交，等待接单',
      confirmed: '订单已确认，准备服务',
      completed: '订单已完成，感谢惠顾',
      cancelled: '订单已取消'
    },

    // 操作按钮显示控制
    showActionBar: false,
    showCancelButton: false,
    showDeleteButton: false,
    showConfirmButton: false,
    showCompleteButton: false,
    canEditTime: false,

    // 修改时间相关
    showTimeModal: false,
    minDate: '',
    maxDate: '',
    selectedDate: ''
  },

  onLoad(options: { id?: string, mode?: string }) {
    if (options.id) {
      this.setData({
        orderId: parseInt(options.id),
        mode: options.mode || '',
        selectedDate: this.formatDate(new Date()),
        selectedTime: '15:00',
        minDate: getMinDate(),
        maxDate: '2099-01-01'
      });
      this.loadOrderData();
      this.loadUserRole();
    } else {
      wx.showToast({ title: '订单ID无效', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
    }
  },

  loadUserRole() {
    const userInfo = wx.getStorageSync("userInfo") as UserInfo; // 测试用，可改为 customer/tech/manager
    this.setData({ userInfo }, () => {
      this.setupActionButtons();
    });
  },

  // 设置操作按钮显示状态
  setupActionButtons() {
    const { status } = this.data.orderData;
    if (!status) {
      return
    }
    const userRole = this.data.userInfo.kind as UserRole;

    let showActionBar = false;
    let showCancelButton = false;
    let showDeleteButton = false;
    let showConfirmButton = false;
    let showCompleteButton = false;
    let canEditTime = false;
    
    if (this.data.mode === 'manage') {
      switch (userRole) {
        case 'tech':
          showActionBar = status === 'watting' || status === 'confirmed';
          showCancelButton = status === 'watting' || status === 'confirmed';
          showConfirmButton = status === 'watting';
          showCompleteButton = status === 'confirmed';
          canEditTime = true;
          break;
        case 'admin':
          showActionBar = true;
          showCancelButton = status === 'watting' || status === 'confirmed';
          showDeleteButton = status === 'cancelled';
          showConfirmButton = status === 'watting';
          showCompleteButton = status === 'confirmed';
          canEditTime = true;
          break;
        case 'manager':
          showActionBar = true;
          showCancelButton = status === 'watting' || status === 'confirmed';
          showDeleteButton = status === 'cancelled';
          showConfirmButton = status === 'watting';
          showCompleteButton = status === 'confirmed';
          canEditTime = true;
          break;
      }
    } else {
      showActionBar = status === 'watting';
      showCancelButton = status === 'watting' && this.data.orderData.reverse.time >= this.data.minDate;
      canEditTime = showCancelButton;
    }
    this.setData({
      showActionBar,
      showCancelButton,
      showDeleteButton,
      showConfirmButton,
      showCompleteButton,
      canEditTime
    });
  },

  // 加载订单数据
  async loadOrderData() {
    wx.showLoading({ title: '加载中...' });

    try {
      const orderData = await getOrder(this.data.orderId);
      orderData.create_time = formatDate(new Date(orderData.create_time))
      orderData.update_time = formatDate(new Date(orderData.update_time))
      this.setData({
        orderData,
        selectedDate: orderData.reverse.time,
      }, () => {
        this.setupActionButtons();
      });
    } catch (error) {
      wx.showToast({ title: '加载失败', icon: 'none' });
      console.error('加载订单失败:', error);
    } finally {
      wx.hideLoading();
    }
  },

  // 日期格式化辅助函数
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  // 显示修改时间模态框
  showEditTimeModal() {
    this.setData({ showTimeModal: true });
  },

  // 隐藏修改时间模态框
  hideEditTimeModal() {
    this.setData({ showTimeModal: false });
  },

  // 日期选择变化
  onDateChange(e: WechatMiniprogram.PickerChange) {
    const dateStr: string = e.detail.value.toString();
    this.setData({
      selectedDate: dateStr
    });
  },

  // 时间选择变化
  onTimeChange(e: WechatMiniprogram.PickerChange) {
    this.setData({ selectedTime: e.detail.value });
  },

  // 更新预约时间
  async updateOrderTime() {
    const { selectedDate } = this.data;
    if (!selectedDate) {
      wx.showToast({ title: '请选择日期', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '更新中...' });

    try {
      await updateOrder(this.data.orderId, {
        'time': selectedDate
      });

      this.setData({
        'orderData.reverse.time': selectedDate,
        showTimeModal: false
      });

      wx.showToast({ title: '更新成功', icon: 'success' });
    } catch (error) {
      wx.showToast({ title: '更新失败', icon: 'none' });
      console.error('更新预约时间失败:', error);
    } finally {
      wx.hideLoading();
    }
  },

  // 取消订单
  async handleCancelOrder() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消此订单吗？',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });

          try {
            await updateOrder(this.data.orderId, { status: 'cancelled' }); 
            this.setData({
              'orderData.status': 'cancelled',
            }, () => {
              this.setupActionButtons();
            });

            wx.showToast({ title: '已取消', icon: 'success' });
          } catch (error) {
            wx.showToast({ title: '操作失败', icon: 'none' });
            console.error('取消订单失败:', error);
          } finally {
            wx.hideLoading();
          }
        }
      }
    });
  },

  // 确认订单
  async handleConfirmOrder() {
    wx.showLoading({ title: '处理中...' });

    try {
      // 模拟API请求
      await updateOrder(this.data.orderId, { status: 'confirmed' });

      this.setData({
        'orderData.status': 'confirmed',
        'orderData.update_time': new Date().toLocaleString()
      }, () => {
        this.setupActionButtons();
      });

      wx.showToast({ title: '已确认', icon: 'success' });
    } catch (error) {
      wx.showToast({ title: '操作失败', icon: 'none' });
      console.error('确认订单失败:', error);
    } finally {
      wx.hideLoading();
    }
  },

  // 完成订单
  async handleCompleteOrder() {
    wx.showLoading({ title: '处理中...' });

    try {
      // 模拟API请求
      await updateOrder(this.data.orderId, { status: 'completed' });

      this.setData({
        'orderData.status': 'completed',
        'orderData.update_time': new Date().toLocaleString()
      }, () => {
        this.setupActionButtons();
      });

      wx.showToast({ title: '已完成', icon: 'success' });
    } catch (error) {
      wx.showToast({ title: '操作失败', icon: 'none' });
      console.error('完成订单失败:', error);
    } finally {
      wx.hideLoading();
    }
  },

  // 删除订单
  async handleDeleteOrder() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除此订单吗？此操作不可恢复',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });

          try {
            // 模拟API请求
            await this.deleteOrder(this.data.orderId);

            wx.showToast({
              title: '已删除',
              icon: 'success',
              complete: () => {
                setTimeout(() => wx.navigateBack(), 1500);
              }
            });
          } catch (error) {
            wx.showToast({ title: '删除失败', icon: 'none' });
            console.error('删除订单失败:', error);
          } finally {
            wx.hideLoading();
          }
        }
      }
    });
  },

  // 模拟更新订单API
  updateOrder(orderId: number, data: Partial<Order>): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`更新订单 ${orderId}:`, data);
        resolve();
      }, 500);
    });
  },

  // 模拟删除订单API
  deleteOrder(orderId: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`删除订单 ${orderId}`);
        resolve();
      }, 500);
    });
  },

  // 拨打电话
  makePhoneCall() {
    wx.makePhoneCall({
      phoneNumber: this.data.orderData.reverse.phone
    });
  }
});