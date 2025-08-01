"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, X, Save } from "lucide-react";
import { useGetProductQuery, useUpdateProductMutation } from "@/store/api";
import toast from "react-hot-toast";

/**
 * 编辑商品页面
 */
export default function EditProductPage({ params }) {
  const router = useRouter();
  const { id } = params;

  const { data: product, isLoading: isLoadingProduct } = useGetProductQuery(id);
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      images: [],
    },
  });

  // 当商品数据加载完成时，填充表单
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        price: product.price,
        description: product.description || "",
        images: product.images || [],
      });
    }
  }, [product, reset]);

  /**
   * 处理图片上传
   */
  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const currentImages = watch("images") || [];

      Array.from(files).forEach((file) => {
        // 验证文件类型
        if (!file.type.startsWith("image/")) {
          toast.error(`文件 ${file.name} 不是有效的图片格式`);
          return;
        }

        // 验证文件大小 (5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`文件 ${file.name} 大小超过5MB限制`);
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result;
          if (base64) {
            setValue("images", [...currentImages, base64]);
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
   * 提交表单
   */
  const onSubmit = async (data) => {
    try {
      await updateProduct({
        id,
        data: {
          name: data.name,
          price: Number(data.price),
          images: data.images,
          description: data.description,
        },
      }).unwrap();

      toast.success("商品更新成功！");
      router.push("/admin/products");
    } catch (error) {
      console.error("更新商品失败:", error);
      toast.error(error?.data?.error || "更新商品失败，请重试");
    }
  };

  const imagesPreviews = Array.isArray(watch("images")) ? watch("images") : [];

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载商品信息中...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            商品不存在
          </h2>
          <p className="text-gray-600 mb-4">找不到指定的商品</p>
          <Link href="/admin/products" className="btn-primary">
            返回商品管理
          </Link>
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
                href="/admin/products"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                返回商品管理
              </Link>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">
                编辑商品: {product.name}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 商品名称 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                商品名称 *
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
                商品价格 (元) *
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

            {/* 商品图片 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                商品图片 *
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
                        <X className="w-3 h-3" />
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
                    支持 JPG、PNG、GIF 格式，单个文件不超过 5MB
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

            {/* 商品描述 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                商品描述
              </label>
              <textarea
                {...register("description")}
                rows={4}
                className="input-field"
                placeholder="请输入商品描述（可选）"
              />
            </div>

            {/* 提交按钮 */}
            <div className="flex space-x-4 pt-6">
              <Link
                href="/admin/products"
                className="flex-1 btn-secondary text-center"
              >
                取消
              </Link>
              <button
                type="submit"
                disabled={isUpdating}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {isUpdating ? "保存中..." : "保存更改"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
