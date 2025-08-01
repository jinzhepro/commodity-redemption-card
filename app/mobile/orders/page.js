"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Package,
  Truck,
  CheckCircle,
  MapPin,
  Clock,
  RefreshCw,
} from "lucide-react";
import { useQueryOrderMutation, useTrackLogisticsMutation } from "@/store/api";
import toast from "react-hot-toast";

/**
 * 订单物流查询页面
 */
export default function OrdersPage() {
  const [order, setOrder] = useState(null);
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [queryOrder, { isLoading }] = useQueryOrderMutation();
  const [trackLogistics, { isLoading: isTrackingLoading }] =
    useTrackLogisticsMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  /**
   * 查询订单
   */
  const onSubmit = async (data) => {
    try {
      const result = await queryOrder({
        cardNumber: data.cardNumber,
        phone: data.phone,
      }).unwrap();

      // 后端返回的是订单数组，取第一个订单
      if (result && result.length > 0) {
        const orderData = result[0];
        setOrder(orderData);
        toast.success("订单查询成功！");

        // 如果有快递单号，自动查询物流信息
        if (orderData.trackingNumber) {
          await queryTrackingInfo(
            orderData.trackingNumber,
            orderData.expressCompany
          );
        }
      } else {
        setOrder(null);
        setTrackingInfo(null);
        toast.error("未找到相关订单信息");
      }
    } catch (error) {
      console.error("查询失败:", error);
      setOrder(null);
      setTrackingInfo(null);
      toast.error(error?.data?.error || "订单查询失败");
    }
  };

  /**
   * 查询物流信息
   */
  const queryTrackingInfo = async (trackingNumber, expressCompany) => {
    try {
      const result = await trackLogistics({
        trackingNumber,
        expressCompany,
      }).unwrap();

      setTrackingInfo(result);
    } catch (error) {
      console.error("物流查询失败:", error);
      // 物流查询失败不影响订单显示，只是不显示详细物流信息
      setTrackingInfo(null);
    }
  };

  /**
   * 手动刷新物流信息
   */
  const refreshTrackingInfo = async () => {
    if (order?.trackingNumber) {
      await queryTrackingInfo(order.trackingNumber, order.expressCompany);
      toast.success("物流信息已更新");
    }
  };

  /**
   * 获取订单状态显示信息
   */
  const getStatusInfo = (status) => {
    switch (status) {
      case "pending":
        return {
          text: "待发货",
          color: "text-yellow-600",
          bgColor: "bg-yellow-100",
          icon: Package,
        };
      case "shipped":
        return {
          text: "已发货",
          color: "text-blue-600",
          bgColor: "bg-blue-100",
          icon: Truck,
        };
      case "delivered":
        return {
          text: "已送达",
          color: "text-green-600",
          bgColor: "bg-green-100",
          icon: CheckCircle,
        };
      default:
        return {
          text: "未知状态",
          color: "text-gray-600",
          bgColor: "bg-gray-100",
          icon: Package,
        };
    }
  };

  /**
   * 格式化日期
   */
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/mobile"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              返回首页
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">订单查询</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-md mx-auto px-4 py-6">
        {/* 查询表单 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              订单查询
            </h2>
            <p className="text-gray-600">请输入您的卡号和手机号查询订单</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* 卡号 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                卡号
              </label>
              <input
                type="text"
                {...register("cardNumber", {
                  required: "请输入卡号",
                })}
                className="input-field"
                placeholder="请输入卡号"
              />
              {errors.cardNumber && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.cardNumber.message}
                </p>
              )}
            </div>

            {/* 手机号 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                手机号
              </label>
              <input
                type="tel"
                {...register("phone", {
                  required: "请输入手机号",
                  pattern: {
                    value: /^1[3-9]\d{9}$/,
                    message: "请输入正确的手机号",
                  },
                })}
                className="input-field"
                placeholder="请输入手机号"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* 查询按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "查询中..." : "查询订单"}
            </button>
          </form>
        </div>

        {/* 订单信息 */}
        {order && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              订单详情
            </h3>

            {/* 订单基本信息 */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">订单号</span>
                <span className="font-mono text-sm">{order.orderId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">商品名称</span>
                <span className="font-medium">{order.productName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">商品价格</span>
                <span className="font-medium text-primary-600">
                  ¥{order.productPrice}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">下单时间</span>
                <span className="text-sm">{formatDate(order.createdAt)}</span>
              </div>
            </div>

            {/* 订单状态 */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">
                订单状态
              </h4>
              <div className="flex items-center">
                {(() => {
                  const statusInfo = getStatusInfo(order.status);
                  const StatusIcon = statusInfo.icon;
                  return (
                    <div
                      className={`flex items-center px-3 py-2 rounded-full ${statusInfo.bgColor}`}
                    >
                      <StatusIcon
                        className={`w-5 h-5 mr-2 ${statusInfo.color}`}
                      />
                      <span className={`font-medium ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* 收货信息 */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">
                收货信息
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex">
                  <span className="text-gray-600 w-16">姓名:</span>
                  <span>{order.customerName}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-16">手机:</span>
                  <span>{order.phone}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 w-16">地址:</span>
                  <span className="flex-1">{order.address}</span>
                </div>
              </div>
            </div>

            {/* 物流信息 */}
            {order.trackingNumber && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-md font-medium text-gray-900">
                    物流信息
                  </h4>
                  <button
                    onClick={refreshTrackingInfo}
                    disabled={isTrackingLoading}
                    className="flex items-center text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-4 h-4 mr-1 ${
                        isTrackingLoading ? "animate-spin" : ""
                      }`}
                    />
                    刷新
                  </button>
                </div>

                {/* 基本物流信息 */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 mb-4">
                  <div className="flex">
                    <span className="text-gray-600 w-20">快递单号:</span>
                    <span className="font-mono text-sm">
                      {order.trackingNumber}
                    </span>
                  </div>
                  {trackingInfo && (
                    <>
                      <div className="flex">
                        <span className="text-gray-600 w-20">快递公司:</span>
                        <span className="text-sm">
                          {trackingInfo.expressCompanyName}
                        </span>
                      </div>
                      {trackingInfo.updateTime && (
                        <div className="flex">
                          <span className="text-gray-600 w-20">更新时间:</span>
                          <span className="text-sm">
                            {trackingInfo.updateTime}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  {!trackingInfo && (
                    <div className="flex">
                      <span className="text-gray-600 w-20">更新时间:</span>
                      <span className="text-sm">
                        {formatDate(order.updatedAt)}
                      </span>
                    </div>
                  )}
                </div>

                {/* 详细物流轨迹 */}
                {trackingInfo &&
                  trackingInfo.data &&
                  trackingInfo.data.length > 0 && (
                    <div className="bg-white border rounded-lg p-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        物流轨迹
                      </h5>
                      <div className="space-y-3">
                        {trackingInfo.data.map((item, index) => (
                          <div key={index} className="flex">
                            <div className="flex flex-col items-center mr-3">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  index === 0 ? "bg-primary-500" : "bg-gray-300"
                                }`}
                              ></div>
                              {index < trackingInfo.data.length - 1 && (
                                <div className="w-0.5 h-8 bg-gray-200 mt-1"></div>
                              )}
                            </div>
                            <div className="flex-1 pb-3">
                              <div className="text-sm text-gray-900 mb-1">
                                {item.context}
                              </div>
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="w-3 h-3 mr-1" />
                                {item.time}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* 物流查询失败提示 */}
                {order.trackingNumber &&
                  !trackingInfo &&
                  !isTrackingLoading && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <div className="text-yellow-600 mr-2">⚠️</div>
                        <div className="text-sm text-yellow-800">
                          暂时无法获取详细物流信息，请稍后重试
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* 操作按钮 */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  setOrder(null);
                  setTrackingInfo(null);
                }}
                className="w-full btn-secondary"
              >
                重新查询
              </button>
              <Link
                href="/mobile"
                className="w-full btn-primary block text-center"
              >
                返回首页
              </Link>
            </div>
          </div>
        )}

        {/* 查询提示 */}
        {!order && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm">请输入您的卡号和手机号查询订单信息</p>
              <p className="text-xs mt-2 text-gray-400">如有疑问，请联系客服</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
