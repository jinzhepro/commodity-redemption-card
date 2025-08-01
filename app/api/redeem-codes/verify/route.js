import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RedeemCode from '@/models/RedeemCode';

/**
 * 验证兑换码
 * @param {NextRequest} request - 请求对象
 * @returns {Promise<NextResponse>} 响应对象
 */
export async function POST(request) {
  try {
    await connectDB();
    
    const { cardNumber, password } = await request.json();
    
    if (!cardNumber || !password) {
      return NextResponse.json(
        { error: '卡号和密码不能为空' },
        { status: 400 }
      );
    }

    // 查找兑换码
    const redeemCode = await RedeemCode.findOne({ cardNumber })
      .populate('productId', 'name price images description isActive');
    
    if (!redeemCode) {
      return NextResponse.json(
        { error: '兑换码不存在' },
        { status: 404 }
      );
    }

    // 验证密码
    if (redeemCode.password !== password) {
      return NextResponse.json(
        { error: '密码错误' },
        { status: 400 }
      );
    }

    // 检查是否已使用
    if (redeemCode.isUsed) {
      return NextResponse.json(
        { 
          error: '兑换码已使用',
          usedAt: redeemCode.usedAt,
          orderId: redeemCode.orderId
        },
        { status: 400 }
      );
    }

    // 检查关联商品是否有效
    if (!redeemCode.productId || !redeemCode.productId.isActive) {
      return NextResponse.json(
        { error: '关联商品已停用' },
        { status: 400 }
      );
    }

    // 返回商品信息供前端显示
    const productInfo = {
      _id: redeemCode.productId._id,
      name: redeemCode.productName || redeemCode.productId.name,
      price: redeemCode.productPrice || redeemCode.productId.price,
      images: redeemCode.productImages || redeemCode.productId.images || [],
      description: redeemCode.productId.description || '',
      // 保留兑换码信息用于后续订单创建
      redeemCodeId: redeemCode._id,
      cardNumber: redeemCode.cardNumber,
    };

    return NextResponse.json(productInfo);
  } catch (error) {
    console.error('验证兑换码失败:', error);
    return NextResponse.json(
      { error: '验证兑换码失败' },
      { status: 500 }
    );
  }
}