import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

/**
 * 删除指定商品
 * @param {NextRequest} request - 请求对象
 * @param {Object} context - 上下文对象
 * @param {Object} context.params - 路由参数
 * @param {string} context.params.id - 商品ID
 * @returns {Promise<NextResponse>} 响应对象
 */
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "商品ID不能为空" }, { status: 400 });
    }

    // 查找并删除商品
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json({ error: "商品不存在" }, { status: 404 });
    }

    return NextResponse.json({
      message: "商品删除成功",
      deletedProduct: {
        _id: deletedProduct._id,
        name: deletedProduct.name,
        cardNumber: deletedProduct.cardNumber,
      },
    });
  } catch (error) {
    console.error("删除商品失败:", error);
    return NextResponse.json({ error: "删除商品失败" }, { status: 500 });
  }
}

/**
 * 获取指定商品详情
 * @param {NextRequest} request - 请求对象
 * @param {Object} context - 上下文对象
 * @param {Object} context.params - 路由参数
 * @param {string} context.params.id - 商品ID
 * @returns {Promise<NextResponse>} 响应对象
 */
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "商品ID不能为空" }, { status: 400 });
    }

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: "商品不存在" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("获取商品详情失败:", error);
    return NextResponse.json({ error: "获取商品详情失败" }, { status: 500 });
  }
}