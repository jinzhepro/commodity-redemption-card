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

// 定义Order Schema
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

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

/**
 * 更新测试订单，添加快递公司信息
 */
async function updateTestOrder() {
  try {
    await connectDB();

    // 查找测试订单
    const testOrder = await Order.findOne({ cardNumber: "TEST123456" });
    
    if (!testOrder) {
      console.log("未找到测试订单");
      process.exit(1);
    }

    // 更新订单，添加快递公司信息
    testOrder.expressCompany = "shunfeng";
    testOrder.status = "shipped";
    
    await testOrder.save();

    console.log("测试订单更新成功:");
    console.log("订单ID:", testOrder.orderId);
    console.log("快递公司:", testOrder.expressCompany);
    console.log("快递单号:", testOrder.trackingNumber);
    console.log("订单状态:", testOrder.status);
    
    process.exit(0);
  } catch (error) {
    console.error("更新测试订单失败:", error);
    process.exit(1);
  }
}

updateTestOrder();