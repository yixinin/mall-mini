import { get, head, post_json, put_json } from "../utils/request";

export const getOrderList = async () => {
  const url = '/order/pre'
  const infos: PreInfo[] = await get(url);
  const promises = infos.map(info => {
    return getLocalOrder(info.id, info.up).catch(err => {
      console.log("get goods error", err);
      return {} as Order
    });
  });
  return Promise.all(promises);
}

const getLocalOrder = async (id: number, up: string) => {
  const key = `order/${id}`;
  const localOrder: Order = wx.getStorageSync(key) || null;
  if (localOrder) {
    if (localOrder.update_time === up) {
      return localOrder
    }
  }
  const url = `/order/${id}`;
  const res: Order = await get(url);
  wx.setStorageSync(key, res);
  return res;
}

export const getOrder = async (id: number) => {
  const url = `/order/${id}`
  const key = `order/${id}`
  const localOrder: Order = wx.getStorageSync(key) || null;
  if (localOrder) {
    const headers = await head(url)
    if (headers) {
      if (headers['x-up'] === localOrder.update_time) {
        return localOrder
      }
    }
  }
  const res: Order = await get(url)
  wx.setStorageSync(key, res);
  return res;
}

export const addOrder = async (data: any): Promise<number> => {
  return post_json('/order', data);
}

export const updateOrder = async (id: number, data: any): Promise<number> => {
  return await put_json<number>(`/order/${id}`, data);
}