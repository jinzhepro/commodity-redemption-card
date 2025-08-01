import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

/**
 * 更新商品兑换码统计
 * @param {NextRequest} request - 请求对象
 * @returns {Promise<NextResponse>} 响应对象
 */
export async function PUT(request) {
  try {
    await connectDB();

    const { productId, count, used, remaining } = await request.json();

    // 验证必需参数
    if (!productId) {
      return NextResponse.json(
        { error: "商品ID不能为空" },
        { status: 400 }
      );
    }

    if (count === undefined || used === undefined || remaining === undefined) {
      return NextResponse.json(
        { error: "兑换码统计数据不完整" },
        { status: 400 }
      );
    }

    // 验证数据合理性
    if (count < 0 || used < 0 || remaining < 0) {
      return NextResponse.json(
        { error: "兑换码统计数据不能为负数" },
        { status: 400 }
      );
    }

    if (used + remaining !== count) {
      return NextResponse.json(
        { error: "已使用数量 + 剩余数量必须等于总数量" },
        { status: 400 }
      );
    }

    // 查找并更新商品
    const product = await Product.findByIdAndUpdate(
      productId,
      {
        $set: {
          "redeemCodeCount.count": count,
          "redeemCodeCount.used": used,
          "redeemCodeCount.remaining": remaining,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return NextResponse.json(
        { error: "商品不存在" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "兑换码统计更新成功",
      product: product.toObject(),
    });
  } catch (error) {
    console.error("更新兑换码统计失败:", error);
    return NextResponse.json(
      { error: "更新兑换码统计失败" },
      { status: 500 }
    );
  }
}