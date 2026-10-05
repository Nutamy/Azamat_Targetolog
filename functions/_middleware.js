// Pages serves the repository root, so repo-only files would be public. _routes.json sends just these paths
// (plus /api/*) through Functions, and this middleware answers them with the 404 page.
const PRIVATE = /^\/(README\.md|schema\.sql|\.gitignore|\.gitattributes|tailwind\/|docs\/|functions\/)/i;

export async function onRequest({ request, next, env }) {
  if (!PRIVATE.test(new URL(request.url).pathname)) return next();
  const page = await env.ASSETS.fetch(new URL("/404.html", request.url));
  return new Response(page.body, { status: 404, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}
