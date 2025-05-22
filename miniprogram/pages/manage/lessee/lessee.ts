import { getShopInfo, getShopMembers, getJoins, putJoin, removeShopMember } from '../../../remote/lessee';
import { getUserInfo } from '../../../remote/user';

type TabKey = 'tech' | 'admins' | 'applications';

type PageData = {
  shopInfo: Lessee ;
  currentUser: UserInfo;
  loading: boolean;
  
  // Tab相关
  activeTab: TabKey;
  tabs: {
    key: TabKey;
    title: string;
  }[];
  
  // 成员列表
  techList: UserInfo[];
  adminList: UserInfo[];
  
  // 申请列表
  applications: Join[];
  filteredApplications: Join[];
  
  // UI状态
  refreshing: boolean;
};

Page<PageData, WechatMiniprogram.Page.CustomOption>({
  data: {
    shopInfo: {} as Lessee,
    currentUser: {} as UserInfo,
    loading: true,
    
    activeTab: 'tech',
    tabs: [
      { key: 'admins', title: '管理员' },
      { key: 'tech', title: '师傅' }, 
      { key: 'applications', title: '新' },
    ],
    
    techList: [],
    adminList: [],
    
    applications: [],
    filteredApplications: [],
    
    refreshing: false,
  },

  onLoad() {
    this.initPage();
  },

  onPullDownRefresh() {
    this.refreshData();
  },

  async initPage() {
    wx.showLoading({ title: '加载中...', mask: true });
    try {
      const [currentUser, shopInfo] = await Promise.all([
        getUserInfo(),
        getShopInfo(),
      ]);
      
      this.setData({ currentUser, shopInfo });
      
      // 加载初始数据
      await this.loadTabData();
    } catch (error) {
      console.error('初始化失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error',
      });
    } finally {
      this.setData({ loading: false });
      wx.hideLoading();
    }
  },

  async refreshData() {
    this.setData({ refreshing: true });
    try {
      await this.loadTabData();
      wx.showToast({ title: '刷新成功' });
    } catch (error) {
      console.error('刷新失败:', error);
      wx.showToast({
        title: '刷新失败',
        icon: 'error',
      });
    } finally {
      this.setData({ refreshing: false });
      wx.stopPullDownRefresh();
    }
  },

  async loadTabData() {
    const { shopInfo, activeTab } = this.data;
    if (!shopInfo) return;
    
    try {
      if (activeTab === 'tech' || activeTab === 'admins') {
        const members = await getShopMembers(shopInfo.id);
        this.setData({
          techList: members.filter(m => m.kind === 'tech'),
          adminList: members.filter(m => m.kind === 'manager'),
        });
      } else if (activeTab === 'applications') {
        const applications = await getJoins(shopInfo.id);
        this.setData({
          applications,
          filteredApplications: applications.filter(app => app.status === 'pending'),
        });
      }
    } catch (error) {
      console.error(`加载${this.getTabTitle(activeTab)}失败:`, error);
      throw error;
    }
  },

  // 切换Tab
  switchTab(e: WechatMiniprogram.TouchEvent) {
    const { tab } = e.currentTarget.dataset;
    if (this.data.activeTab === tab) return;
    
    this.setData({ activeTab: tab as TabKey }, () => {
      this.loadTabData();
    });
  },

  // 处理申请
  async handleApplication(e: WechatMiniprogram.TouchEvent) {
    const { action, applicationId } = e.currentTarget.dataset;
    const { shopInfo } = this.data;
    
    if (!shopInfo) return;
    
    try {
      wx.showLoading({ title: '处理中...', mask: true });
      
      await putJoin(applicationId,action);
      
      // 刷新数据
      await this.loadTabData();
      
      wx.showToast({
        title: action === 'approve' ? '已通过申请' : '已拒绝申请',
      });
    } catch (error) {
      console.error('处理申请失败:', error);
      wx.showToast({
        title: '处理失败',
        icon: 'error',
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 移除成员
  async removeMember(e: WechatMiniprogram.TouchEvent) {
    const { userId, role } = e.currentTarget.dataset;
    const { shopInfo, currentUser } = this.data;
    
    if (!shopInfo || !currentUser) return;
    
    // 权限检查
    if (currentUser.kind === 'manager' && role === 'manager') {
      wx.showToast({
        title: '无权移除其他管理员',
        icon: 'error',
      });
      return;
    }
    
    try {
      wx.showLoading({ title: '移除中...', mask: true });
      
      await removeShopMember( userId);
      
      // 刷新数据
      await this.loadTabData();
      
      wx.showToast({ title: '移除成功' });
    } catch (error) {
      console.error('移除成员失败:', error);
      wx.showToast({
        title: '移除失败',
        icon: 'error',
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 辅助方法
  getTabTitle(tab: TabKey): string {
    const tabObj = this.data.tabs.find(t => t.key === tab);
    return tabObj ? tabObj.title : '';
  },
});