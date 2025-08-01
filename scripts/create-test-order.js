import mongoose from 'mongoose';

// 手动设置MongoDB连接
const MONGODB_URI = 'mongodb://localhost:27017/product-exchange';

/**
 * 连接数据库
 */
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB连接成功');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

// 定义Schema
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  redeemCodeCount: { type: Number, default: 0 },
  usedRedeemCodeCount: { type: Number, default: 0 },
}, { timestamps: true });

const RedeemCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  isUsed: { type: Boolean, default: false },
}, { timestamps: true });

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  cardNumber: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  productPrice: { type: Number, required: true },
  redeemCodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'RedeemCode', required: true },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  trackingNumber: { type: String, default: '' },
  expressCompany: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'completed'], default: 'pending' },
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const RedeemCode = mongoose.models.RedeemCode || mongoose.model('RedeemCode', RedeemCodeSchema);
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

/**
 * 创建测试订单数据
 */
async function createTestOrder() {
  try {
    await connectDB();

    // 查找一个现有的商品
    let product = await Product.findOne();
    if (!product) {
      // 如果没有商品，创建一个测试商品
      product = await Product.create({
        name: "测试商品",
        description: "这是一个测试商品",
        price: 99.99,
        imageUrl: "/test-product.jpg",
        redeemCodeCount: 100,
        usedRedeemCodeCount: 1,
      });
    }

    // 查找一个现有的兑换码
    let redeemCode = await RedeemCode.findOne({ productId: product._id });
    if (!redeemCode) {
      // 如果没有兑换码，创建一个测试兑换码
      redeemCode = await RedeemCode.create({
        code: "TEST123456",
        password: "123456",
        productId: product._id,
        isUsed: true,
      });
    }

    // 创建测试订单
    const testOrder = await Order.create({
      orderId: "TEST" + Date.now(),
      cardNumber: "TEST123456",
      productId: product._id,
      productName: product.name,
      productPrice: product.price,
      redeemCodeId: redeemCode._id,
      customerName: "张三",
      phone: "13800138000",
      address: "北京市朝阳区测试街道123号",
      trackingNumber: "SF1234567890123", // 顺丰快递单号
      expressCompany: "shunfeng", // 顺丰快递公司编码
      status: "shipped",
    });

    console.log("测试订单创建成功:", testOrder);
    console.log("可以使用以下信息查询订单:");
    console.log("卡号:", testOrder.cardNumber);
    console.log("手机号:", testOrder.phone);
    
    process.exit(0);
  } catch (error) {
    console.error("创建测试订单失败:", error);
    process.exit(1);
  }
}

createTestOrder();