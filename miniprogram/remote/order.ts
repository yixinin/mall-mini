import { request } from '../utils/request'

const getOrderURL = (id: number) => {
  return 'https://mini.iakl.top/api/v1/mini/order/'+ id.toString();
}

export const updateOrder = async (id:number,data:any): Promise<number> => {
  const res = await request<Ack<number>>({
    url: getOrderURL(id),
    method: 'PUT',
    data: data,
  })
  if (res.code == 0) {
    return res.data;
  }
  throw new Error(res.msg);
}