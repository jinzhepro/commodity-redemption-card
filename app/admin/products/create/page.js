"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, X } from "lucide-react";
import { useCreateProductMutation } from "@/store/api";
import toast from "react-hot-toast";

/**
 * 创建商品页面
 */
export default function CreateProductPage() {
  const router = useRouter();
  const [createProduct, { isLoading }] = useCreateProductMutation();
  const [isDragOver, setIsDragOver] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      images: [],
    },
  });

  /**
   * 处理文件上传（支持拖拽和点击）
   */
  const processFiles = async (files) => {
    if (!files || files.length === 0) return;

    const currentImages = watch("images") || [];
    const maxImages = 6; // 最大图片数量限制

    // 检查图片数量限制
    if (currentImages.length + files.length > maxImages) {
      toast.error(
        `最多只能上传${maxImages}张图片，当前已有${currentImages.length}张`
      );
      return;
    }

    const validFiles = [];
    const fileArray = Array.from(files);

    // 验证所有文件
    for (const file of fileArray) {
      // 验证文件类型
      if (!file.type.startsWith("image/")) {
        toast.error(`文件 ${file.name} 不是有效的图片格式`);
        continue;
      }

      // 验证文件大小 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`文件 ${file.name} 大小超过5MB限制`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // 显示上传进度提示
    const loadingToast = toast.loading(`正在上传${validFiles.length}张图片...`);

    try {
      // 并行处理所有有效文件
      const imagePromises = validFiles.map((file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const base64 = event.target?.result;
            if (base64) {
              resolve(base64);
            } else {
              reject(new Error(`读取文件 ${file.name} 失败`));
            }
          };
          reader.onerror = () =>
            reject(new Error(`读取文件 ${file.name} 失败`));
          reader.readAsDataURL(file);
        });
      });

      const newImages = await Promise.all(imagePromises);

      // 更新图片数组
      setValue("images", [...currentImages, ...newImages]);

      toast.dismiss(loadingToast);
      toast.success(`成功上传${newImages.length}张图片`);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("图片上传失败，请重试");
      console.error("图片上传错误:", error);
    }
  };

  /**
   * 处理图片上传
   */
  const handleImageUpload = async (e) => {
    const files = e.target.files;
    await processFiles(files);
    // 清空文件输入框
    e.target.value = "";
  };

  /**
   * 处理拖拽进入
   */
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  /**
   * 处理拖拽离开
   */
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  /**
   * 处理拖拽悬停
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  /**
   * 处理文件拖拽放置
   */
  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    await processFiles(files);
  };

  /**
   * 删除指定图片
   */
  const removeImage = (index) => {
    const currentImages = watch("images") || [];
    const updatedImages = currentImages.filter((_, i) => i !== index);
    setValue("images", updatedImages);
    toast.success("图片删除成功");
  };

  /**
   * 清空所有图片
   */
  const clearAllImages = () => {
    setValue("images", []);
    toast.success("已清空所有图片");
  };

  /**
   * 提交表单
   */
  const onSubmit = async (data) => {
    try {
      await createProduct({
        name: data.name,
        price: Number(data.price),
        images: data.images,
        description: data.description,
      }).unwrap();

      toast.success("商品创建成功！");
      router.push("/admin/products");
    } catch (error) {
      console.error("创建商品失败:", error);
      toast.error(error?.data?.error || "创建商品失败，请重试");
    }
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
                href="/admin/products"
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                返回商品管理
              </Link>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-900">创建商品</h1>
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
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  商品图片 *
                  {imagesPreviews.length > 0 && (
                    <span className="ml-2 text-xs text-gray-500">
                      ({imagesPreviews.length}/6)
                    </span>
                  )}
                </label>
                {imagesPreviews.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllImages}
                    className="text-xs text-red-600 hover:text-red-800 transition-colors"
                  >
                    清空所有图片
                  </button>
                )}
              </div>

              {/* 已上传图片预览 */}
              {imagesPreviews.length > 0 && (
                <div className="mb-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {imagesPreviews.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square overflow-hidden rounded-lg border-2 border-gray-200 hover:border-primary-300 transition-colors">
                          <img
                            src={image}
                            alt={`预览 ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* 删除按钮 */}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                          title="删除图片"
                        >
                          <X className="w-3 h-3" />
                        </button>

                        {/* 图片序号 */}
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1.5 py-0.5 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 图片提示信息 */}
                  <div className="mt-2 text-xs text-gray-500">
                    {imagesPreviews.length < 6 && (
                      <span>还可以上传 {6 - imagesPreviews.length} 张图片</span>
                    )}
                    {imagesPreviews.length >= 6 && (
                      <span className="text-orange-600">
                        已达到最大图片数量限制
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* 上传区域 */}
              {imagesPreviews.length < 6 && (
                <div
                  className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                    isDragOver
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-300 hover:border-primary-400"
                  }`}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="space-y-2">
                    <Upload
                      className={`w-8 h-8 mx-auto transition-colors ${
                        isDragOver ? "text-primary-500" : "text-gray-400"
                      }`}
                    />
                    <div
                      className={`text-sm transition-colors ${
                        isDragOver ? "text-primary-700" : "text-gray-600"
                      }`}
                    >
                      {isDragOver
                        ? "松开鼠标上传图片"
                        : "点击上传图片或拖拽图片到此处"}
                    </div>
                    <div className="text-xs text-gray-500">
                      支持 JPG、PNG、GIF 格式，单个文件不超过 5MB，最多上传6张
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
              )}

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
                disabled={isLoading}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "创建中..." : "创建商品"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
