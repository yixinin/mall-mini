import { request } from '../utils/request'

const getLesseeURL = () => {
  const lessee = wx.getStorageSync("lessee") || 0;
  return 'https://mini.iakl.top/api/v1/mini/lessee/' + lessee.toString();
}


const getLesseeMembersURL = () => {
  const lessee = wx.getStorageSync("lessee") || 0;
  return 'https://mini.iakl.top/api/v1/mini/lessee/' + lessee.toString() + '/tech';
}

const getLesseeManagerURL = () => {
  const lessee = wx.getStorageSync("lessee") || 0;
  return 'https://mini.iakl.top/api/v1/mini/lessee/' + lessee.toString() + '/manager';
}
const getJoinsURL = () => {
  return 'https://mini.iakl.top/api/v1/mini/join';
}

const getJoinURL = (id: number) => {
  return 'https://mini.iakl.top/api/v1/mini/join/' + id.toString();
}
export const getShopInfo = async (): Promise<Lessee> => {
  const ack = await request<Ack<Lessee>>({
    url: getLesseeURL(),
    method: 'GET',
  });

  if (ack.code !== 0) {
    throw new Error(ack.msg);
  }

  return ack.data;
};

/**
 * 获取店铺成员列表
 * @param shopId 店铺ID
 */
export const getShopMembers = async (shopId: number): Promise<UserInfo[]> => {
  const ack = await request<Ack<UserInfo[]>>({
    url: getLesseeMembersURL(),
    method: 'GET',
  });

  if (ack.code !== 0) {
    throw new Error(ack.msg);
  }

  return ack.data;
};

/**
 * 更新店铺信息
 * @param shopId 店铺ID
 * @param data 更新数据
 */
export const updateShopInfo = async (
  shopId: string,
  data: UpdateLessee
): Promise<Lessee> => {
  const res = await request<Ack<Lessee>>({
    url: getLesseeURL(),
    method: 'POST',
    data: { shopId, ...data },
  });

  if (res.code !== 0) {
    throw new Error(res.msg);
  }

  return res.data;
};

/**
 * 添加店铺成员
 * @param data 成员信息
 */
export const addShopMember = async (userId: number): Promise<number> => {
  const res = await request<Ack<number>>({
    url: getLesseeMembersURL(),
    method: 'PUT',
    data: { "add": [userId] },
  });

  if (res.code !== 0) {
    throw new Error(res.msg);
  }

  return res.data;
};

/**
 * 移除店铺成员
 * @param shopId 店铺ID
 * @param userId 用户ID
 */
export const removeShopMember = async (userId: number): Promise<void> => {
  const res = await request<Ack<void>>({
    url: getLesseeMembersURL(),
    method: 'PUT',
    data: { "del": [userId] },
  });

  if (res.code !== 0) {
    throw new Error(res.msg);
  }
};

export const addShopManager = async (userId: number): Promise<number> => {
  const res = await request<Ack<number>>({
    url: getLesseeManagerURL(),
    method: 'PUT',
    data: { "add": [userId] },
  });

  if (res.code !== 0) {
    throw new Error(res.msg);
  }

  return res.data;
};
export const removeShopManager = async (userId: number): Promise<void> => {
  const res = await request<Ack<number>>({
    url: getLesseeManagerURL(),
    method: 'PUT',
    data: { "del": [userId] },
  });

  if (res.code !== 0) {
    throw new Error(res.msg);
  }
};

export const getJoins = async (lessee: number): Promise<Join[]> => {
  const res = await request<Ack<Join[]>>({
    url: getJoinsURL(),
    method: 'GET',
  });

  if (res.code !== 0) {
    throw new Error(res.msg);
  }
  return res.data;
}

export const putJoin = async (id: number, status: string): Promise<number> => {
  const res = await request<Ack<number>>({
    url: getJoinURL(id),
    method: 'PUT',
    data: {
      "status": status,
    }
  });

  if (res.code !== 0) {
    throw new Error(res.msg);
  }
  return res.data
}