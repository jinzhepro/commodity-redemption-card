"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Edit, Trash2, Eye, Package, Truck } from "lucide-react";
import { useGetAllOrdersQuery, useUpdateOrderMutation } from "@/store/api";
import toast from "react-hot-toast";

/**
 * 快递公司列表
 */
const EXPRESS_COMPANIES = [
  { code: "", name: "请选择快递公司" },
  { code: "yuantong", name: "圆通速递" },
  { code: "zhongtong", name: "中通快递" },
  { code: "yunda", name: "韵达快递" },
  { code: "shunfeng", name: "顺丰速运" },
  { code: "shentong", name: "申通快递" },
  { code: "youzhengguonei", name: "邮政快递包裹" },
  { code: "jtexpress", name: "极兔速递" },
  { code: "jd", name: "京东物流" },
  { code: "ems", name: "EMS" },
  { code: "youzhengdsbk", name: "邮政电商标快" },
  { code: "debangkuaidi", name: "德邦快递" },
  { code: "youzhengbk", name: "邮政标准快递" },
  { code: "danniao", name: "菜鸟速递" },
  { code: "zhongtongkuaiyun", name: "中通快运" },
  { code: "shunfengkuaiyun", name: "顺丰快运" },
  { code: "kuayue", name: "跨越速运" },
  { code: "debangwuliu", name: "德邦物流" },
  { code: "jingdongkuaiyun", name: "京东快运" },
  { code: "annengwuliu", name: "安能快运" },
  { code: "jinguangsudikuaijian", name: "京广速递" },
];

/**
 * 订单管理页面
 */
