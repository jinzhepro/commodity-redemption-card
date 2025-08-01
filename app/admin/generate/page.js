"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Copy,
  Check,
  Package,
  Download,
} from "lucide-react";
import { useCreateProductMutation } from "@/store/api";
import { useGenerateRedeemCodesMutation } from "@/store/api";
import toast from "react-hot-toast";

/**
 * 卡号生成页面
 */
export default function GeneratePage() {
  const [createProduct, { isLoading }] = useCreateProductMutation();
  const [generateRedeemCodes, { isLoading: isGeneratingCodes }] = useGenerateRedeemCodesMutation();
  const [generatedCards, setGeneratedCards] = useState([]);
  const [copiedField, setCopiedField] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      images: [],
    },
  });

  /**
   * 处理图片上传
   */
  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const currentImages = watch("images") || [];
      const newImages = [];

      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result;
          newImages.push(base64);

          // 当所有文件都读取完成后更新状态
          if (newImages.length === files.length) {
            setValue("images", [...currentImages, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  /**
   * 删除指定图片
   */
  const removeImage = (index) => {
    const currentImages = watch("images") || [];
    const updatedImages = currentImages.filter((_, i) => i !== index);
    setValue("images", updatedImages);
  };

  /**
   * 提交表单生成卡号
   */
  const onSubmit = async (data) => {
    const quantity = data.quantity || 1;
    setIsGenerating(true);

    try {
      // 1. 创建商品
      const product = await createProduct({
        name: data.name,
        price: Number(data.price),
        images: data.images,
      }).unwrap();

      // 2. 为商品生成兑换码
      const result = await generateRedeemCodes({
        productId: product._id,
        quantity: quantity,
      }).unwrap();

      setGeneratedCards(result.redeemCodes);
      toast.success(`成功生成 ${quantity} 张兑换码！`);
      reset({
        name: "",
        price: 0,
        quantity: 1,
        images: [],
      });
    } catch (error) {
      console.error('生成失败:', error);
      toast.error(error?.data?.error || "生成失败，请重试");
    } finally {
      setIsGenerating(false);
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
   * 复制所有卡号信息
   */
  const copyAllCards = async () => {
    if (generatedCards.length === 0) return;

    const allCardsText = generatedCards
      .map(
        (card, index) =>
          `卡号 ${index + 1}:\n` +
          `商品名称: ${card.productName}\n` +
          `价格: ¥${card.productPrice}\n` +
          `卡号: ${card.cardNumber}\n` +
          `密码: ${card.password}\n` +
          `生成时间: ${new Date(card.createdAt).toLocaleString("zh-CN")}\n`
      )
      .join("\n---\n\n");

    try {
      await navigator.clipboard.writeText(allCardsText);
      toast.success("所有卡号信息已复制到剪贴板");
    } catch (error) {
      toast.error("复制失败");
    }
  };

  /**
   * 导出为CSV文件
   */
  const exportToCSV = () => {
    if (generatedCards.length === 0) return;

    const headers = ["序号", "商品名称", "价格", "卡号", "密码", "生成时间"];
    const csvContent = [
      headers.join(","),
      ...generatedCards.map((card, index) =>
        [
          index + 1,
          `"${card.productName}"`,
          card.productPrice,
          card.cardNumber,
          card.password,
          `"${new Date(card.createdAt).toLocaleString("zh-CN")}"`,
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
      `兑换码_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV文件已下载");
  };

  const imagesPreviews = Array.isArray(watch("images")) ? watch("images") : [];

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
              <h1 className="text-xl font-semibold text-gray-900">卡号生成</h1>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：表单 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              创建新商品
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* 商品名称 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  商品名称
                </label>
                <input
                  type="text"
                  {...register("name", { required: "商品名称不能为空" })}
                  className="input-field"
                  placeholder="请输入商品名称"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* 商品价格 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  商品价格 (元)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("price", {
                    required: "商品价格不能为空",
                    min: { value: 0, message: "价格不能为负数" },
                  })}
                  className="input-field"
                  placeholder="请输入商品价格"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.price.message}
                  </p>
                )}
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
                  {...register("quantity", {
                    required: "生成数量不能为空",
                    min: { value: 1, message: "至少生成1张" },
                    max: { value: 100, message: "最多生成100张" },
                  })}
                  className="input-field"
                  placeholder="请输入生成数量 (1-100)"
                  defaultValue={1}
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.quantity.message}
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  一次最多可生成100张兑换码
                </p>
              </div>

              {/* 商品图片 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  商品图片 (支持多张)
                </label>

                {/* 已上传图片预览 */}
                {imagesPreviews.length > 0 && (
                  <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {imagesPreviews.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`预览 ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 上传区域 */}
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                    <div className="text-sm text-gray-600">
                      点击上传图片或拖拽图片到此处
                    </div>
                    <div className="text-xs text-gray-500">
                      支持多张图片，建议尺寸 400x400px
                    </div>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                <input
                  type="hidden"
                  {...register("images", {
                    required: "请至少上传一张商品图片",
                    validate: (value) =>
                      (value && value.length > 0) || "请至少上传一张商品图片",
                  })}
                />
                {errors.images && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.images.message}
                  </p>
                )}
              </div>

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={isLoading || isGeneratingCodes || isGenerating}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading || isGeneratingCodes || isGenerating ? "生成中..." : "生成卡号"}
              </button>
            </form>
          </div>

          {/* 右侧：生成结果 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">生成结果</h2>
              {generatedCards.length > 0 && (
                <div className="flex space-x-2">
                  <button
                    onClick={copyAllCards}
                    className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-200 flex items-center"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    复制全部
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-md hover:bg-green-200 flex items-center"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    导出CSV
                  </button>
                </div>
              )}
            </div>

            {generatedCards.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-green-800 mb-2">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">
                      成功生成 {generatedCards.length} 张卡号
                    </span>
                  </div>
                </div>

                {/* 卡号列表 */}
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {generatedCards.map((card, index) => (
                    <div
                      key={card._id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">
                          卡号 {index + 1}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {new Date(card.createdAt).toLocaleString("zh-CN")}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">商品名称：</span>
                          <span className="text-gray-900">{card.productName}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">价格：</span>
                          <span className="text-gray-900">¥{card.productPrice}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">卡号：</span>
                          <div className="flex items-center space-x-2 mt-1">
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono flex-1">
                              {card.cardNumber}
                            </code>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  card.cardNumber,
                                  `cardNumber-${index}`
                                )
                              }
                              className="p-1 text-gray-500 hover:text-gray-700"
                            >
                              {copiedField === `cardNumber-${index}` ? (
                                <Check className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">密码：</span>
                          <div className="flex items-center space-x-2 mt-1">
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono flex-1">
                              {card.password}
                            </code>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  card.password,
                                  `password-${index}`
                                )
                              }
                              className="p-1 text-gray-500 hover:text-gray-700"
                            >
                              {copiedField === `password-${index}` ? (
                                <Check className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <button
                    onClick={() => setGeneratedCards([])}
                    className="w-full btn-secondary"
                  >
                    生成新卡号
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p>填写商品信息并点击生成卡号</p>
                <p className="text-sm mt-2">支持批量生成1-100张兑换码</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}