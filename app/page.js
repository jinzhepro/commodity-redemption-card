"use client";

import Link from "next/link";
import { Settings, Smartphone } from "lucide-react";

/**
 * 主页面 - 路由选择
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            商品兑换系统
          </h1>
          <p className="text-gray-600">请选择您要访问的功能</p>
        </div>

        <div className="space-y-4">
          <Link
            href="/admin"
            className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-6 transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            <Settings className="w-8 h-8 text-blue-600" />
            <div className="text-left">
              <h2 className="text-lg font-semibold text-gray-900">后台管理</h2>
              <p className="text-sm text-gray-600">
                商品管理、卡号生成、订单管理
              </p>
            </div>
          </Link>

          <Link
            href="/mobile"
            className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-6 transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            <Smartphone className="w-8 h-8 text-green-600" />
            <div className="text-left">
              <h2 className="text-lg font-semibold text-gray-900">移动端</h2>
              <p className="text-sm text-gray-600">
                商品兑换、订单查询、物流跟踪
              </p>
            </div>
          </Link>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>© 2024 商品兑换系统. 保留所有权利.</p>
        </div>
      </div>
    </div>
  );
}