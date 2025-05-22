export const domain = 'https://mini.iakl.top/api/v1/mini'

export const request = <T>(options: WechatMiniprogram.RequestOption): Promise<T> => {
  if (!options.header) {
    options.header = {}
  }

  options.header['Authorization'] = wx.getStorageSync('token');
  options.header['lessee'] = wx.getStorageSync('lessee')

  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      success: (res) => {
        console.log(options.method, "url", options.url);
        console.log("res", res);
        if (statusOk(res.statusCode)) {
          if (res.data) {
            const ack = res.data as Ack<T>;
            if (ack.code === 0) {
              resolve(ack.data);
              return
            }
            reject(`code: ${ack.code}, msg: ${ack.msg}`);
            return
          }
          reject("http status ok, but no response");
          return
        } else {
          reject(`error with http code: ${res.statusCode}`);
          return
        }
      },
      fail: (res) => {
        console.log("http request err", res);

        reject(res.errMsg);
      },
    });
  });
};

export const get = <T>(path: string): Promise<T> => {
  return request<T>({
    method: 'GET',
    url: `${domain}${path}`,
  });
}

export const post_json = <T>(path: string, data: any): Promise<T> => {
  return request<T>({
    url: `${domain}${path}`,
    data: data,
    method: 'POST'
  });
}

export const post_form = <T>(path: string, data: any): Promise<T> => {
  return request<T>({
    url: `${domain}${path}`,
    header: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    data: data,
    method: 'POST'
  });
}

export const put_json = <T>(path: string, data: any): Promise<T> => {
  return request<T>({
    url: `${domain}${path}`,
    data: data,
    method: 'PUT'
  });
}

export const del = <T>(path: string): Promise<T> => {
  return request<T>({
    url: `${domain}${path}`,
    method: 'DELETE'
  });
}

export const put_form = <T>(path: string, data: any): Promise<T> => {
  return request<T>({
    url: `${domain}${path}`,
    data: data,
    method: 'PUT',
    header: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  });
}

export const head = (path: string): Record<string, any> => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${domain}${path}`,
      method: 'HEAD',
      header: {
        'Authorization': wx.getStorageSync('token'),
        'lessee': wx.getStorageSync('lessee')
      },
      success: (res) => {
        if (statusOk(res.statusCode)) {
          resolve(res.header)
          return
        } else {
          if (res.data) {
            const ack = res.data as Ack<string>;
            reject(`code: ${ack.code}, msg: ${ack.msg}`);
            return
          }
          reject(`error with http code: ${res.statusCode}`);
          return
        }
      },
      fail: (res) => {
        reject(res.errMsg);
      },
    });
  });
};

const statusOk = (code: number) => {
  return (code >= 200 && code < 300)
}