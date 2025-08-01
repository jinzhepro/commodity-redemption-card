import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import RedeemCode from "@/models/RedeemCode";
import Order from "@/models/Order";

/**
 * 删除指定兑换码
 * @param {NextRequest} request - 请求对象
 * @param {Object} context - 上下文对象
 * @param {Object} context.params - 路由参数
 * @param {string} context.params.id - 兑换码ID
 * @returns {Promise<NextResponse>} 响应对象
 */
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "兑换码ID不能为空" },
        { status: 400 }
      );
    }

    // 查找兑换码
    const redeemCode = await RedeemCode.findById(id);
    if (!redeemCode) {
      return NextResponse.json({ error: "兑换码不存在" }, { status: 404 });
    }

    // 如果兑换码已使用，需要同时删除相关的订单
    if (redeemCode.isUsed) {
      await Order.deleteMany({ redeemCodeId: id });
    }

    // 删除兑换码
    await RedeemCode.findByIdAndDelete(id);

    // 更新商品的兑换码统计
    const product = await Product.findById(redeemCode.productId);
    if (product) {
      const updateData = {
        "redeemCodeCount.count": Math.max(0, product.redeemCodeCount.count - 1),
      };

      // 如果删除的是未使用的兑换码，减少剩余数量
      if (!redeemCode.isUsed) {
        updateData["redeemCodeCount.remaining"] = Math.max(0, product.redeemCodeCount.remaining - 1);
      } else {
        // 如果删除的是已使用的兑换码，减少已使用数量
        updateData["redeemCodeCount.used"] = Math.max(0, product.redeemCodeCount.used - 1);
      }

      await Product.findByIdAndUpdate(redeemCode.productId, {
        $set: updateData,
      });
    }

    return NextResponse.json({ message: "兑换码删除成功" });
  } catch (error) {
    console.error("删除兑换码失败:", error);
    return NextResponse.json({ error: "删除兑换码失败" }, { status: 500 });
  }
}