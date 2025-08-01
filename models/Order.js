import mongoose, { Schema } from "mongoose";

/**
 * 订单Schema定义
 */
const OrderSchema = new Schema(
  {
    orderId: {
      type: String,
      required: [true, "订单号不能为空"],
      unique: true,
      index: true,
    },
    cardNumber: {
      type: String,
      required: [true, "卡号不能为空"],
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "商品ID不能为空"],
      index: true,
    },
    productName: {
      type: String,
      required: [true, "商品名称不能为空"],
    },
    productPrice: {
      type: Number,
      required: [true, "商品价格不能为空"],
    },
    redeemCodeId: {
      type: Schema.Types.ObjectId,
      ref: "RedeemCode",
      required: [true, "兑换码ID不能为空"],
      index: true,
    },
    customerName: {
      type: String,
      required: [true, "客户姓名不能为空"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "手机号不能为空"],
      index: true,
    },
    address: {
      type: String,
      required: [true, "地址不能为空"],
    },
    trackingNumber: {
      type: String,
      default: "",
    },
    expressCompany: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// 创建复合索引用于查询
OrderSchema.index({ cardNumber: 1, phone: 1 });
OrderSchema.index({ productId: 1, status: 1 });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);