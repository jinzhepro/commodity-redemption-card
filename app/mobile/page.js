'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Search, Package } from 'lucide-react';

/**
 * 移动端主页
 */
export default function MobilePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/" 
              className="flex items-center text-gray-600"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              返回
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">
              商品兑换
            </h1>
            <div className="w-8"></div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="px-4 py-6">
        {/* 功能卡片 */}
        <div className="space-y-4">
          <Link 
            href="/mobile/exchange" 
            className="block bg-white rounded-lg shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">
                  商品兑换
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  输入卡号和密码兑换商品
                </p>
              </div>
              <div className="text-gray-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </Link>

          <Link 
            href="/mobile/orders" 
            className="block bg-white rounded-lg shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Search className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">
                  订单物流查询
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  查询订单信息和物流配送状态
                </p>
              </div>
              <div className="text-gray-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* 帮助信息 */}
        <div className="mt-8 bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            使用说明
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 商品兑换：输入卡号和密码即可兑换对应商品</li>
            <li>• 订单物流查询：使用卡号和手机号查询订单信息和物流状态</li>
          </ul>
        </div>
      </main>
    </div>
  );
}