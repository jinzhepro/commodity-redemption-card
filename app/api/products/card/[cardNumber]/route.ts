import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

/**
 * 根据卡号获取商品信息
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { cardNumber: string } }
) {
  try {
    await connectDB();

    const { cardNumber } = params;

    if (!cardNumber) {
      return NextResponse.json({ error: "卡号不能为空" }, { status: 400 });
    }

    const product = await Product.findOne({ cardNumber });

    if (!product) {
      return NextResponse.json({ error: "卡号不存在" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("获取商品信息失败:", error);
    return NextResponse.json({ error: "获取商品信息失败" }, { status: 500 });
  }
}
