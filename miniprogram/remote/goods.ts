import { request } from '../utils/request'

const getGoodsURL = (id: number) => {
  if (id > 0) {
    return 'https://mini.iakl.top/api/v1/mini/goods/' + id.toString();
  }
  return 'https://mini.iakl.top/api/v1/mini/goods';
}

export const addGoods = async (data: AddGoods): Promise<number> => {
  const res = await request<Ack<number>>({
    url: getGoodsURL(0),
    method: 'POST',
    data: data,
  })
  if (res.code == 0) {
    return res.data;
  }
  throw new Error(res.msg);
}


export const updateGoods = async (id: number, data: UpdateGoods): Promise<number> => {
  const res = await request<Ack<number>>({
    url: getGoodsURL(id),
    method: 'PUT',
    data: data,
  })
  if (res.code == 0) {
    return res.data;
  }
  throw new Error(res.msg);
}
