import {getUsersURL} from '../../../utils/urls';
import {updateUserKind} from '../../../remote/user';
// 封装 wx.request 为 Promise
const request = <T>(options: WechatMiniprogram.RequestOption): Promise<T> => {
  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      success: (res) => { 
        resolve(res.data as T)
      },
      fail: reject,
    });
  });
};

Page({
  data: {
    loading: false, // 加载状态
    users: [] as UserInfo[], // 管理员列表 
    currentUserKind: '' , // 当前登录用户的身份
  },

  onLoad() {
    this.fetchUserList(); 
  }, 
  // 获取用户列表
  async fetchUserList() {
    this.setData({ loading: true }); 
    try {
      const data = await request<Ack<UserInfo[]>>({
        url: getUsersURL(),
        method: 'GET',
        header: {
          'Authorization': wx.getStorageSync('token'),
          'lessee': wx.getStorageSync("lessee"),
        }
      });
      
      console.log("users",data); 
      this.setData({
        users: data.data, 
        loading: false,
      });
    } catch (error) {
      console.error('获取用户列表失败:', error);
      wx.showToast({
        title: '获取用户列表失败',
        icon: 'none',
      });
      this.setData({ loading: false });
    }
  },
 
  async updateUserKind(e: any){
    const { id } = e.currentTarget.dataset;
    const ret = await updateUserKind(id, "manager");
    if (ret){
      wx.showToast({
        title:'成功',
        icon:'success'
      })
    }else{
      wx.showToast({
        title:'设置失败，请稍后再试。',
        icon:'error'
      })
    }
  }, 
});