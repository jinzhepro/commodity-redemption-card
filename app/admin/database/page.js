"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Database, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

/**
 * 数据库管理页面
 */
export default function DatabaseAdminPage() {
  const [isFixing, setIsFixing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [indexInfo, setIndexInfo] = useState(null);

  /**
   * 修复数据库索引
   */
  const handleFixIndexes = async () => {
    setIsFixing(true);
    try {
      const response = await fetch('/api/admin/fix-indexes', {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('索引修复成功！');
        console.log('修复详情:', result.details);
      } else {
        toast.error(result.error || '修复失败');
        console.error('修复失败:', result);
      }
    } catch (error) {
      toast.error('修复过程中发生错误');
      console.error('修复错误:', error);
    } finally {
      setIsFixing(false);
    }
  };

  /**
   * 获取索引信息
   */
  const handleGetIndexInfo = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/fix-indexes');
      const result = await response.json();
      
      if (result.success) {
        setIndexInfo(result.indexInfo);
        toast.success('索引信息获取成功');
      } else {
        toast.error(result.error || '获取索引信息失败');
      }
    } catch (error) {
      toast.error('获取索引信息时发生错误');
      console.error('获取索引信息错误:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
                返回管理后台
              </Link>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">
                数据库管理
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* 索引修复卡片 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Database className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                索引修复工具
              </h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600">
                如果遇到 "E11000 duplicate key error" 错误，特别是关于 cardNumber 字段的错误，
                可以使用此工具修复数据库索引问题。
              </p>
              
              <div className="flex space-x-4">
                <button
                  onClick={handleFixIndexes}
                  disabled={isFixing}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isFixing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      修复中...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 mr-2" />
                      修复索引
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleGetIndexInfo}
                  disabled={isLoading}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      获取中...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      查看索引信息
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 索引信息显示 */}
          {indexInfo && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                当前索引信息
              </h3>
              
              <div className="space-y-4">
                {Object.entries(indexInfo).map(([collection, indexes]) => (
                  <div key={collection} className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2 capitalize">
                      {collection} 集合
                    </h4>
                    
                    {Array.isArray(indexes) ? (
                      <div className="space-y-2">
                        {indexes.map((index, i) => (
                          <div key={i} className="text-sm bg-gray-50 p-2 rounded">
                            <div className="font-medium">名称: {index.name}</div>
                            <div className="text-gray-600">
                              键: {JSON.stringify(index.key)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-red-600 text-sm">{indexes}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 使用说明 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">
              使用说明
            </h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 修复索引操作会删除商品集合中错误的 cardNumber 索引</li>
              <li>• 同时会清理可能存在的 cardNumber 字段数据</li>
              <li>• 操作是安全的，不会影响正常的商品数据</li>
              <li>• 修复完成后，创建商品功能应该可以正常工作</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}