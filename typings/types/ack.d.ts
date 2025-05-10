type Ack<T> = {
  code: number,
  msg: string,
  data: T,
}