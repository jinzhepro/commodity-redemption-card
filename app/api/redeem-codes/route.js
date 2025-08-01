import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import RedeemCode from "@/models/RedeemCode";
import { nanoid } from "nanoid";

/**
 * 生成随机卡号
 * @returns {string} 16位卡号
 */
function generateCardNumber() {
  return nanoid(16).toUpperCase();
}

/**
 * 生成随机密码
 * @returns {string} 8位密码
 */
function generatePassword() {
  return nanoid(8);
}

/**
 * 批量生成兑换码
 * @param {NextRequest} request - 请求对象
 * @returns {Promise<NextResponse>} 响应对象
 */
export async function POST(request) {
  try {
    await connectDB();

    const { productId, quantity } = await request.json();

    if (!productId || !quantity || quantity < 1 || quantity > 100) {
      return NextResponse.json(
        { error: "商品ID不能为空，数量必须在1-100之间" },
        { status: 400 }
      );
    }

    // 查找商品信息
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "商品不存在" }, { status: 404 });
    }

    if (!product.isActive) {
      return NextResponse.json(
        { error: "商品已停用，无法生成兑换码" },
        { status: 400 }
      );
    }

    const redeemCodes = [];

    // 批量生成兑换码
    for (let i = 0; i < quantity; i++) {
      // 生成唯一卡号
      let cardNumber;
      let isUnique = false;

      while (!isUnique) {
        cardNumber = generateCardNumber();
        const existingCode = await RedeemCode.findOne({ cardNumber });
        if (!existingCode) {
          isUnique = true;
        }
      }

      // 生成密码
      const password = generatePassword();

      const redeemCode = new RedeemCode({
        cardNumber: cardNumber,
        password,
        productId: product._id,
        productName: product.name,
        productPrice: product.price,
        productImages: product.images,
        isUsed: false,
      });

      await redeemCode.save();
      redeemCodes.push(redeemCode.toObject());
    }

    await Product.findByIdAndUpdate(productId, {
      $set: {
        "redeemCodeCount.count": quantity + product.redeemCodeCount.count,
        "redeemCodeCount.remaining":
          quantity + product.redeemCodeCount.remaining,
      },
    });
    console.log(product);

    return NextResponse.json({
      message: `成功生成 ${quantity} 个兑换码`,
      redeemCodes,
    });
  } catch (error) {
    console.error("生成兑换码失败:", error);
    return NextResponse.json({ error: "生成兑换码失败" }, { status: 500 });
  }
}

/**
 * 获取兑换码列表
 * @param {NextRequest} request - 请求对象
 * @returns {Promise<NextResponse>} 响应对象
 */
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const isUsed = searchParams.get("isUsed");
    const cardNumber = searchParams.get("cardNumber");

    const query = {};

    if (productId) {
      query.productId = productId;
    }

    if (isUsed !== null && isUsed !== undefined) {
      query.isUsed = isUsed === "true";
    }

    if (cardNumber) {
      query.cardNumber = { $regex: cardNumber, $options: "i" };
    }

    const redeemCodes = await RedeemCode.find(query)
      .populate("productId", "name price images isActive")
      .sort({ createdAt: -1 });

    return NextResponse.json(redeemCodes);
  } catch (error) {
    console.error("获取兑换码列表失败:", error);
    return NextResponse.json({ error: "获取兑换码列表失败" }, { status: 500 });
  }
}
