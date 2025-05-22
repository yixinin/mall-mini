
type GoodsItem = {
  id: number;
  avatar: string; // 主图链接
  status: string, // 商品状态
  name: string;      // 名称
  tags: string[];    // 多个标签
  price: number;     // 原价
  final_price: number; // 折后价 (计算属性)
  sold: number, // 已售数量
  discount: number,
}

type CartGoodsItem = {
  info: GoodsItem, // 商品信息
  quantity: number, // 数量
}

type OrderGoods = {
  id : number,
  count: number,
}

type UpdateGoods = {
  status: string, // 商品状态
  name: string;      // 名称
  tags: string[];    // 多个标签
  price: number;     // 原价
  final_price: number; // 折后价 (计算属性)
}

type AddGoods = {
  id: number;
  avatar: string; // 主图链接
  status: string, // 商品状态
  name: string;      // 名称
  tags: string[];    // 多个标签
  price: number;     // 原价
  final_price: number; // 折后价 (计算属性)
}