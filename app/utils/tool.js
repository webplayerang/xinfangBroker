
export function urlByAppendingParams(url, params) {
  let result = url;
  if (result.substr(result.length - 1) !== '?') {
    result += '?';
  }

  for (const key in params) {
    const value = params[key];
    result += `${encodeURIComponent(key)}=${encodeURIComponent(value)}&`;
  }

  result = result.substring(0, result.length - 1);
  return result;
}

export function toThousands(x) {
  const num = `${x || 0}`;
  const tmp = num.split('.');
  let integer = tmp[0];
  const decimal = tmp[1];
  let result = '';

  if (integer.length > 3) {
    while (integer.length > 3) {
      result = `,${integer.slice(-3)}${result}`;
      integer = integer.slice(0, integer.length - 3);
    }

    result = integer + result;
    if (decimal) {
      result = `${result}.${decimal}`;
    }
  } else {
    return num;
  }

  return result;
}

export function getNowFormatDate() {
  const date = new Date();
  const seperator = '-';
  let month = date.getMonth() + 1;
  let strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = `0${month}`;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = `0${strDate}`;
  }
  const currentdate = date.getFullYear() + seperator + month + seperator + strDate;
  return currentdate;
}

export function getDaysInOneMonth(flag) {
  let now = getNowFormatDate();
  let dateArr = now.split('-');
  let month = parseInt(dateArr[1], 10);
  var d = new Date(dateArr[0], month, 0);

  if (flag === 'min') {
    return dateArr[0] + '-' + dateArr[1] + '-' + '01';
  } else {
    let day = d.getDate();
    if (day >= 0 && day <= 9) {
      day = `0${day}`;
    }
    return dateArr[0] + '-' + dateArr[1] + '-' + day;
  }
}
