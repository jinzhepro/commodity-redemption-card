"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { ArrowLeft, Gift, ChevronLeft, ChevronRight } from "lucide-react";
import {
  useVerifyRedeemCodeMutation,
  useCreateOrderMutation,
} from "@/store/api";
import toast from "react-hot-toast";

/**
 * 商品兑换页面
 */
export default function ExchangePage() {
  const [step, setStep] = useState(1); // 1: 验证兑换码, 2: 填写信息, 3: 兑换成功
  const [verifiedProduct, setVerifiedProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [orderId, setOrderId] = useState("");

  const [verifyRedeemCode, { isLoading: isVerifying }] =
    useVerifyRedeemCodeMutation();
  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();

  const {
    register: registerVerify,
    handleSubmit: handleVerifySubmit,
    formState: { errors: verifyErrors },
    getValues: getVerifyValues,
  } = useForm();

  const {
    register: registerOrder,
    handleSubmit: handleOrderSubmit,
    formState: { errors: orderErrors },
  } = useForm();

  /**
   * 验证兑换码
   */
  const onVerifySubmit = async (data) => {
    try {
      const result = await verifyRedeemCode({
        cardNumber: data.cardNumber,
        password: data.password,
      }).unwrap();

      setVerifiedProduct(result);
      setCurrentImageIndex(0);
      setStep(2);
      toast.success("兑换码验证成功！");
    } catch (error) {
      console.error("验证失败:", error);
      toast.error(error?.data?.error || "兑换码验证失败");
    }
  };

  /**
   * 创建订单
   */
  const onOrderSubmit = async (data) => {
    if (!verifiedProduct) return;

    const verifyData = getVerifyValues();

    try {
      const result = await createOrder({
        cardNumber: verifyData.cardNumber,
        password: verifyData.password,
        phone: data.phone,
        address: data.address,
        customerName: data.customerName,
      }).unwrap();

      setOrderId(result.orderId);
      setStep(3);
      toast.success("兑换成功！");
    } catch (error) {
      console.error("兑换失败:", error);
      toast.error(error?.data?.error || "兑换失败");
    }
  };

  /**
   * 重新开始
   */
  const resetForm = () => {
    setStep(1);
    setVerifiedProduct(null);
    setCurrentImageIndex(0);
    setOrderId("");
  };

  /**
   * 切换到上一张图片
   */
  const previousImage = () => {
    if (!verifiedProduct?.images) return;
    setCurrentImageIndex((prev) =>
      prev === 0 ? verifiedProduct.images.length - 1 : prev - 1
    );
  };

  /**
   * 切换到下一张图片
   */
  const nextImage = () => {
    if (!verifiedProduct?.images) return;
    setCurrentImageIndex((prev) =>
      prev === verifiedProduct.images.length - 1 ? 0 : prev + 1
    );
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
            <h1 className="text-lg font-semibold text-gray-900">商品兑换</h1>
            <div className="w-16"></div>
          </div>
        </div>
      </header>

      {/* 进度指示器 */}
      <div className="bg-white border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 1
                    ? "bg-primary-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                1
              </div>
              <span className="ml-2 text-sm text-gray-600">验证兑换码</span>
            </div>
            <div className="flex-1 h-px bg-gray-200 mx-4"></div>
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 2
                    ? "bg-primary-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
              <span className="ml-2 text-sm text-gray-600">填写信息</span>
            </div>
            <div className="flex-1 h-px bg-gray-200 mx-4"></div>
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 3
                    ? "bg-primary-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                3
              </div>
              <span className="ml-2 text-sm text-gray-600">兑换成功</span>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <main className="max-w-md mx-auto px-4 py-6">
        {/* 步骤1: 验证兑换码 */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                验证兑换码
              </h2>
              <p className="text-gray-600">请输入您的卡号和密码</p>
            </div>

            <form
              onSubmit={handleVerifySubmit(onVerifySubmit)}
              className="space-y-4"
            >
              {/* 卡号 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  卡号
                </label>
                <input
                  type="text"
                  {...registerVerify("cardNumber", {
                    required: "请输入卡号",
                  })}
                  className="input-field"
                  placeholder="请输入卡号"
                />
                {verifyErrors.cardNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {verifyErrors.cardNumber.message}
                  </p>
                )}
              </div>

              {/* 密码 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密码
                </label>
                <input
                  type="text"
                  {...registerVerify("password", {
                    required: "请输入密码",
                  })}
                  className="input-field"
                  placeholder="请输入密码"
                />
                {verifyErrors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {verifyErrors.password.message}
                  </p>
                )}
              </div>

              {/* 提交按钮 */}
              <button
                type="submit"
                disabled={isVerifying}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? "验证中..." : "验证兑换码"}
              </button>
            </form>
          </div>
        )}

        {/* 步骤2: 填写信息 */}
        {step === 2 && verifiedProduct && (
          <div className="space-y-6">
            {/* 商品信息 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                商品信息
              </h3>

              {/* 商品图片轮播 */}
              {verifiedProduct.images && verifiedProduct.images.length > 0 && (
                <div className="mb-4">
                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={verifiedProduct.images[currentImageIndex]}
                      alt={verifiedProduct.name}
                      className="w-full h-full object-cover"
                    />
                    {verifiedProduct.images.length > 1 && (
                      <>
                        <button
                          onClick={previousImage}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                          {verifiedProduct.images.map((_, index) => (
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

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">
                  {verifiedProduct.name}
                </h4>
                <p className="text-lg font-bold text-primary-600">
                  ¥{verifiedProduct.price}
                </p>
                {verifiedProduct.description && (
                  <p className="text-gray-600 text-sm">
                    {verifiedProduct.description}
                  </p>
                )}
              </div>
            </div>

            {/* 收货信息表单 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                收货信息
              </h3>

              <form
                onSubmit={handleOrderSubmit(onOrderSubmit)}
                className="space-y-4"
              >
                {/* 收货人姓名 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    收货人姓名
                  </label>
                  <input
                    type="text"
                    {...registerOrder("customerName", {
                      required: "请输入收货人姓名",
                    })}
                    className="input-field"
                    placeholder="请输入收货人姓名"
                  />
                  {orderErrors.customerName && (
                    <p className="mt-1 text-sm text-red-600">
                      {orderErrors.customerName.message}
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
                    {...registerOrder("phone", {
                      required: "请输入手机号",
                      pattern: {
                        value: /^1[3-9]\d{9}$/,
                        message: "请输入正确的手机号",
                      },
                    })}
                    className="input-field"
                    placeholder="请输入手机号"
                  />
                  {orderErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">
                      {orderErrors.phone.message}
                    </p>
                  )}
                </div>

                {/* 收货地址 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    收货地址
                  </label>
                  <textarea
                    {...registerOrder("address", {
                      required: "请输入收货地址",
                    })}
                    rows={3}
                    className="input-field"
                    placeholder="请输入详细的收货地址"
                  />
                  {orderErrors.address && (
                    <p className="mt-1 text-sm text-red-600">
                      {orderErrors.address.message}
                    </p>
                  )}
                </div>

                {/* 按钮 */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 btn-secondary"
                  >
                    返回上一步
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating ? "兑换中..." : "确认兑换"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 步骤3: 兑换成功 */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              兑换成功！
            </h2>
            <p className="text-gray-600 mb-6">
              您的订单已创建成功，我们会尽快为您安排发货。
            </p>

            {orderId && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600 mb-1">订单号</p>
                <p className="font-mono text-lg font-semibold text-gray-900">
                  {orderId}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Link
                href={`/mobile/orders?cardNumber=${
                  getVerifyValues().cardNumber
                }`}
                className="w-full btn-primary block text-center"
              >
                查看订单状态
              </Link>
              <button onClick={resetForm} className="w-full btn-secondary">
                继续兑换
              </button>
              <Link
                href="/mobile"
                className="w-full btn-secondary block text-center"
              >
                返回首页
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
