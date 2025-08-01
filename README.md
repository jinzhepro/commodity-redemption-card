# 商品兑换系统

一个基于 Next.js 的商品兑换系统，包含后台管理和移动端功能。

## 功能特性

### 后台管理功能

- **卡号生成**: 根据商品信息（图片、品名、价格）生成唯一卡号和密码
- **商品管理**: 查看所有商品、状态管理
- **订单管理**: 查看所有订单、更新物流信息和订单状态

### 移动端功能

- **商品兑换**: 输入卡号密码验证后填写收货信息生成订单
- **物流查询**: 根据卡号和手机号查询物流信息
- **订单查询**: 根据卡号和手机号查询订单详情

## 技术栈

- **前端**: Next.js 14, React 18, TypeScript
- **样式**: Tailwind CSS
- **状态管理**: Redux Toolkit, RTK Query
- **数据库**: MongoDB, Mongoose
- **UI 组件**: Lucide React
- **表单**: React Hook Form
- **通知**: React Hot Toast

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

复制 `.env.local` 文件并配置以下环境变量：

```env
MONGODB_URI=mongodb://localhost:27017/product-exchange
JWT_SECRET=your-jwt-secret-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
├── app/                    # Next.js App Router
│   ├── admin/             # 后台管理页面
│   │   ├── generate/      # 卡号生成
│   │   ├── products/      # 商品管理
│   │   └── orders/        # 订单管理
│   ├── mobile/            # 移动端页面
│   │   ├── exchange/      # 商品兑换
│   │   ├── tracking/      # 物流查询
│   │   └── orders/        # 订单查询
│   └── api/               # API 路由
├── lib/                   # 工具库
├── models/                # 数据模型
├── store/                 # Redux 状态管理
└── components/            # 可复用组件
```

## API 接口

### 商品相关

- `POST /api/products` - 创建商品
- `GET /api/products` - 获取所有商品
- `POST /api/products/verify` - 验证卡号密码
- `GET /api/products/card/[cardNumber]` - 根据卡号获取商品信息

### 订单相关

- `POST /api/orders` - 创建订单
- `GET /api/orders` - 获取所有订单
- `POST /api/orders/query` - 查询订单
- `POST /api/orders/tracking` - 查询物流
- `PATCH /api/orders/[id]` - 更新订单

## 使用流程

### 后台管理员

1. 访问 `/admin` 进入后台管理
2. 在 `/admin/generate` 创建商品并生成卡号密码
3. 在 `/admin/products` 查看商品列表
4. 在 `/admin/orders` 管理订单和物流信息

### 移动端用户

1. 访问 `/mobile` 进入移动端
2. 在 `/mobile/exchange` 使用卡号密码兑换商品
3. 在 `/mobile/tracking` 查询物流信息
4. 在 `/mobile/orders` 查询订单详情

## 开发说明

- 使用 TypeScript 进行类型安全开发
- 使用 Tailwind CSS 进行样式开发
- 使用 RTK Query 进行数据获取和缓存
- 使用 React Hook Form 进行表单管理
- 使用 MongoDB 进行数据存储

## 部署

### 生产构建

```bash
npm run build
npm start
```

### 环境变量

确保在生产环境中正确配置所有环境变量，特别是数据库连接和密钥。
