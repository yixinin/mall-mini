
import { getUserList, updateUserKind } from '../../../service/user';

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
      const users = await getUserList();
      this.setData({
        users: users, 
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