import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { i18n } from "@/i18n/config"
import { match as matchLocale } from "@formatjs/intl-localematcher"
import Negotiator from "negotiator"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages()
  const locales: string[] = i18n.locales as string[]
  const defaultLocale = i18n.defaultLocale

  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale
  }

  return matchLocale(languages, locales, defaultLocale)
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Crear cliente de Supabase para el middleware
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Interceptar solicitudes a placeholder.svg y redirigir a nuestro endpoint
  if (pathname.endsWith("placeholder.svg")) {
    const url = request.nextUrl.clone()

    // Mantener los parámetros de la URL original
    const params = new URLSearchParams(url.search)

    // Redirigir a nuestro endpoint de API
    url.pathname = "/api/placeholder"

    return NextResponse.rewrite(url)
  }

  // Redirección específica para /restablecer
  if (pathname === "/restablecer") {
    const lang = request.cookies.get("NEXT_LOCALE")?.value || "es"
    const url = request.nextUrl.clone()
    url.pathname = `/${lang}/restablecer`
    return NextResponse.redirect(url)
  }

  // Bypass para rutas de administración
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    console.log("Middleware - Permitiendo acceso directo a ruta admin:", pathname)
    return res
  }

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
  )

  // Redirect if there is no locale
  if (pathnameIsMissingLocale && !pathname.startsWith("/api")) {
    const locale = getLocale(request)

    // e.g. incoming request is /products
    // The new URL is now /en-US/products
    return NextResponse.redirect(new URL(`/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`, request.url))
  }

  // Añadir encabezados de caché para recursos estáticos
  if (
    pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|css|js)$/) ||
    pathname.includes("/images/") ||
    pathname.includes("/videos/")
  ) {
    res.headers.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800")
  }

  return res
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|videos|iconos|sword-slash.css).*)"],
}
