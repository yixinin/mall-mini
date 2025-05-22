import { del, get, head, put_json } from '../utils/request'

export const getCurrentUserInfo = async (): Promise<UserInfo> => {
  const localUser = wx.getStorageSync("userInfo") || null;
  if (localUser) {
    const header = await head('/user/info');
    if (header) {
      if (header['x-up'] === localUser.update_time) {
        return localUser
      }
    }
  }
  const user: UserInfo = await get('/user/info')
  wx.setStorageSync('userInfo', user)
  return user;
};

export const updateUserKind = async (id: number, kind: string): Promise<string> => {
  const url = `user/${id}`
  const user: UserInfo = await put_json(url, { 'kind': kind });
  return user.kind
}

export const deleteUser = async (id: number): Promise<boolean> => {
  const res: number = await del(`user/${id}`)
  return res == id
}

export const getUserList = async () => {
  const users: UserInfo[] = await get("/user");
  return users;
}