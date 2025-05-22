import { request } from '../utils/request'


const getUserInfoURL = () => {
  return 'https://mini.iakl.top/api/v1/mini/user/info';
}
const getUserURL = (id: number) => {
  return 'https://mini.iakl.top/api/v1/mini/user/' + id.toString();
}

export const getUserInfo = async (): Promise<UserInfo> => {
  const res = await request<Ack<UserInfo>>({
    url: getUserInfoURL(),
    method: 'GET',
  });

  if (res.code !== 0) {
    throw new Error(res.msg);
  }

  return res.data;
};

export const updateUserKind = async (id: number, kind: string): Promise<string> => {
  const res = await request<Ack<UserInfo>>({
    url: getUserURL(id),
    method: 'PUT',
    data: {
      "kind": kind,
    }
  });

  if (res.code !== 0) {
    throw new Error(res.msg);
  } 
  return res.data.kind;
}