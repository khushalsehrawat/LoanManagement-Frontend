async function login(username, password) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    auth: false,
    body: { username, password }
  });
  localStorage.setItem("LAMF_JWT", data.token);
  return data.token;
}

function logout() {
  localStorage.removeItem("LAMF_JWT");
  window.location.href = "login.html";
}

function requireAuth() {
  const t = localStorage.getItem("LAMF_JWT");
  if (!t) window.location.href = "login.html";
}
