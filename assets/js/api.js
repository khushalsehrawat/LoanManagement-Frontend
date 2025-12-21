function getToken() {
  return localStorage.getItem("LAMF_JWT") || "";
}

console.log("TOKEN USED:", getToken());

async function apiFetch(path, { method="GET", body=null, auth=true, headers={} } = {}) {
  console.log("TOKEN USED:", getToken());

  const url = `${window.APP_CONFIG.BASE_URL}${path}`;
  const finalHeaders = { ...headers };
  if (!finalHeaders["Accept"]) finalHeaders["Accept"] = "application/json";
  if (body !== null && body !== undefined && !finalHeaders["Content-Type"]) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body === null || body === undefined ? undefined : JSON.stringify(body)
    });
  } catch (e) {
    throw new Error("Network/CORS error: check backend is running and CORS allows this origin.");
  }

  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
  console.error("API ERROR", {
    url,
    method,
    status: res.status,
    statusText: res.statusText,
    requestBody: body,
    responseBody: data
  });

  const msg =
    (data && (data.message || data.error || data.path)) ||
    (typeof data === "string" ? data : null) ||
    `Request failed (${res.status} ${res.statusText})`;

  throw new Error(msg);
}


  return data;
}

function money(x) {
  const n = Number(x || 0);
  return n.toLocaleString("en-IN", { style:"currency", currency:"INR", maximumFractionDigits: 2 });
}

function toast(message, type="info") {
  const container = document.getElementById("toastContainer");
  if (!container) return alert(message);

  const id = `t_${Date.now()}`;
  const bg = type === "success" ? "bg-success" : type === "error" ? "bg-danger" : "bg-dark";

  const html = `
    <div id="${id}" class="toast align-items-center text-white ${bg} border-0" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;
  container.insertAdjacentHTML("beforeend", html);
  const el = document.getElementById(id);
  const t = new bootstrap.Toast(el, { delay: 3500 });
  t.show();
  el.addEventListener("hidden.bs.toast", () => el.remove());
}
