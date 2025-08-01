import mongoose, { Schema } from 'mongoose';

/**
 * 兑换码Schema定义
 */
const RedeemCodeSchema = new Schema({
  cardNumber: {
    type: String,
    required: [true, '卡号不能为空'],
    unique: true,
    index: true,
  },
  password: {
    type: String,
    required: [true, '密码不能为空'],
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, '商品ID不能为空'],
    index: true,
  },
  productName: {
    type: String,
    required: [true, '商品名称不能为空'],
  },
  productPrice: {
    type: Number,
    required: [true, '商品价格不能为空'],
  },
  productImages: {
    type: [String],
    required: [true, '商品图片不能为空'],
  },
  isUsed: {
    type: Boolean,
    default: false,
    index: true,
  },
  usedAt: {
    type: Date,
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
  },
}, {
  timestamps: true,
});

// 创建复合索引
RedeemCodeSchema.index({ cardNumber: 1, password: 1 });
RedeemCodeSchema.index({ productId: 1, isUsed: 1 });

export default mongoose.models.RedeemCode || mongoose.model('RedeemCode', RedeemCodeSchema);