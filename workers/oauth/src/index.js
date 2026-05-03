// Decap-CMS-compatible GitHub OAuth proxy on Cloudflare Workers.
//
// Routes:
//   GET /auth?provider=github&site_id=<host>&scope=<scopes>
//        → 302 to GitHub authorize, sets oauth_state cookie.
//   GET /callback?code=...&state=...
//        → exchanges code for token, postMessages it to the opener.
//
// Secrets (set via `wrangler secret put`):
//   GITHUB_CLIENT_ID
//   GITHUB_CLIENT_SECRET
//   ALLOWED_ORIGINS   comma-separated allowlist of admin origins, e.g.
//                     "https://blolt.github.io,https://hepp4rep.com,https://hepp4rep.pages.dev"

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/auth") return handleAuthStart(url, env);
    if (url.pathname === "/callback") return handleCallback(request, url, env);
    return new Response("Not found", { status: 404 });
  },
};

function handleAuthStart(url, env) {
  const provider = url.searchParams.get("provider");
  const siteId = url.searchParams.get("site_id") || "";
  const scope = url.searchParams.get("scope") || "repo";

  if (provider !== "github") {
    return new Response("Only github provider supported", { status: 400 });
  }

  const allowed = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const ok = allowed.some(
    (origin) => origin.includes(siteId) || siteId.includes(originHost(origin))
  );
  if (!ok) {
    return new Response(`site_id "${siteId}" is not in ALLOWED_ORIGINS`, {
      status: 403,
    });
  }

  const state = crypto.randomUUID();
  const authUrl = new URL("https://github.com/login/oauth/authorize");
  authUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  authUrl.searchParams.set("scope", scope);
  authUrl.searchParams.set("state", state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: authUrl.toString(),
      "Set-Cookie": `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`,
    },
  });
}

async function handleCallback(request, url, env) {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = readCookie(request.headers.get("Cookie") || "", "oauth_state");

  if (!code || !state) {
    return htmlResponse(buildPostMessage("error", "Missing code or state"));
  }
  if (cookieState && cookieState !== state) {
    return htmlResponse(buildPostMessage("error", "State mismatch"));
  }

  const tokenResp = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  if (!tokenResp.ok) {
    return htmlResponse(
      buildPostMessage("error", `Token exchange failed: ${tokenResp.status}`)
    );
  }
  const data = await tokenResp.json();
  if (!data.access_token) {
    return htmlResponse(
      buildPostMessage("error", data.error || "No access_token in response")
    );
  }

  return htmlResponse(
    buildPostMessage("success", { token: data.access_token, provider: "github" })
  );
}

function readCookie(cookieHeader, name) {
  const match = cookieHeader.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return match ? match[1] : null;
}

function originHost(origin) {
  try {
    return new URL(origin).host;
  } catch {
    return origin;
  }
}

function buildPostMessage(status, payload) {
  const body = typeof payload === "string" ? { error: payload } : payload;
  return `<!doctype html>
<html><body>
<script>
  (function () {
    var msg = "authorization:github:${status}:" + JSON.stringify(${JSON.stringify(body)});
    function send() {
      window.opener && window.opener.postMessage(msg, "*");
    }
    window.addEventListener("message", function (e) {
      if (e.data === "authorizing:github") send();
    }, false);
    send();
  })();
</script>
<p>Authentication ${status}. You can close this window.</p>
</body></html>`;
}

function htmlResponse(body) {
  return new Response(body, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
