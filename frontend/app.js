const API = "http://localhost:3000";

function setToken(token) {
  localStorage.setItem("token", token);
}

function getToken() {
  return localStorage.getItem("token");
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

async function apiFetch(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(API + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }

  if (!res.ok) throw data;
  return data;
}

function requireAuth() {
  if (!getToken()) {
    alert("Сначала нужно войти (Login)");
    window.location.href = "login.html";
  }
}

function navHTML() {
  return `
    <div style="display:flex; gap:10px; margin-bottom:20px;">
      <a href="products.html">Products</a>
      <a href="create-order.html">Create Order</a>
      <a href="my-orders.html">My Orders</a>
      <button onclick="logout()">Logout</button>
    </div>
    <hr/>
  `;
}

