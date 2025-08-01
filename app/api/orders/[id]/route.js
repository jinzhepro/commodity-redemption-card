import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

/**
 * 更新订单信息
 * @param {NextRequest} request - 请求对象
 * @param {Object} context - 上下文对象
 * @param {Object} context.params - 路由参数
 * @param {string} context.params.id - 订单ID
 * @returns {Promise<NextResponse>} 响应对象
 */
export async function PATCH(request, { params }) {
  try {
    await connectDB();
    
    const { id } = params;
    const updateData = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: '订单ID不能为空' },
        { status: 400 }
      );
    }

    const order = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!order) {
      return NextResponse.json(
        { error: '订单不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('更新订单失败:', error);
    return NextResponse.json(
      { error: '更新订单失败' },
      { status: 500 }
    );
  }
}