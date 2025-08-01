import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";

/**
 * 查询订单信息
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

    const orders = await Order.find({ cardNumber, phone })
      .populate("productId", "name price images isActive")
      .sort({ createdAt: -1 });

    // 格式化返回数据
    const formattedOrders = orders.map((order) => ({
      orderId: order.orderId,
      cardNumber: order.cardNumber,
      productName: order.productName,
      productPrice: order.productPrice,
      customerName: order.customerName,
      expressCompany: order.expressCompany,
      phone: order.phone,
      address: order.address,
      trackingNumber: order.trackingNumber,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      product: order.productId
        ? {
            _id: order.productId._id,
            name: order.productId.name,
            price: order.productId.price,
            images: order.productId.images,
            isActive: order.productId.isActive,
          }
        : null,
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("查询订单失败:", error);
    return NextResponse.json({ error: "查询订单失败" }, { status: 500 });
  }
}
