'use client'

import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { FaFacebook } from "react-icons/fa";
import { BsInstagram, BsTwitter } from "react-icons/bs";
import { LiaLinkedin } from "react-icons/lia";
import { usePathname } from "next/navigation";

export default function Footer() {

  const pathname = usePathname();
    if(pathname.includes('dashboard')){
      return null;
    }
  return (
    <footer className="mt-16 border-t bg-background">
      <div className="container mx-auto px-4">
        <div className="grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block">
              <Image
                src="/logo-xl.png"
                alt="Logo"
                width={180}
                height={50}
                className="h-12 w-auto"
              />
            </Link>

            <p className="mt-4 text-sm text-muted-foreground">
              Discover quality products at great prices. Fast delivery,
              secure payments, and exceptional customer service.
            </p>

            <div className="mt-5 flex items-center gap-3">
              <Link
                href="#"
                className="rounded-full border p-2 transition hover:bg-muted"
              >
                <FaFacebook className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="rounded-full border p-2 transition hover:bg-muted"
              >
                <BsInstagram className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="rounded-full border p-2 transition hover:bg-muted"
              >
                <BsTwitter className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                className="rounded-full border p-2 transition hover:bg-muted"
              >
                <LiaLinkedin className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Shop
            </h3>

            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/products" className="hover:text-foreground">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-foreground">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/new-arrivals" className="hover:text-foreground">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/best-selling" className="hover:text-foreground">
                  Best Selling
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Support
            </h3>

            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/contact" className="hover:text-foreground">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-foreground">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
              Contact
            </h3>

            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Dhaka, Bangladesh</span>
              </div>

              <div className="flex gap-3">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+880 1234-567890</span>
              </div>

              <div className="flex gap-3">
                <Mail className="h-4 w-4 shrink-0" />
                <span>support@example.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t py-6 text-center text-sm text-muted-foreground md:flex-row">
          <p>
            © {new Date().getFullYear()} Your Store. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/cookies" className="hover:text-foreground">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}