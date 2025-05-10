Page({
  data: {
    Goods: [] as OrderGoods[],
    minDate: '',
    reserveDate: '',
    reserveTime: '', 
    address: '',
    savedPhone: '',
    selectedRegion: ['浙江省', '杭州市' ], // 设置默认选中区域
    hangzhouAreas: [
      ['杭州市'],
      ['上城区','下城区','江干区','拱墅区','西湖区','滨江区','萧山区','余杭区','富阳区','临安区','临平区','钱塘区'],
      [] // 街道级不需要
    ],
    formValid: false,
    lessee: 0,
  },

  onLoad(options: any) {
    const goods = JSON.parse(decodeURIComponent(options.goods));
    const today = new Date();
    const tomorrow = new Date(today.setDate(today.getDate() + 1));
    const minDate = `${tomorrow.getFullYear()}-${tomorrow.getMonth()+1}-${tomorrow.getDate()}`;
   
    // 读取本地存储的联系方式
    const savedPhone = wx.getStorageSync('reserve_phone') || '';
    const savedAddress = wx.getStorageSync('reserve_address') || '';
    const savedRegion =  wx.getStorageSync('reserve_region') || ['浙江省', '杭州市' ];
    const lessee = wx.getStorageSync('lessee') || 0;
    this.setData({ 
      goods,
      minDate,
      reserveTime: '09:00',
      savedPhone,
      address: savedAddress,
      selectedRegion: savedRegion,
      selectedSlot: "morning",
      lessee: lessee,
    });
  },

  dateChange(e: any) {
    this.setData({ reserveDate: e.detail.value });
    this.checkForm();
  },

  // 时间选择变更
  timeChange(e: any) {
    const time = e.detail.value;
    // 验证时间格式
    if (this.validateTime(time)) {
      this.setData({ reserveTime: time });
    } else {
      wx.showToast({ title: '请选择08:00-18:00之间的时间', icon: 'none' });
    }
  },

  // 验证时间是否在8:00-18:00范围内
  validateTime(time: string): boolean {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    return totalMinutes >= 480 && totalMinutes <= 1080; // 8:00=480min, 18:00=1080min
  },

  regionChange(e: any) {
    const value = e.detail.value;
    if (value.length < 2 || e.detail.value[1] !== '杭州市') {
      wx.showToast({ title: '暂只支持杭州市内地址', icon: 'none' });
      return;
    }
    this.setData({ 
        selectedRegion: value,
     });
  },
  
  checkForm() {
    const { reserveDate, reserveTime, selectedRegion } = this.data;
    if (!reserveDate){
      wx.showToast({ title: '请选择预约日期', icon: 'none' });
      return false
    } 

    if (!reserveTime){
      wx.showToast({ title: '请选择时间', icon: 'none' });
      return
    }

    if (selectedRegion.length<3){
      wx.showToast({ title: '请选择预约地址', icon: 'none' });
      return
    }

    
    return true
  },

  submitForm(e: any) { 
    const formData = e.detail.value;
    if (!formData.phone.match(/^1[3-9]\d{9}$/)) {
      wx.showToast({ title: '请输入正确手机号', icon: 'none' });
      return;
    }
    if (!formData.address){
      wx.showToast({ title: '请填写详细地址', icon: 'none' });
      return;
    }

    // 保存联系方式到本地
    wx.setStorageSync(this.data.lessee.toString() + '/reserve_phone', formData.phone);
    wx.setStorageSync(this.data.lessee.toString() + '/reserve_address', formData.address);
    wx.setStorageSync(this.data.lessee.toString() + '/reserve_region', this.data.selectedRegion);

    // 构建预约信息
    const dateTime = this.data.reserveDate +' '+ this.data.reserveTime;
    const order = {
      goods: this.data.Goods,
      time: dateTime,
      phone: this.data.savedPhone,
      address: this.data.selectedRegion.join('') + this.data.address,
      comment: formData.comment
    };

    if (!this.checkForm()){
      // wx.showToast({ title: '请完善信息再提交预约', icon: 'none' });
      return
    }
    console.log(order);

    const token =  wx.getStorageSync('token') || '';
    const lessee = wx.getStorageSync('lessee') || 0;
    const cartKey = this.data.lessee.toString() + '/cart';
    wx.request({
      url: 'https://mini.iakl.top/api/v1/mini/order',
      method: 'POST',
      data: order,
      header:{
        "Authorization": token,
        "lessee": lessee,
        "content-type": 'application/json'
      },
      success: (res) => { 
        console.log(res);
        wx.removeStorageSync(cartKey);
        wx.showToast({ 
          title: '预约成功', 
          success: () => {
            setTimeout(() => wx.navigateBack(), 1500);
          }
        });
      },
      fail: (err) => {
        console.error('预约失败', err);
        wx.showToast({ title: '预约失败', icon: 'none' });
        this.setData({ loading: false });
      }
    });
  },
});