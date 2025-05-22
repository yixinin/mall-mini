type Order = {
  id : number,
  status : string ,
  total_price: number,
  update_time: string,
  create_time: string,
  user : OrderUserInfo,
  reverse: OrderReverseInfo,
  goods: OrderGoodsInfo[],
}
type OrderUserInfo = {
  id : number,
  nickname: string,
}
type OrderReverseInfo = {
  address :string ,
  phone: string,
  time: string,
  remark: string,
}
type OrderGoodsInfo = {
  id : number,
  name: string,
  price: number,
  count: number,
}