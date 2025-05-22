type LesseeStatus = 'enabled' | 'disabled';
type Lessee = {
  id: number,
  name: string,
  admins: number[],
  techs: number[],
  status: LesseeStatus ,
  create_time: Date,
  update_time: Date,
}

type LesseeUser = {
  admins: UserInfo[],
  techs: UserInfo[],
}

type UpdateLessee = {
  name: string,
  status: LesseeStatus ,
}

type Join ={
  id: number,
  user: SimpleUser,
  lessee: IdName,
  status: string,
  create_time: Date,
  update_time: Date,
}

type SimpleUser = {
  id: number,
  nickname: string,
}
type IdName = {
  id: number,
  name: string,
}