import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import RedeemCode from "@/models/RedeemCode";
import Product from "@/models/Product";
import { nanoid } from "nanoid";

/**
 * 创建订单
 * @param {NextRequest} request - 请求对象
 * @returns {Promise<NextResponse>} 响应对象
 */
export async function POST(request) {
  try {
    await connectDB();

    const { cardNumber, password, customerName, phone, address } =
      await request.json();

    if (!cardNumber || !password || !customerName || !phone || !address) {
      return NextResponse.json(
        { error: "所有字段都不能为空" },
        { status: 400 }
      );
    }

    // 检查兑换码是否存在且未使用
    const redeemCode = await RedeemCode.findOne({ cardNumber }).populate(
      "productId",
      "name price images isActive"
    );

    if (!redeemCode) {
      return NextResponse.json({ error: "兑换码不存在" }, { status: 404 });
    }

    // 验证密码
    if (redeemCode.password !== password) {
      return NextResponse.json({ error: "密码错误" }, { status: 400 });
    }

    if (redeemCode.isUsed) {
      return NextResponse.json({ error: "该兑换码已被使用" }, { status: 400 });
    }

    // 检查关联商品是否有效
    if (!redeemCode.productId || !redeemCode.productId.isActive) {
      return NextResponse.json({ error: "关联商品已停用" }, { status: 400 });
    }

    // 生成订单ID和物流单号
    const orderId = nanoid(12);

    // 创建订单
    const order = new Order({
      orderId,
      cardNumber,
      productId: redeemCode.productId._id,
      productName: redeemCode.productName,
      productPrice: redeemCode.productPrice,
      customerName,
      phone,
      address,
      redeemCodeId: redeemCode._id,
      status: "pending",
    });

    await order.save();

    // 标记兑换码为已使用
    redeemCode.isUsed = true;
    redeemCode.usedAt = new Date();
    redeemCode.orderId = orderId;
    await redeemCode.save();

    // 更新商品兑换码统计
    try {
      const productId = redeemCode.productId._id;

      await Product.findByIdAndUpdate(productId, {
        $inc: {
          "redeemCodeCount.remaining": -1,
          "redeemCodeCount.used": 1,
        },
      });
    } catch (updateError) {
      console.error("更新商品兑换码统计失败:", updateError);
      // 不影响主要流程，只记录错误
    }

    return NextResponse.json({
      message: "订单创建成功",
      order: {
        orderId: order.orderId,
        cardNumber: order.cardNumber,
        productName: order.productName,
        productPrice: order.productPrice,
        customerName: order.customerName,
        phone: order.phone,
        address: order.address,
        trackingNumber: order.trackingNumber,
        status: order.status,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error("创建订单失败:", error);
    return NextResponse.json({ error: "创建订单失败" }, { status: 500 });
  }
}

/**
 * 获取所有订单（后台管理用）
 * @returns {Promise<NextResponse>} 响应对象
 */
export async function GET() {
  try {
    await connectDB();

    const orders = await Order.find({}).sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("获取订单列表失败:", error);
    return NextResponse.json({ error: "获取订单列表失败" }, { status: 500 });
  }
}