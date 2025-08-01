"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  Eye,
  Copy,
  Check,
  Download,
  Filter,
} from "lucide-react";
import {
  useGetRedeemCodesQuery,
  useGenerateRedeemCodesMutation,
  useDeleteRedeemCodeMutation,
  useGetProductsQuery,
} from "@/store/api";
import toast from "react-hot-toast";

/**
 * 兑换码管理页面
 */
export default function RedeemCodesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [selectedCode, setSelectedCode] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    productId: "",
    quantity: 1,
  });
  const [copiedField, setCopiedField] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const {
    data: redeemCodes = [],
    isLoading,
    refetch,
  } = useGetRedeemCodesQuery();
  const { data: products = [] } = useGetProductsQuery();
  const [generateRedeemCodes, { isLoading: isGenerating }] =
    useGenerateRedeemCodesMutation();
  const [deleteRedeemCode, { isLoading: isDeleting }] =
    useDeleteRedeemCodeMutation();

  // 过滤兑换码
  const filteredCodes = redeemCodes.filter((code) => {
    const matchesSearch = code.cardNumber
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "used" && code.isUsed) ||
      (statusFilter === "unused" && !code.isUsed);

    const matchesProduct =
      productFilter === "all" || code.productId === productFilter;

    return matchesSearch && matchesStatus && matchesProduct;
  });

  /**
   * 打开兑换码详情模态框
   */
  const openDetailModal = (code) => {
    setSelectedCode(code);
    setCurrentImageIndex(0);
    setIsDetailModalOpen(true);
  };

  /**
   * 关闭兑换码详情模态框
   */
  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedCode(null);
    setCurrentImageIndex(0);
  };

  /**
   * 打开生成兑换码模态框
   */
  const openGenerateModal = () => {
    setIsGenerateModalOpen(true);
  };

  /**
   * 关闭生成兑换码模态框
   */
  const closeGenerateModal = () => {
    setIsGenerateModalOpen(false);
    setGenerateForm({ productId: "", quantity: 1 });
  };

  /**
   * 打开删除确认模态框
   */
  const openDeleteModal = (code) => {
    setSelectedCode(code);
    setIsDeleteModalOpen(true);
  };

  /**
   * 关闭删除确认模态框
   */
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedCode(null);
  };

  /**
   * 生成兑换码
   */
  const handleGenerateRedeemCodes = async (e) => {
    e.preventDefault();
    if (!generateForm.productId) {
      toast.error("请选择商品");
      return;
    }

    try {
      await generateRedeemCodes({
        productId: generateForm.productId,
        quantity: generateForm.quantity,
      }).unwrap();

      toast.success(`成功生成 ${generateForm.quantity} 个兑换码`);
      closeGenerateModal();
      refetch();
    } catch (error) {
      console.error("生成兑换码失败:", error);
      toast.error(error?.data?.error || "生成兑换码失败");
    }
  };

  /**
   * 删除兑换码
   */
  const handleDeleteRedeemCode = async () => {
    if (!selectedCode) return;

    try {
      await deleteRedeemCode(selectedCode._id).unwrap();
      toast.success("兑换码删除成功");
      closeDeleteModal();
      refetch();
    } catch (error) {
      console.error("删除兑换码失败:", error);
      toast.error(error?.data?.error || "删除兑换码失败");
    }
  };

  /**
   * 复制到剪贴板
   */
  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success("已复制到剪贴板");
      setTimeout(() => setCopiedField(""), 2000);
    } catch (error) {
      toast.error("复制失败");
    }
  };

  /**
   * 导出兑换码为CSV
   */
  const exportToCSV = () => {
    if (filteredCodes.length === 0) {
      toast.error("没有可导出的兑换码");
      return;
    }

    const headers = [
      "序号",
      "卡号",
      "密码",
      "商品名称",
      "商品价格",
      "使用状态",
      "创建时间",
      "使用时间",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredCodes.map((code, index) =>
        [
          index + 1,
          code.cardNumber,
          code.password,
          `"${code.productName}"`,
          code.productPrice,
          code.isUsed ? "已使用" : "未使用",
          `"${new Date(code.createdAt).toLocaleString("zh-CN")}"`,
          code.usedAt
            ? `"${new Date(code.usedAt).toLocaleString("zh-CN")}"`
            : "未使用",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `兑换码列表_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV文件已下载");
  };

  /**
   * 切换到上一张图片
   */
  const previousImage = () => {
    if (!selectedCode?.productImages) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? selectedCode.productImages.length - 1 : prev - 1
    );
  };

  /**
   * 切换到下一张图片
   */
  const nextImage = () => {
    if (!selectedCode?.productImages) return;
    setCurrentImageIndex((prev) =>
      prev === selectedCode.productImages.length - 1 ? 0 : prev + 1
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
              <h1 className="text-xl font-semibold text-gray-900">
                兑换码管理
              </h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={exportToCSV}
                className="btn-secondary flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                导出CSV
              </button>
              <button
                onClick={openGenerateModal}
                className="btn-primary flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                生成兑换码
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜索和过滤 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* 搜索框 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索卡号..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* 使用状态过滤 */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">全部状态</option>
              <option value="unused">未使用</option>
              <option value="used">已使用</option>
            </select>

            {/* 商品过滤 */}
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">全部商品</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          {/* 统计信息 */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>共找到 {filteredCodes.length} 个兑换码</span>
            <div className="flex space-x-4">
              <span>
                未使用: {redeemCodes.filter((code) => !code.isUsed).length}
              </span>
              <span>
                已使用: {redeemCodes.filter((code) => code.isUsed).length}
              </span>
              <span>总计: {redeemCodes.length}</span>
            </div>
          </div>
        </div>

        {/* 兑换码列表 */}
        {filteredCodes.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      卡号信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      商品信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      创建时间
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCodes.map((code) => (
                    <tr key={code._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 font-mono">
                            {code.cardNumber}
                          </div>
                          <div className="text-gray-500 font-mono">
                            {code.password}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {code.productName}
                          </div>
                          <div className="text-gray-500">
                            ¥{code.productPrice}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            code.isUsed
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {code.isUsed ? "已使用" : "未使用"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(code.createdAt).toLocaleString("zh-CN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openDetailModal(code)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                `${code.cardNumber}\n${code.password}`,
                                `code-${code._id}`
                              )
                            }
                            className="text-green-600 hover:text-green-900"
                          >
                            {copiedField === `code-${code._id}` ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => openDeleteModal(code)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              暂无兑换码
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== "all" || productFilter !== "all"
                ? "没有找到符合条件的兑换码"
                : "还没有生成任何兑换码"}
            </p>
            <button onClick={openGenerateModal} className="btn-primary">
              生成第一个兑换码
            </button>
          </div>
        )}
      </main>

      {/* 生成兑换码模态框 */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              生成兑换码
            </h3>

            <form onSubmit={handleGenerateRedeemCodes} className="space-y-4">
              {/* 选择商品 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择商品
                </label>
                <select
                  value={generateForm.productId}
                  onChange={(e) =>
                    setGenerateForm({
                      ...generateForm,
                      productId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">请选择商品</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name} - ¥{product.price}
                    </option>
                  ))}
                </select>
              </div>

              {/* 生成数量 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  生成数量
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={generateForm.quantity}
                  onChange={(e) =>
                    setGenerateForm({
                      ...generateForm,
                      quantity: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  一次最多可生成100个兑换码
                </p>
              </div>

              {/* 按钮 */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeGenerateModal}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {isGenerating ? "生成中..." : "生成"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 兑换码详情模态框 */}
      {isDetailModalOpen && selectedCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  兑换码详情
                </h3>
                <button
                  onClick={closeDetailModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {/* 商品图片轮播 */}
              {selectedCode.productImages &&
                selectedCode.productImages.length > 0 && (
                  <div className="mb-6">
                    <div className="relative h-48 mx-auto bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={selectedCode.productImages[currentImageIndex]}
                        alt={selectedCode.productName}
                        className="w-full h-full object-cover"
                      />
                      {selectedCode.productImages.length > 1 && (
                        <>
                          <button
                            onClick={previousImage}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                          >
                            ←
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                          >
                            →
                          </button>
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                            {selectedCode.productImages.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`w-2 h-2 rounded-full ${
                                  index === currentImageIndex
                                    ? "bg-white"
                                    : "bg-white bg-opacity-50"
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

              {/* 兑换码信息 */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      卡号
                    </label>
                    <div className="mt-1 flex items-center space-x-2">
                      <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono flex-1">
                        {selectedCode.cardNumber}
                      </code>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            selectedCode.cardNumber,
                            "detail-cardNumber"
                          )
                        }
                        className="p-2 text-gray-500 hover:text-gray-700"
                      >
                        {copiedField === "detail-cardNumber" ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      密码
                    </label>
                    <div className="mt-1 flex items-center space-x-2">
                      <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono flex-1">
                        {selectedCode.password}
                      </code>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            selectedCode.password,
                            "detail-password"
                          )
                        }
                        className="p-2 text-gray-500 hover:text-gray-700"
                      >
                        {copiedField === "detail-password" ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    商品名称
                  </label>
                  <p className="mt-1 text-gray-900">
                    {selectedCode.productName}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    商品价格
                  </label>
                  <p className="mt-1 text-gray-900 text-lg font-semibold">
                    ¥{selectedCode.productPrice}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    使用状态
                  </label>
                  <span
                    className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedCode.isUsed
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {selectedCode.isUsed ? "已使用" : "未使用"}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    创建时间
                  </label>
                  <p className="mt-1 text-gray-900">
                    {new Date(selectedCode.createdAt).toLocaleString("zh-CN")}
                  </p>
                </div>

                {selectedCode.isUsed && selectedCode.usedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      使用时间
                    </label>
                    <p className="mt-1 text-gray-900">
                      {new Date(selectedCode.usedAt).toLocaleString("zh-CN")}
                    </p>
                  </div>
                )}
              </div>

              {/* 操作按钮 */}
              <div className="flex space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={() =>
                    copyToClipboard(
                      `${selectedCode.cardNumber}\n${selectedCode.password}`,
                      "detail-both"
                    )
                  }
                  className="flex-1 btn-secondary flex items-center justify-center"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  {copiedField === "detail-both" ? "已复制" : "复制卡号密码"}
                </button>
                <button
                  onClick={closeDetailModal}
                  className="flex-1 btn-primary"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认模态框 */}
      {isDeleteModalOpen && selectedCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              确认删除
            </h3>
            <p className="text-gray-600 mb-6">
              确定要删除兑换码 "{selectedCode.cardNumber}" 吗？此操作不可撤销。
              {selectedCode.isUsed && (
                <span className="block mt-2 text-red-600 text-sm">
                  注意：此兑换码已被使用，删除后相关订单也会被删除。
                </span>
              )}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={closeDeleteModal}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                取消
              </button>
              <button
                onClick={handleDeleteRedeemCode}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "删除中..." : "确认删除"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
