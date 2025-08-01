"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Package, Plus, List, CreditCard, Database } from "lucide-react";
import { useGetProductsQuery } from "@/store/api";
import { useGetAllOrdersQuery } from "@/store/api";
import { useGetRedeemCodesQuery } from "@/store/api";

/**
 * 后台管理主页
 */
export default function AdminPage() {
  // 获取商品数据
  const { data: products = [], isLoading: productsLoading } =
    useGetProductsQuery();

  // 获取订单数据
  const { data: orders = [], isLoading: ordersLoading } =
    useGetAllOrdersQuery();

  // 获取兑换码数据
  const { data: redeemCodes = [], isLoading: redeemCodesLoading } =
    useGetRedeemCodesQuery({});

  // 计算统计数据
  const totalProducts = products.length;
  const activeProducts = products.filter((product) => product.isActive).length;
  const totalRedeemCodes = redeemCodes.length;
  const usedRedeemCodes = redeemCodes.filter((code) => code.isUsed).length;
  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                返回首页
              </Link>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">
                后台管理系统
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 商品管理卡片 */}
          <Link
            href="/admin/products"
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  商品管理
                </h2>
                <p className="text-sm text-gray-600">管理商品信息和库存</p>
              </div>
            </div>
          </Link>

          {/* 兑换码管理卡片 */}
          <Link
            href="/admin/redeem-codes"
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <CreditCard className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  兑换码管理
                </h2>
                <p className="text-sm text-gray-600">生成和管理兑换码</p>
              </div>
            </div>
          </Link>

          {/* 订单管理卡片 */}
          <Link
            href="/admin/orders"
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <List className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  订单管理
                </h2>
                <p className="text-sm text-gray-600">查看和管理所有订单</p>
              </div>
            </div>
          </Link>

          {/* 数据库管理卡片 */}
          <Link
            href="/admin/database"
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Database className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  数据库管理
                </h2>
                <p className="text-sm text-gray-600">修复数据库索引问题</p>
              </div>
            </div>
          </Link>

          {/* 数据统计卡片 */}
          {/* <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-orange-100 p-3 rounded-lg">
                <Plus className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  数据统计
                </h2>
                <p className="text-sm text-gray-600">查看系统运营数据</p>
              </div>
            </div>
          </div> */}
        </div>

        {/* 统计信息 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {productsLoading ? "..." : totalProducts}
              </div>
              <div className="text-sm text-gray-600 mt-1">总商品数</div>
              <div className="text-xs text-gray-500 mt-1">
                活跃: {productsLoading ? "..." : activeProducts}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {redeemCodesLoading ? "..." : totalRedeemCodes}
              </div>
              <div className="text-sm text-gray-600 mt-1">总兑换码</div>
              <div className="text-xs text-gray-500 mt-1">
                可用:{" "}
                {redeemCodesLoading
                  ? "..."
                  : totalRedeemCodes - usedRedeemCodes}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {redeemCodesLoading ? "..." : usedRedeemCodes}
              </div>
              <div className="text-sm text-gray-600 mt-1">已使用兑换码</div>
              <div className="text-xs text-gray-500 mt-1">
                使用率:{" "}
                {redeemCodesLoading || totalRedeemCodes === 0
                  ? "..."
                  : Math.round((usedRedeemCodes / totalRedeemCodes) * 100)}
                %
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {ordersLoading ? "..." : orders.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">总订单数</div>
              <div className="text-xs text-gray-500 mt-1">
                待处理: {ordersLoading ? "..." : pendingOrders}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
