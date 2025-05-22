import { addOrder } from '../../../service/order';
import {getMinDate} from '../../../utils/time';
Page({
  data: {
    goods: [] as OrderGoods[],
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
    const goods = JSON.parse(decodeURIComponent(options.goods)) as OrderGoods[];
    console.log('cart goods:', goods);
     
    const minDate = getMinDate();
   
    // 读取本地存储的联系方式
    const lessee = wx.getStorageSync('lessee') || 0;
    const savedPhone = wx.getStorageSync(lessee.toString() +'/reserve_phone') || '';
    const savedAddress = wx.getStorageSync(lessee.toString() +'/reserve_address') || '';
    const savedRegion =  wx.getStorageSync(lessee.toString() +'/reserve_region') || ['浙江省', '杭州市' ];
  
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
    const date = e.detail.value; 
    if (this.data.minDate > date){
      console.log(this.data.minDate, date);
      wx.showToast({ title: '请至少提前1天预约', icon: 'error' });
      return 
    }
    this.setData({ reserveDate: e.detail.value }); 
  },

  // 时间选择变更
  timeChange(e: any) {
    const time = e.detail.value;
    // 验证时间格式
    if (this.validateTime(time)) {
      this.setData({ reserveTime: time });
    } else {
      wx.showToast({ title: '请选择08:00-18:00之间的时间', icon: 'error' });
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
      wx.showToast({ title: '暂只支持杭州市内地址', icon: 'error' });
      return;
    }
    this.setData({ 
        selectedRegion: value,
     });
  },
  
  checkForm() {
    const { reserveDate, reserveTime, selectedRegion } = this.data;
    if (!reserveDate){
      wx.showToast({ title: '请选择预约日期', icon: 'error' });
      return false
    } 

    if (!reserveTime){
      wx.showToast({ title: '请选择时间', icon: 'error' });
      return
    }

    if (selectedRegion.length<3){
      wx.showToast({ title: '请选择预约地址', icon: 'error' });
      return
    }

    
    return true
  },

  submitForm(e: any) { 
    const formData = e.detail.value;
    if (!formData.phone.match(/^1[3-9]\d{9}$/)) {
      wx.showToast({ title: '请输入正确手机号', icon: 'error' });
      return;
    }
    if (!formData.address){
      wx.showToast({ title: '请填写详细地址', icon: 'error' });
      return;
    }

    // 保存联系方式到本地
    wx.setStorageSync(this.data.lessee.toString() + '/reserve_phone', formData.phone);
    wx.setStorageSync(this.data.lessee.toString() + '/reserve_address', formData.address);
    wx.setStorageSync(this.data.lessee.toString() + '/reserve_region', this.data.selectedRegion);

    // 构建预约信息
    const dateTime = this.data.reserveDate +' '+ this.data.reserveTime;
    const order = {
      goods: this.data.goods,
      time: dateTime,
      phone: formData.phone,
      address: this.data.selectedRegion.join('') + formData.address,
      remark: formData.remark
    };
    console.log('currernt order: ',order);

    if (!this.checkForm()){
      // wx.showToast({ title: '请完善信息再提交预约', icon: 'none' });
      return
    }
   

    const token =  wx.getStorageSync('token') || '';
    if (!token){
      wx.showToast({ title: '请先登录', icon: 'none' });
      wx.navigateBack();
      return 
    }
    const cartKey = this.data.lessee.toString() + '/cart';

    addOrder(order).then((id)=>{
      wx.removeStorageSync(cartKey);
      wx.showToast({ 
        title: '预约成功，师傅稍后会联系您，请注意接听电话。您可在 我的->我的预约 查看当前已预约服务。', 
        success: () => {
          setTimeout(() => wx.navigateBack(), 1500);
        }
      });
    }).catch((err)=>{
      console.error('请求失败', err);
      wx.showToast({ title: '网络错误，请稍后再试。', icon: 'none' });
    }).finally(()=>{
      this.setData({ loading: false });
    })
  },
});