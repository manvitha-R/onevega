"use client";

import { usePathname } from 'next/navigation';
import Sidebar from './components/Sidebar';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/";
  console.log('Current pathname:', pathname); // Add this to debug

  return (
    <div className="flex">
      {!isLoginPage && <Sidebar clientUserId={''} />}
      <div className={`${!isLoginPage ? 'flex-1' : 'w-full'}`}>
        {children}
      </div>
    </div>
  );
}