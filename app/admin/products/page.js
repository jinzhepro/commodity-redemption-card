"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Grid3X3,
  List,
  CreditCard,
  X,
  Copy,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
  useGetRedeemCodesByProductQuery,
} from "@/store/api";
import toast from "react-hot-toast";

/**
 * 商品管理页面
 */
export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRedeemCodeModalOpen, setIsRedeemCodeModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState("list"); // "list" 或 "grid"
  const [copiedCode, setCopiedCode] = useState(null);

  const { data: products = [], isLoading, refetch } = useGetProductsQuery();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  // 过滤商品
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /**
   * 打开商品详情模态框
   */
  const openDetailModal = (product) => {
    setSelectedProduct(product);
    setCurrentImageIndex(0);
    setIsDetailModalOpen(true);
  };

  /**
   * 关闭商品详情模态框
   */
  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedProduct(null);
    setCurrentImageIndex(0);
  };

  /**
   * 打开删除确认模态框
   */
  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  /**
   * 关闭删除确认模态框
   */
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedProduct(null);
  };

  /**
   * 打开兑换码模态框
   */
  const openRedeemCodeModal = (product) => {
    setSelectedProduct(product);
    setIsRedeemCodeModalOpen(true);
  };

  /**
   * 关闭兑换码模态框
   */
  const closeRedeemCodeModal = () => {
    setIsRedeemCodeModalOpen(false);
    setSelectedProduct(null);
    setCopiedCode(null);
  };

  /**
   * 复制兑换码到剪贴板
   */
  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(`${type}-${text}`);
      toast.success(`${type === "card" ? "卡号" : "密码"}已复制到剪贴板`);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast.error("复制失败");
    }
  };

  /**
   * 获取状态显示文本
   */
  const getStatusText = (isUsed) => {
    return isUsed ? "已使用" : "未使用";
  };

  /**
   * 获取状态样式
   */
  const getStatusStyle = (isUsed) => {
    return isUsed ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800";
  };

  /**
   * 删除商品
   */
  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      await deleteProduct(selectedProduct.id).unwrap();
      toast.success("商品删除成功");
      closeDeleteModal();
      refetch();
    } catch (error) {
      console.error("删除商品失败:", error);
      toast.error(error?.data?.error || "删除商品失败");
    }
  };

  /**
   * 切换到上一张图片
   */
  const previousImage = () => {
    if (!selectedProduct?.images) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? selectedProduct.images.length - 1 : prev - 1
    );
  };

  /**
   * 切换到下一张图片
   */
  const nextImage = () => {
    if (!selectedProduct?.images) return;
    setCurrentImageIndex((prev) =>
      prev === selectedProduct.images.length - 1 ? 0 : prev + 1
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                返回后台
              </Link>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">商品管理</h1>
            </div>
            <Link
              href="/admin/products/create"
              className="btn-primary flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              创建商品
            </Link>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜索栏和视图切换 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="relative flex-1 mr-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索商品名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* 视图切换按钮 */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-primary-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title="列表视图"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-white text-primary-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title="网格视图"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            共找到 {filteredProducts.length} 个商品
          </div>
        </div>

        {/* 商品展示区域 */}
        {filteredProducts.length > 0 ? (
          viewMode === "list" ? (
            /* 列表视图 */
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* 表头 */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                  <div className="col-span-1">图片</div>
                  <div className="col-span-3">商品名称</div>
                  <div className="col-span-1">价格</div>
                  <div className="col-span-2">兑换码统计</div>
                  <div className="col-span-2">创建时间</div>
                  <div className="col-span-1">状态</div>
                  <div className="col-span-2">操作</div>
                </div>
              </div>

              {/* 商品列表项 */}
              <div className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* 商品图片 */}
                      <div className="col-span-1">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">
                                无图
                              </span>
                            </div>
                          )}
                          {product.images && product.images.length > 1 && (
                            <div className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs px-1 rounded-full">
                              {product.images.length}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 商品名称 */}
                      <div className="col-span-3">
                        <h3 className="font-medium text-gray-900 truncate">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-sm text-gray-500 truncate mt-1">
                            {product.description}
                          </p>
                        )}
                      </div>

                      {/* 价格 */}
                      <div className="col-span-1">
                        <span className="text-lg font-semibold text-primary-600">
                          ¥{product.price}
                        </span>
                      </div>

                      {/* 兑换码统计 */}
                      <div className="col-span-2">
                        <div className="text-sm space-y-1">
                          <div className="flex items-center space-x-4">
                            <span className="text-gray-600">总数:</span>
                            <button
                              onClick={() => openRedeemCodeModal(product)}
                              className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                              title="点击查看兑换码详情"
                            >
                              {product.redeemCodeCount?.count || 0}
                            </button>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-red-600">
                              已用: {product.redeemCodeCount?.used || 0}
                            </span>
                            <span className="text-green-600">
                              剩余: {product.redeemCodeCount?.remaining || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 创建时间 */}
                      <div className="col-span-2">
                        <div className="text-sm text-gray-600">
                          {new Date(product.createdAt).toLocaleDateString(
                            "zh-CN"
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(product.createdAt).toLocaleTimeString(
                            "zh-CN",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      </div>

                      {/* 状态 */}
                      <div className="col-span-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            product.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.isActive ? "启用" : "禁用"}
                        </span>
                      </div>

                      {/* 操作按钮 */}
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openDetailModal(product)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="查看详情"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/admin/products/edit/${product._id}`}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            title="编辑商品"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => openDeleteModal(product)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="删除商品"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* 网格视图 */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* 商品图片 */}
                  <div className="aspect-square relative">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">暂无图片</span>
                      </div>
                    )}
                    {product.images && product.images.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        +{product.images.length - 1}
                      </div>
                    )}
                    {/* 状态标签 */}
                    <div className="absolute top-2 left-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          product.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.isActive ? "启用" : "禁用"}
                      </span>
                    </div>
                  </div>

                  {/* 商品信息 */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 truncate">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-primary-600 mb-3">
                      ¥{product.price}
                    </p>

                    {/* 兑换码统计 */}
                    <div className="text-sm text-gray-600 mb-4 space-y-1">
                      <div className="flex justify-between">
                        <span>总数:</span>
                        <button
                          onClick={() => openRedeemCodeModal(product)}
                          className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                          title="点击查看兑换码详情"
                        >
                          {product.redeemCodeCount?.count || 0}
                        </button>
                      </div>
                      <div className="flex justify-between">
                        <span>已使用:</span>
                        <span>{product.redeemCodeCount?.used || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>剩余:</span>
                        <span>{product.redeemCodeCount?.remaining || 0}</span>
                      </div>
                    </div>

                    {/* 创建时间 */}
                    <div className="text-xs text-gray-500 mb-4">
                      {new Date(product.createdAt).toLocaleDateString("zh-CN")}
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openDetailModal(product)}
                        className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        详情
                      </button>
                      <Link
                        href={`/admin/products/edit/${product._id}`}
                        className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        编辑
                      </Link>
                      <button
                        onClick={() => openDeleteModal(product)}
                        className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无商品</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? "没有找到符合条件的商品" : "还没有创建任何商品"}
            </p>
            <Link href="/admin/products/create" className="btn-primary">
              创建第一个商品
            </Link>
          </div>
        )}
      </main>

      {/* 商品详情模态框 */}
      {isDetailModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-lg">
            {/* 头部区域 */}
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Eye className="w-5 h-5 text-gray-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      商品详情
                    </h3>
                    <p className="text-gray-500 text-sm truncate max-w-xs">
                      {selectedProduct.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeDetailModal}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            {/* 内容区域 */}
            <div className="p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* 左侧：图片区域 */}
                <div>
                  {selectedProduct.images &&
                    selectedProduct.images.length > 0 && (
                      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={selectedProduct.images[currentImageIndex]}
                          alt={selectedProduct.name}
                          className="w-full h-full object-cover"
                        />

                        {/* 图片数量指示器 */}
                        <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-xs font-medium">
                          {currentImageIndex + 1} /{" "}
                          {selectedProduct.images.length}
                        </div>

                        {selectedProduct.images.length > 1 && (
                          <>
                            <button
                              onClick={previousImage}
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white bg-opacity-90 text-gray-800 rounded-full hover:bg-opacity-100 transition-all duration-200 shadow-lg flex items-center justify-center"
                            >
                              ←
                            </button>
                            <button
                              onClick={nextImage}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white bg-opacity-90 text-gray-800 rounded-full hover:bg-opacity-100 transition-all duration-200 shadow-lg flex items-center justify-center"
                            >
                              →
                            </button>

                            {/* 图片指示点 */}
                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                              {selectedProduct.images.map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => setCurrentImageIndex(index)}
                                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                    index === currentImageIndex
                                      ? "bg-white shadow-lg"
                                      : "bg-white bg-opacity-60 hover:bg-opacity-80"
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                </div>

                {/* 右侧：商品信息 */}
                <div className="space-y-3">
                  {/* 商品名称和价格 */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-2 mb-1">
                        <label className="text-xs font-semibold text-gray-700">
                          商品名称
                        </label>
                      </div>
                      <p className="text-gray-900 font-medium">
                        {selectedProduct.name}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-2 mb-1">
                        <label className="text-xs font-semibold text-gray-700">
                          商品价格
                        </label>
                      </div>
                      <p className="text-gray-900 text-xl font-bold">
                        ¥{selectedProduct.price}
                      </p>
                    </div>
                  </div>

                  {/* 兑换码统计 */}
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <label className="text-xs font-semibold text-gray-700">
                        兑换码统计
                      </label>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white p-2 rounded text-center border border-gray-100">
                        <div className="text-lg font-bold text-gray-900">
                          {selectedProduct.redeemCodeCount?.count || 0}
                        </div>
                        <div className="text-xs text-gray-600">总数</div>
                      </div>
                      <div className="bg-white p-2 rounded text-center border border-gray-100">
                        <div className="text-lg font-bold text-gray-900">
                          {selectedProduct.redeemCodeCount?.used || 0}
                        </div>
                        <div className="text-xs text-gray-600">已使用</div>
                      </div>
                      <div className="bg-white p-2 rounded text-center border border-gray-100">
                        <div className="text-lg font-bold text-gray-900">
                          {selectedProduct.redeemCodeCount?.remaining || 0}
                        </div>
                        <div className="text-xs text-gray-600">剩余</div>
                      </div>
                    </div>
                  </div>

                  {/* 状态和创建时间 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <label className="text-xs font-semibold text-gray-700">
                          状态
                        </label>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          selectedProduct.isActive
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-red-100 text-red-800 border border-red-200"
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full mr-1 ${
                            selectedProduct.isActive
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        ></div>
                        {selectedProduct.isActive ? "启用" : "禁用"}
                      </span>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <label className="text-xs font-semibold text-gray-700">
                          创建时间
                        </label>
                      </div>
                      <p className="text-gray-700 text-xs">
                        {new Date(selectedProduct.createdAt).toLocaleDateString(
                          "zh-CN"
                        )}
                      </p>
                    </div>
                  </div>

                  {/* 商品描述 */}
                  {selectedProduct.description && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <label className="text-xs font-semibold text-gray-700">
                          商品描述
                        </label>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                        {selectedProduct.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 操作按钮区域 */}
              <div className="flex space-x-3 mt-4 pt-4 border-t border-gray-200">
                <Link
                  href={`/admin/products/edit/${selectedProduct._id}`}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
                  onClick={closeDetailModal}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  编辑商品
                </Link>
                <button
                  onClick={closeDetailModal}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认模态框 */}
      {isDeleteModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              确认删除
            </h3>
            <p className="text-gray-600 mb-6">
              确定要删除商品 "{selectedProduct.name}" 吗？此操作不可撤销。
            </p>
            <div className="flex space-x-3">
              <button
                onClick={closeDeleteModal}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                取消
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "删除中..." : "确认删除"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 兑换码模态框 */}
      {isRedeemCodeModalOpen && selectedProduct && (
        <RedeemCodeModal
          product={selectedProduct}
          onClose={closeRedeemCodeModal}
          copyToClipboard={copyToClipboard}
          copiedCode={copiedCode}
          getStatusText={getStatusText}
          getStatusStyle={getStatusStyle}
        />
      )}
    </div>
  );
}

/**
 * 兑换码模态框组件
 */
function RedeemCodeModal({
  product,
  onClose,
  copyToClipboard,
  copiedCode,
  getStatusText,
  getStatusStyle,
}) {
  const { data: redeemCodes = [], isLoading } = useGetRedeemCodesByProductQuery(
    product.id
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 模态框头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <CreditCard className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                兑换码管理
              </h2>
              <p className="text-sm text-gray-600 mt-1">商品：{product.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* 统计信息 */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {redeemCodes.length}
              </div>
              <div className="text-sm text-gray-600">总数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {redeemCodes.filter((code) => code.isUsed).length}
              </div>
              <div className="text-sm text-gray-600">已使用</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {redeemCodes.filter((code) => !code.isUsed).length}
              </div>
              <div className="text-sm text-gray-600">未使用</div>
            </div>
          </div>
        </div>

        {/* 兑换码列表 */}
        <div className="p-6 overflow-y-auto max-h-96">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">加载中...</span>
            </div>
          ) : redeemCodes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>暂无兑换码</p>
            </div>
          ) : (
            <div className="space-y-3">
              {redeemCodes.map((code, index) => (
                <div
                  key={code.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                      {/* 卡号 */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700 w-12">
                          卡号:
                        </span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {code.cardNumber}
                        </code>
                        <button
                          onClick={() =>
                            copyToClipboard(code.cardNumber, "card")
                          }
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="复制卡号"
                        >
                          {copiedCode === `card-${code.cardNumber}` ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      </div>

                      {/* 密码 */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700 w-12">
                          密码:
                        </span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                          {code.password}
                        </code>
                        <button
                          onClick={() =>
                            copyToClipboard(code.password, "password")
                          }
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="复制密码"
                        >
                          {copiedCode === `password-${code.password}` ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-500" />
                          )}
                        </button>
                      </div>

                      {/* 创建时间 */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700 w-12">
                          创建:
                        </span>
                        <span className="text-sm text-gray-600">
                          {new Date(code.createdAt).toLocaleString("zh-CN")}
                        </span>
                      </div>

                      {/* 使用时间 */}
                      {code.isUsed && code.usedAt && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700 w-12">
                            使用:
                          </span>
                          <span className="text-sm text-gray-600">
                            {new Date(code.usedAt).toLocaleString("zh-CN")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* 状态标签 */}
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                          code.isUsed
                        )}`}
                      >
                        {code.isUsed ? (
                          <XCircle className="h-3 w-3 inline mr-1" />
                        ) : (
                          <CheckCircle className="h-3 w-3 inline mr-1" />
                        )}
                        {getStatusText(code.isUsed)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 模态框底部 */}
        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
