import { Providers } from './providers';

export const metadata = {
  title: '商品兑换系统',
  description: '商品兑换系统 - 支持卡号兑换、订单查询、物流跟踪',
};

/**
 * 根布局组件
 * @param {Object} props - 组件属性
 * @param {React.ReactNode} props.children - 子组件
 */
export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}