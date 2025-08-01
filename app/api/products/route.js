import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

/**
 * 创建商品
 * @param {NextRequest} request - 请求对象
 * @returns {Promise<NextResponse>} 响应对象
 */
export async function POST(request) {
  try {
    await connectDB();

    const { name, price, images, description } = await request.json();

    if (
      !name ||
      !price ||
      !images ||
      !Array.isArray(images) ||
      images.length === 0
    ) {
      return NextResponse.json(
        { error: "商品名称、价格和图片不能为空，至少需要一张图片" },
        { status: 400 }
      );
    }

    const product = new Product({
      name,
      price,
      images,
      description: description || "",
      isActive: true,
      redeemCodeCount: {
        count: 0,
        used: 0,
        remaining: 0,
      },
    });

    await product.save();

    // 将MongoDB的_id转换为id字段
    const productObj = product.toObject();
    productObj.id = productObj._id;
    delete productObj._id;
    delete productObj.__v;

    return NextResponse.json(productObj);
  } catch (error) {
    console.error("创建商品失败:", error);
    return NextResponse.json({ error: "创建商品失败" }, { status: 500 });
  }
}

/**
 * 获取所有商品
 * @returns {Promise<NextResponse>} 响应对象
 */
export async function GET() {
  try {
    await connectDB();

    const products = await Product.find({}).sort({ createdAt: -1 });
    
    // 将MongoDB的_id转换为id字段
    const productsWithId = products.map(product => {
      const productObj = product.toObject();
      productObj.id = productObj._id;
      delete productObj._id;
      delete productObj.__v;
      return productObj;
    });

    return NextResponse.json(productsWithId);
  } catch (error) {
    console.error("获取商品列表失败:", error);
    return NextResponse.json({ error: "获取商品列表失败" }, { status: 500 });
  }
}

/**
 * 更新商品
 * @param {NextRequest} request - 请求对象
 * @returns {Promise<NextResponse>} 响应对象
 */
export async function PUT(request) {
  try {
    await connectDB();

    const { id, name, price, images, description, isActive } =
      await request.json();

    if (!id) {
      return NextResponse.json({ error: "商品ID不能为空" }, { status: 400 });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = price;
    if (images !== undefined) updateData.images = images;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return NextResponse.json({ error: "商品不存在" }, { status: 404 });
    }

    // 将MongoDB的_id转换为id字段
    const productObj = product.toObject();
    productObj.id = productObj._id;
    delete productObj._id;
    delete productObj.__v;

    return NextResponse.json(productObj);
  } catch (error) {
    console.error("更新商品失败:", error);
    return NextResponse.json({ error: "更新商品失败" }, { status: 500 });
  }
}

/**
 * 删除商品
 * @param {NextRequest} request - 请求对象
 * @returns {Promise<NextResponse>} 响应对象
 */
export async function DELETE(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "商品ID不能为空" }, { status: 400 });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json({ error: "商品不存在" }, { status: 404 });
    }

    return NextResponse.json({ message: "商品删除成功" });
  } catch (error) {
    console.error("删除商品失败:", error);
    return NextResponse.json({ error: "删除商品失败" }, { status: 500 });
  }
}
