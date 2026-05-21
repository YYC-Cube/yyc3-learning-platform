/**
 * @fileoverview 移动端底部导航组件
 * @description 提供移动端应用的底部导航菜单，支持页面切换和当前页面高亮显示
 * @author YYC³ <admin@0379.email>
 * @version 2.0.0
 * @created 2025-01-30
 * @modified 2025-12-27
 * @copyright Copyright (c) 2025 YYC³
 * @license MIT
 */
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Award, User, BarChart2 } from 'lucide-react';

function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      name: '首页',
      href: '/',
      icon: Home,
      description: '返回首页查看学习概览',
    },
    {
      name: '课程',
      href: '/courses',
      icon: BookOpen,
      description: '浏览和学习AI课程',
    },
    {
      name: '考试',
      href: '/exam',
      icon: Award,
      description: '参加专业考试和测试',
    },
    {
      name: '职业路径',
      href: '/career-path',
      icon: BarChart2,
      description: '查看AI工程师职业发展路径',
    },
    {
      name: '我的',
      href: '/profile',
      icon: User,
      description: '查看个人资料和设置',
    },
  ];

  return (
    <nav
      className="bottom-nav fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg block md:hidden"
      style={{ zIndex: 'var(--z-nav)' }}
      role="navigation"
      aria-label="底部导航"
      data-bottom-nav="true"
    >
      <div className="flex justify-around items-center h-16 px-2 w-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const IconComponent = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-2 px-1 rounded-lg transition-all duration-[var(--transition-fast)] touch-target md:hidden ${
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-primary hover:bg-muted'
              }`}
              aria-label={isActive ? `${item.name} - 当前页面` : item.description}
              aria-current={isActive ? 'page' : undefined}
            >
              <IconComponent
                className="h-6 w-6 mb-1"
                data-testid={`${
                  item.name === '首页'
                    ? 'home'
                    : item.name === '课程'
                      ? 'book'
                      : item.name === '考试'
                        ? 'target'
                        : item.name === '职业路径'
                          ? 'users'
                          : 'user'
                }-icon`}
              />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
