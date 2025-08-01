import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

/**
 * 修复数据库索引问题
 * @returns {Promise<NextResponse>} 响应对象
 */
export async function POST() {
  try {
    await connectDB();

    const db = mongoose.connection.db;
    
    // 获取商品集合
    const productsCollection = db.collection('products');
    
    // 获取当前索引
    const indexes = await productsCollection.indexes();
    console.log('当前商品集合索引:', indexes);
    
    // 检查是否存在 cardNumber_1 索引
    const hasCardNumberIndex = indexes.some(index => index.name === 'cardNumber_1');
    
    if (hasCardNumberIndex) {
      // 删除错误的 cardNumber 索引
      await productsCollection.dropIndex('cardNumber_1');
      console.log('已删除错误的 cardNumber_1 索引');
    }
    
    // 清理可能存在的 cardNumber 字段
    const updateResult = await productsCollection.updateMany(
      { cardNumber: { $exists: true } },
      { $unset: { cardNumber: "" } }
    );
    
    console.log('清理结果:', updateResult);
    
    return NextResponse.json({
      success: true,
      message: '索引修复完成',
      details: {
        hadCardNumberIndex: hasCardNumberIndex,
        cleanedDocuments: updateResult.modifiedCount
      }
    });
    
  } catch (error) {
    console.error('修复索引失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '修复索引失败', 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}

/**
 * 获取当前索引信息
 * @returns {Promise<NextResponse>} 响应对象
 */
export async function GET() {
  try {
    await connectDB();

    const db = mongoose.connection.db;
    
    // 获取所有集合的索引信息
    const collections = ['products', 'redeemcodes', 'orders'];
    const indexInfo = {};
    
    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        const indexes = await collection.indexes();
        indexInfo[collectionName] = indexes;
      } catch (error) {
        indexInfo[collectionName] = `集合不存在或无法访问: ${error.message}`;
      }
    }
    
    return NextResponse.json({
      success: true,
      indexInfo
    });
    
  } catch (error) {
    console.error('获取索引信息失败:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '获取索引信息失败', 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}