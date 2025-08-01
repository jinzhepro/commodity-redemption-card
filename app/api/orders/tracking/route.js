import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

/**
 * 查询物流信息
 * @param {NextRequest} request - 请求对象
 * @returns {Promise<NextResponse>} 响应对象
 */
export async function POST(request) {
  try {
    await connectDB();

    const { cardNumber, phone } = await request.json();

    if (!cardNumber || !phone) {
      return NextResponse.json(
        { error: "卡号和手机号不能为空" },
        { status: 400 }
      );
    }

    const orders = await Order.find({
      cardNumber,
      phone,
      trackingNumber: { $exists: true, $ne: "" },
    }).sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("查询物流信息失败:", error);
    return NextResponse.json({ error: "查询物流信息失败" }, { status: 500 });
  }
}