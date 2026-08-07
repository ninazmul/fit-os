import { SignIn } from "@clerk/nextjs";
import { authAppearance } from "../../authAppearance";
import { buildPublicPageMetadata } from "@/lib/seo";

export const metadata = buildPublicPageMetadata("/sign-in");

export default function Page() {
  return <SignIn appearance={authAppearance} />;
}
