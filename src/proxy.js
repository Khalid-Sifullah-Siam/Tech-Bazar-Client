import { NextResponse } from "next/server";
import { auth } from "./lib/auth";
import { headers } from "next/headers"; 

export async function proxy(request) {
   let session = null;

   try {
    session = await auth.api.getSession({
      headers: await headers()
    });
   } catch (error) {
    session = null;
   }

   if(!session){
    return NextResponse.redirect(new URL('/signin', request.url))
   }

   const pathname = request.nextUrl.pathname

   if(pathname === '/pricing' && session.user.role !== 'seller'){
    return NextResponse.redirect(new URL(`/dashboard/${session.user.role}`, request.url))
   }

   if(pathname.startsWith('/dashboard/seller') && session.user.role !== 'seller'){
    return NextResponse.redirect(new URL(`/dashboard/${session.user.role}`, request.url))
   }

   if(pathname.startsWith('/dashboard/seller') && session.user.plan === 'free'){
       return NextResponse.redirect(new URL('/pricing', request.url))
   }

   if(pathname.startsWith('/dashboard/buyer') && session.user.role !== 'buyer'){
    return NextResponse.redirect(new URL(`/dashboard/${session.user.role}`, request.url))
   }

   if(pathname.startsWith('/dashboard/admin') && session.user.role !== 'admin'){
    return NextResponse.redirect(new URL(`/dashboard/${session.user.role}`, request.url))
   }
}

export const config = {
    matcher: ['/profile', '/pricing', '/dashboard/seller/:path*', '/dashboard/buyer/:path*', '/dashboard/admin/:path*']
}
