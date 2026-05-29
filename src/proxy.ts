import { auth } from "@/lib/auth";

// Protect all /admin routes (except the login page) using the Auth.js
// `authorized` callback. Public routes are untouched.
export default auth;

export const config = {
  matcher: ["/admin/:path*"],
};
