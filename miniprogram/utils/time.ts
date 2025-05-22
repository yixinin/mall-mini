
export const timeRanges = () =>{
  return [
    "9:00 - 12:00",
    "12:00 - 15:00",
    "15:00 - 18:00",
  ]
}

export const getMinDate = ()=>{
  const today = new Date();
  const tomorrow = new Date(today.setDate(today.getDate() + 1));
  const year= tomorrow.getFullYear();
  const month = (tomorrow.getMonth()+1);
  var monthStr= month.toString()
  if (month<10){
    monthStr = '0'+monthStr;
  }
  const day = tomorrow.getDate();
  return `${year}-${monthStr}-${day}`;
}