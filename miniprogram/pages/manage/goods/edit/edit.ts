import { addGoods, getGoods, updateGoods } from '../../../../service/goods';
Page({
  data: {
    domain: 'https://mini.iakl.top',
    goodsId: 0,
    isEdit: false,
    tagInput: '',
    formData: {
      avatar: '',
      status: 'active',
      name: '',
      tags: [] as string[],
      price: 0,
      final_price: 0
    } as AddGoods
  },

  onLoad(options: { id?: string }) {
    if (options.id) {
      this.setData({
        goodsId: parseInt(options.id),
        isEdit: true
      });
      this.loadGoodsDetail(parseInt(options.id));
    } else {
      const id = wx.getStorageSync('add/goods/id') || 0;
      const avatar = wx.getStorageSync('add/goods/avatar') || '';
      this.setData({
        goodsId: id,
        'formData.avatar': avatar,
      })
    }
  },

  // 加载商品详情
  async loadGoodsDetail(goodsId: number) {
    wx.showLoading({ title: '加载中...' });
    try {
      const goods = await getGoods(goodsId);
      this.setData({
        formData: {
          ...goods,
        }
      });
    } catch (error) {
      wx.showToast({ title: '加载失败', icon: 'none' });
      console.error('加载商品详情失败:', error);
    } finally {
      wx.hideLoading();
    }
  },

  // 选择图片
  chooseImage() {
    var uploadURL = 'https://mini.iakl.top/api/v1/mini/image'
    var updated = false;
    if (this.data.goodsId > 0) {
      updated = true;
      uploadURL = uploadURL + '/' + this.data.goodsId.toString();
    }
    const out =  this;
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        wx.uploadFile({
          url: uploadURL,
          filePath: res.tempFilePaths[0],
          name: 'avatar',
          success: (res) => {
            console.log(res);
            if (res.statusCode == 200) {
              const ack: Ack<Image> = JSON.parse(res.data);
              out.setData({
                goodsId: ack.data.id,
                'formData.avatar': ack.data.path,
              });
              if (!updated) {
                wx.setStorageSync('add/goods/id', ack.data.id);
                wx.setStorageSync('add/goods/avatar', ack.data.path);
              }
            }
          }
        });

      }
    });
  },

  // 表单字段变化
  onFieldChange(e: WechatMiniprogram.Input) {
    const field = e.currentTarget.dataset.field;
    console.log(field, e.detail.value);

    this.setData({
      [`formData.${field}`]: e.detail.value
    });
  },
  onFieldNumberChange(e: WechatMiniprogram.Input) {
    const field = e.currentTarget.dataset.field;
    console.log(field, e.detail.value);

    this.setData({
      [`formData.${field}`]: Number.parseInt(e.detail.value)
    });
  },
  // 状态变化
  onStatusChange(e: any) {
    console.log(e.detail.value);

    this.setData({
      'formData.status': e.detail.value
    });
  },

  // 标签输入
  onTagInput(e: WechatMiniprogram.Input) {
    this.setData({
      tagInput: e.detail.value
    });
  },

  // 添加标签
  addTag() {
    const tag = this.data.tagInput.trim();
    if (!tag) return;

    if (this.data.formData.tags.includes(tag)) {
      wx.showToast({ title: '标签已存在', icon: 'none' });
      return;
    }

    this.setData({
      'formData.tags': [...this.data.formData.tags, tag],
      tagInput: ''
    });
  },

  // 删除标签
  removeTag(e: WechatMiniprogram.TouchEvent) {
    const index = e.currentTarget.dataset.index;
    const tags = [...this.data.formData.tags];
    tags.splice(index, 1);

    this.setData({
      'formData.tags': tags
    });
  },

  // 提交表单
  async submitForm() {
    const { formData, isEdit, goodsId } = this.data;

    if (!formData.name) {
      wx.showToast({ title: '请输入商品名称', icon: 'none' });
      return;
    }

    if (formData.price <= 0 || formData.final_price < 0 || formData.final_price > formData.price) {
      console.log(formData);

      wx.showToast({ title: '请输入有效价格', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '提交中...' });
    try {
      if (isEdit) {
        await this.updateGoods(goodsId, formData);
      } else {
        await this.createGoods(formData);
      }

      wx.showToast({
        title: `${isEdit ? '更新' : '添加'}成功`,
        icon: 'success',
        complete: () => {
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        }
      });
    } catch (error) {
      wx.showToast({ title: '提交失败', icon: 'none' });
      console.error('提交表单失败:', error);
    } finally {
      wx.hideLoading();
    }
  },

  // 模拟创建商品API
  async createGoods(data: AddGoods) {
    if (this.data.goodsId == 0) {
      wx.showToast({
        title: "请先上传商品主图",
        icon: "error",
      })
      return
    }
    const add = {
      id: this.data.goodsId,
      name: data.name,
      avatar: data.avatar,
      status: data.status,
      price: data.price,
      final_price: data.final_price,
      tags: data.tags,
    } as AddGoods;
    const id = await addGoods(add);
    if (id == this.data.goodsId) {
      wx.removeStorageSync('add/goods/id')
      wx.removeStorageSync('add/goods/avatar')
      this.navigateBack();
    } else {
      wx.showToast({
        title: '添加失败，请稍后再试',
        icon: 'none',
      })
    }
  },

  async updateGoods(goodsId: number, data: AddGoods) {
    const update = {
      name: data.name,
      status: data.status,
      tags: data.tags,
      price: data.price,
      final_price: data.final_price,
    } as UpdateGoods;
    const id = await updateGoods(goodsId, update);
    if (id == goodsId) {
      this.navigateBack();
    } else {
      wx.showToast({
        title: '更新失败，请稍后再试',
        icon: 'none',
      })
    }
  },

  // 返回
  navigateBack() {
    wx.navigateBack();
  }
});