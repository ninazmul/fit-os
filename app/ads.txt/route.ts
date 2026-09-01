export async function GET() {
  const adsTxt = "google.com, pub-1213821838926371, DIRECT, f08c47fec0942fa0\n";
  return new Response(adsTxt, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=86400",
    },
  });
}