export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    status: "",
    trackingNumber: "",
    expressCompany: "",
  });

  const { data: orders = [], isLoading, refetch } = useGetAllOrdersQuery();
  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();

  // 过滤订单
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.cardNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  /**
   * 打开编辑模态框
   */
  const openEditModal = (order) => {
    setSelectedOrder(order);
    setEditForm({
      status: order.status,
      trackingNumber: order.trackingNumber || "",
      expressCompany: order.expressCompany || "",
    });
    setIsEditModalOpen(true);
  };

  /**
   * 关闭编辑模态框
   */
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedOrder(null);
    setEditForm({ status: "", trackingNumber: "", expressCompany: "" });
  };

  /**
   * 更新订单
   */
  const handleUpdateOrder = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      await updateOrder({
        id: selectedOrder._id,
        status: editForm.status,
        trackingNumber: editForm.trackingNumber,
        expressCompany: editForm.expressCompany,
      }).unwrap();

      toast.success("订单更新成功");
      closeEditModal();
      refetch();
    } catch (error) {
      console.error("更新订单失败:", error);
      toast.error(error?.data?.error || "更新订单失败");
    }
  };

  /**
   * 获取快递公司名称
   */
  const getExpressCompanyName = (code) => {
    const company = EXPRESS_COMPANIES.find(item => item.code === code);
    return company ? company.name : code || "未设置";
  };

  /**
   * 获取状态显示文本
   */
  const getStatusText = (status) => {
    const statusMap = {
      pending: "待处理",
      processing: "处理中",
      shipped: "已发货",
      delivered: "已送达",
      cancelled: "已取消",
    };
    return statusMap[status] || status;
  };

  /**
   * 获取状态样式
   */
  const getStatusStyle = (status) => {
    const styleMap = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return styleMap[status] || "bg-gray-100 text-gray-800";
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
              <h1 className="text-xl font-semibold text-gray-900">订单管理</h1>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜索和过滤 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 搜索框 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索卡号、手机号或商品名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* 状态过滤 */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">全部状态</option>
              <option value="pending">待处理</option>
              <option value="processing">处理中</option>
              <option value="shipped">已发货</option>
              <option value="delivered">已送达</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>

          {/* 统计信息 */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>共找到 {filteredOrders.length} 个订单</span>
            <span>总订单数: {orders.length}</span>
          </div>
        </div>

        {/* 订单列表 */}
        {filteredOrders.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      订单信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      商品信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      物流信息
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
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {order.cardNumber}
                          </div>
                          <div className="text-gray-500">{order.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {order.productName}
                          </div>
                          <div className="text-gray-500">
                            ¥{order.productPrice}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(
                            order.status
                          )}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          {order.trackingNumber ? (
                            <>
                              <div className="font-medium text-gray-900">
                                {getExpressCompanyName(order.expressCompany)}
                              </div>
                              <div className="text-gray-500 max-w-xs truncate">
                                {order.trackingNumber}
                              </div>
                            </>
                          ) : (
                            <div className="text-gray-500">暂无物流信息</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleString("zh-CN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openEditModal(order)}
                          className="text-primary-600 hover:text-primary-900 mr-3"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无订单</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== "all"
                ? "没有找到符合条件的订单"
                : "还没有任何订单"}
            </p>
          </div>
        )}
      </main>

      {/* 编辑订单模态框 */}
      {isEditModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                编辑订单
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 左侧：订单基本信息和用户物流信息 */}
                <div className="space-y-4">
                  {/* 订单基本信息 */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      订单基本信息
                    </h4>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">订单ID：</span>
                        <span className="text-gray-900 font-mono text-xs">
                          {selectedOrder._id}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">卡号：</span>
                        <span className="text-gray-900">
                          {selectedOrder.cardNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">手机号：</span>
                        <span className="text-gray-900">{selectedOrder.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">商品：</span>
                        <span className="text-gray-900">
                          {selectedOrder.productName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">价格：</span>
                        <span className="text-gray-900">
                          ¥{selectedOrder.productPrice}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">下单时间：</span>
                        <span className="text-gray-900 text-xs">
                          {new Date(selectedOrder.createdAt).toLocaleString("zh-CN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 用户物流信息 */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <Package className="w-4 h-4 mr-2 text-blue-600" />
                      收货信息
                    </h4>
                    <div className="text-sm space-y-2">
                      <div>
                        <span className="text-gray-600">收货人：</span>
                        <span className="text-gray-900 font-medium">
                          {selectedOrder.customerName || "未填写"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">联系电话：</span>
                        <span className="text-gray-900">
                          {selectedOrder.phone}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">收货地址：</span>
                        <div className="text-gray-900 mt-1 leading-relaxed">
                          {selectedOrder.address || "未填写收货地址"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 当前物流状态 */}
                  {selectedOrder.trackingNumber && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <Truck className="w-4 h-4 mr-2 text-green-600" />
                        当前物流状态
                      </h4>
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">快递公司：</span>
                          <span className="text-gray-900">
                            {getExpressCompanyName(selectedOrder.expressCompany)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">快递单号：</span>
                          <span className="text-gray-900 font-mono text-xs">
                            {selectedOrder.trackingNumber}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">订单状态：</span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(selectedOrder.status)}`}>
                            {getStatusText(selectedOrder.status)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">更新时间：</span>
                          <span className="text-gray-900 text-xs">
                            {new Date(selectedOrder.updatedAt).toLocaleString("zh-CN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 右侧：编辑表单 */}
                <div>
                  <form onSubmit={handleUpdateOrder} className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">
                      编辑物流信息
                    </h4>

                    {/* 订单状态 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        订单状态
                      </label>
                      <select
                        value={editForm.status}
                        onChange={(e) =>
                          setEditForm({ ...editForm, status: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      >
                        <option value="pending">待处理</option>
                        <option value="processing">处理中</option>
                        <option value="shipped">已发货</option>
                        <option value="delivered">已送达</option>
                        <option value="cancelled">已取消</option>
                      </select>
                    </div>

                    {/* 快递公司选择 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        快递公司
                      </label>
                      <select
                        value={editForm.expressCompany}
                        onChange={(e) =>
                          setEditForm({ ...editForm, expressCompany: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">请选择快递公司</option>
                        {EXPRESS_COMPANIES.map((company) => (
                          <option key={company.code} value={company.code}>
                            {company.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 快递单号 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        快递单号
                      </label>
                      <input
                        type="text"
                        value={editForm.trackingNumber}
                        onChange={(e) =>
                          setEditForm({ ...editForm, trackingNumber: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="请输入快递单号..."
                      />
                    </div>

                    {/* 操作提示 */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start">
                        <div className="text-yellow-600 mr-2">💡</div>
                        <div className="text-sm text-yellow-800">
                          <p className="font-medium mb-1">操作提示：</p>
                          <ul className="text-xs space-y-1">
                            <li>• 修改为"已发货"状态时，请确保填写快递公司和快递单号</li>
                            <li>• 快递单号填写后，用户可以查询物流轨迹</li>
                            <li>• 订单状态变更会通知用户</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* 按钮 */}
                    <div className="flex space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={closeEditModal}
                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                      >
                        {isUpdating ? "更新中..." : "保存更改"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
