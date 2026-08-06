import { SignIn } from "@clerk/nextjs";
import { buildPublicPageMetadata } from "@/lib/seo";

export const metadata = buildPublicPageMetadata("/sign-in");

export default function Page() {
  return (
    <SignIn />
  );
}
