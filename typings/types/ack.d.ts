type Ack<T> = {
  code: number,
  msg: string,
  data: T,
}
type Image = {
  id: number,
  path: string,
}