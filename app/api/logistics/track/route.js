import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * 快递100物流查询API
 * @param {NextRequest} request - 请求对象
 * @returns {Promise<NextResponse>} 响应对象
 */
export async function POST(request) {
  try {
    const { trackingNumber, expressCompany } = await request.json();

    if (!trackingNumber) {
      return NextResponse.json({ error: "快递单号不能为空" }, { status: 400 });
    }

    // 快递100 API 配置
    const customer = process.env.KUAIDI100_CUSTOMER;
    const key = process.env.KUAIDI100_KEY;

    if (!customer || !key) {
      return NextResponse.json(
        { error: "快递100 API 配置缺失" },
        { status: 500 }
      );
    }

    // 构建查询参数
    const param = JSON.stringify({
      com: expressCompany || "auto", // 快递公司编码，auto为自动识别
      num: trackingNumber,
      phone: "", // 手机号后四位，可选
      from: "", // 出发地，可选
      to: "", // 目的地，可选
      resultv2: "1", // 返回结果版本
    });

    // 生成签名
    const sign = crypto
      .createHash("md5")
      .update(param + key + customer)
      .digest("hex")
      .toUpperCase();

    // 构建请求URL
    const url = "https://poll.kuaidi100.com/poll/query.do";
    const formData = new URLSearchParams({
      customer,
      sign,
      param,
    });

    // 调用快递100 API
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    const result = await response.json();
    console.log("快递100 API返回结果:", JSON.stringify(result, null, 2));

    // 检查数据是否存在
    if (!result.data) {
      return NextResponse.json(
        {
          error: "未查询到物流信息",
          code: result.returnCode,
          details: result,
        },
        { status: 404 }
      );
    }

    // 处理物流信息
    const trackingInfo = {
      trackingNumber,
      expressCompany: result.data.com || expressCompany,
      expressCompanyName: getExpressCompanyName(
        result.data.com || expressCompany
      ),
      status: result.data.state,
      statusText: getStatusText(result.data.state),
      updateTime: result.data.updateTime,
      data: result.data || [],
      rawData: result, // 添加原始数据用于调试
    };

    return NextResponse.json(trackingInfo);
  } catch (error) {
    console.error("查询物流信息失败:", error);
    return NextResponse.json({ error: "查询物流信息失败" }, { status: 500 });
  }
}

/**
 * 获取快递公司名称
 * @param {string} code - 快递公司编码
 * @returns {string} 快递公司名称
 */
function getExpressCompanyName(code) {
  const companies = {
    yuantong: "圆通速递",
    zhongtong: "中通快递",
    yunda: "韵达快递",
    shunfeng: "顺丰速运",
    shentong: "申通快递",
    youzhengguonei: "邮政快递包裹",
    jtexpress: "极兔速递",
    jd: "京东物流",
    ems: "EMS",
    youzhengdsbk: "邮政电商标快",
    debangkuaidi: "德邦快递",
    youzhengbk: "邮政标准快递",
    danniao: "菜鸟速递",
    zhongtongkuaiyun: "中通快运",
    shunfengkuaiyun: "顺丰快运",
    kuayue: "跨越速运",
    debangwuliu: "德邦物流",
    jingdongkuaiyun: "京东快运",
    annengwuliu: "安能快运",
    jinguangsudikuaijian: "京广速递",
    huitongkuaidi: "百世快递",
    tiantian: "天天快递",
    zhaijisong: "宅急送",
    quanfengkuaidi: "全峰快递",
    guotongkuaidi: "国通快递",
    suer: "速尔快递",
    youshuwuliu: "优速快递",
  };
  return companies[code] || code || "未知快递公司";
}

/**
 * 获取物流状态文本
 * @param {string} state - 状态码
 * @returns {string} 状态文本
 */
function getStatusText(state) {
  const statusMap = {
    0: "在途中",
    1: "已揽收",
    2: "疑难件",
    3: "已签收",
    4: "退签",
    5: "派件中",
    6: "退回",
  };
  return statusMap[state] || "未知状态";
}
