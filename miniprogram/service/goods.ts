import { get, head, post_json, put_json } from "../utils/request";

export const getGoodsList = async () => {
  const url = '/goods/pre?status=active'
  const infos: PreInfo[] = await get(url);
  const promises = infos.map(info => {
    return getLocalGoods(info.id, info.up).catch(err => {
      console.log("get goods error", err);
      return {} as GoodsItem
    });
  });
  return Promise.all(promises);
}

export const getMangedGoodsList = async () => {
  const url = '/goods/manage/pre'
  const infos: PreInfo[] = await get(url);
  const promises = infos.map(info => {
    return getLocalGoods(info.id, info.up).catch(err => {
      console.log("get goods error", err);
      return {} as GoodsItem
    });
  });
  return Promise.all(promises);
}

const getLocalGoods = async (id: number, up: string) => {
  const key = `goods/${id}`;
  const localGoods: GoodsItem = wx.getStorageSync(key) || null;
  if (localGoods) {
    if (localGoods.update_time === up) {
      return localGoods
    }
  }
  const url = `/goods/${id}`
  const res: GoodsItem = await get(url)
  wx.setStorageSync(key, res);
  return res;
}

export const getGoods = async (id: number) => {
  const url = `/goods/${id}`;
  const key = `goods/${id}`;
  const localGoods: GoodsItem = wx.getStorageSync(key) || null;
  if (localGoods) {
    const headers = await head(url)
    if (headers) {
      if (headers['x-up'] === localGoods.update_time) {
        return localGoods
      }
    }
  }
  const res: GoodsItem = await get(url);
  wx.setStorageSync(key, res);
  return res;
}

export const addGoods = async (data: AddGoods): Promise<number> => {
  return await post_json('/goods', data)
}

export const updateGoods = async (id: number, data: UpdateGoods): Promise<number> => {
  return await put_json(`/goods/${id}`, data);
}