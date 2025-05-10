

type WxUserInfo = {
  nickName: string,
  avatarUrl: string,
}

type LoginRes = {
  token: string,
  openid: string,
  userinfo: UserInfo,
} 

type UserInfo = {
  id: number,
  open_id: string,
  kind: string ,
  avatar: string,
  nickname: string,
  create_time: Date,
  update_time: Date,
}

 