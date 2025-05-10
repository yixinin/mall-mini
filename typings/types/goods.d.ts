
type GoodsItem = {
  id: number;
  avatar: string; // 主图链接
  name: string;      // 名称
  tags: string[];    // 多个标签
  sales: number;     // 销量
  price: number;     // 原价
  discount: number;  // 折扣 (0-1)
  final_price: number; // 折后价 (计算属性)
}

type CartGoodsItem = {
  info: GoodsItem, // 商品信息
  quantity: number, // 数量
}

type OrderGoods = {
  id : number,
  count: number,
}