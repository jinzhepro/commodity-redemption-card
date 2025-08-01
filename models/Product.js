import mongoose, { Schema } from "mongoose";

/**
 * 商品Schema定义
 */
const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "商品名称不能为空"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "商品价格不能为空"],
      min: [0, "价格不能为负数"],
    },
    images: {
      type: [String],
      required: [true, "商品图片不能为空"],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "至少需要一张商品图片",
      },
    },
    description: {
      type: String,
      default: "",
    },
    redeemCodeCount: {
      type: {
        count: {
          type: Number,
          default: 0,
        },
        used: {
          type: Number,
          default: 0,
        },
        remaining: {
          type: Number,
          default: 0,
        },
      },
      default: {
        count: 0,
        used: 0,
        remaining: 0,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);