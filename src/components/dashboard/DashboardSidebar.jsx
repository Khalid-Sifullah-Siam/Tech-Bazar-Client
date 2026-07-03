"use client";
import { authClient } from "@/lib/auth-client";
import { Bars } from "@gravity-ui/icons";
import {Button, Drawer} from "@heroui/react";
import { ChartArea } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BiMoney } from "react-icons/bi";
import { TbAsset } from "react-icons/tb";

export default function DashboardSidebar() {

    const adminItems = [
        {icon: ChartArea, label: "Overview", link: "/dashboard/admin"},
        {icon: BiMoney, label: "User Management", link: "/dashboard/admin/user-management"},
        {icon: BiMoney, label: "Maintain Products", link: "/dashboard/admin/maintain-products"},
        {icon: TbAsset, label: "Transactions", link: "/dashboard/admin/transactions"},
      ];

    const sellerItems = [
        {icon: ChartArea, label: "Overview", link: "/dashboard/seller"},
        {icon: BiMoney, label: "Add Products", link: "/dashboard/seller/add-products"},
        {icon: BiMoney, label: "Products", link: "/dashboard/seller/products"},
        {icon: TbAsset,label: "Subscription History", link: "/dashboard/seller/subscription-history"},
      ];

      const buyerItems = [
        {icon: ChartArea, label: "Overview", link: "/dashboard/buyer"},
        {icon: BiMoney, label: "Products", link: "/dashboard/buyer/products"},
        {icon: TbAsset, label: "Transactions", link: "/dashboard/buyer/transactions"},
      ];


      const {data: session} = authClient.useSession();

      const  role = session?.user?.role;

  const navItems = role === "admin" ? adminItems : role === "seller" ? sellerItems : buyerItems;

  return (
    <>
      <div className="fixed right-4 top-4 z-50 md:hidden">
        <Drawer>
          <Button variant="secondary">
            <Bars />
            Menu
          </Button>
          <Drawer.Backdrop>
            <Drawer.Content placement="right" className="z-50">
              <Drawer.Dialog>
                <Drawer.CloseTrigger />
                <Drawer.Header>
                  <Drawer.Heading>Navigation</Drawer.Heading>
                </Drawer.Header>
                <Drawer.Body>
                  <nav className="flex flex-col gap-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.link}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-default"
                      >
                        <item.icon className="size-5 text-muted" />
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </Drawer.Body>
              </Drawer.Dialog>
            </Drawer.Content>
          </Drawer.Backdrop>
        </Drawer>
      </div>

      <nav className="hidden w-52 flex-col gap-1 border-r pt-5 md:flex">
        <div className="border-b py-3">
          <Image
            src="/logo-xl.png"
            alt="Logo"
            width={160}
            height={100}
            className="h-12 pl-3"
          />
        </div>

        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.link}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-default"
          >
            <item.icon className="size-5 text-muted" />
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
