import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

/**
 * 验证卡号和密码
 * @param {NextRequest} request - 请求对象
 * @returns {Promise<NextResponse>} 响应对象
 */
export async function POST(request) {
  try {
    await connectDB();

    const { cardNumber, password } = await request.json();

    if (!cardNumber || !password) {
      return NextResponse.json(
        { error: "卡号和密码不能为空" },
        { status: 400 }
      );
    }

    // 查找商品
    const product = await Product.findOne({ cardNumber });

    if (!product) {
      return NextResponse.json({ error: "卡号不存在" }, { status: 404 });
    }

    // 验证密码（明文比较）
    if (password !== product.password) {
      return NextResponse.json({ error: "密码错误" }, { status: 401 });
    }

    // 检查是否已使用
    if (product.isUsed) {
      return NextResponse.json({ error: "该卡号已被使用" }, { status: 400 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("验证卡号失败:", error);
    return NextResponse.json({ error: "验证失败" }, { status: 500 });
  }
}