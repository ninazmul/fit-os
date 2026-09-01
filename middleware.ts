import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  // Protect everything except public landing pages, SEO files, about page, and uploadthing
  "/((?!sign-in|sign-up|fitness-calculator|bmi-calculator|bmr-calculator|tdee-calculator|body-fat-calculator|about|robots.txt|sitemap.xml|manifest.webmanifest|api/uploadthing|api/barcode).*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/",
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
