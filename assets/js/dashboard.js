requireAuth();

const pageContainer = document.getElementById("pageContainer");
const nav = document.getElementById("sideNav");

let cacheProducts = [];
let cacheApps = [];
let cacheLoans = [];
let cacheCollaterals = [];

function setActive(btn) {
  [...nav.querySelectorAll(".nav-link")].forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

nav.addEventListener("click", async (e) => {
  const btn = e.target.closest("button.nav-link");
  if (!btn) return;
  setActive(btn);
  await render(btn.dataset.page);
});

async function render(page) {
  if (page === "overview") return renderOverview();
  if (page === "products") return renderProducts();
  if (page === "applications") return renderApplications();
  if (page === "newApp") return renderNewApplication();
  if (page === "loans") return renderLoans();
  if (page === "collaterals") return renderCollaterals();
  //  if (page === "partnerApi") return renderPartnerApi();

}

async function loadAll() {
  // Load essential data for KPI and lists
  cacheProducts = await apiFetch("/api/products");
  cacheApps = await apiFetch("/api/applications");
  cacheLoans = await apiFetch("/api/loans/active");
  cacheCollaterals = await apiFetch("/api/collateral");
}

function overviewCard(title, value, hint) {
  return `
    <div class="col-md-3">
      <div class="lux-card-soft p-4 h-100">
        <div class="text-muted-lux small">${title}</div>
        <div class="lux-title h3 mt-1">${value}</div>
        <div class="text-muted-lux small mt-2">${hint}</div>
      </div>
    </div>
  `;
}

async function renderOverview() {
  await loadAll();

  const activeLoans = cacheLoans.length;
  const apps = cacheApps.length;
  const products = cacheProducts.length;
  const pledged = cacheCollaterals.filter(c => c.status === "PLEDGED").length;

  pageContainer.innerHTML = `
    <div class="lux-card p-4">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <div class="text-muted-lux">Admin Dashboard</div>
          <h2 class="lux-title mb-0">LAMF Loan Management System</h2>
        </div>
        <div class="lux-badge">
          <span>Lifecycle:</span>
          <span class="text-muted-lux">DRAFT → SUBMITTED → ACTIVE → CLOSED</span>
        </div>
      </div>
      <div class="lux-gradient-line my-3"></div>

      <div class="row g-3">
        ${overviewCard("Products", products, "Business rules: interest, LTV, ranges")}
        ${overviewCard("Applications", apps, "Origination pipeline visibility")}
        ${overviewCard("Active Loans", activeLoans, "Ongoing exposure & repayments")}
        ${overviewCard("Pledged Collateral", pledged, "Mutual fund units lien/pledge status")}
      </div>

      <hr class="my-4">
      <div class="row g-3">
        <div class="col-lg-8">
          <div class="lux-card-soft p-4">
            <h5 class="fw-bold mb-2">How this system works (real LAMF)</h5>
            <div class="text-muted-lux">
              Collateral is captured as MF units and NAV. The system computes collateral value and eligible limit using max LTV.
              Admin submits and approves the application, pledges collateral, and creates an active loan. Repayments reduce outstanding and close the loan.
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="lux-card-soft p-4">
            <h6 class="fw-bold mb-2">Quick Actions</h6>
            <div class="d-grid gap-2">
              <button class="btn btn-lux" onclick="jump('products')">Create Product</button>
              <button class="btn btn-outline-lux" onclick="jump('newApp')">Create Application</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

window.jump = async function(page){
  const btn = nav.querySelector(`button[data-page="${page}"]`);
  if (btn) { setActive(btn); await render(page); }
};

// ---------------- Products ----------------
async function renderProducts() {
  cacheProducts = await apiFetch("/api/products");

  pageContainer.innerHTML = `
    <div class="lux-card p-4">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <h2 class="lux-title mb-0">Loan Products</h2>
          <div class="text-muted-lux">Configure interest and max LTV rules</div>
        </div>
        <button class="btn btn-lux" data-bs-toggle="modal" data-bs-target="#productModal">+ Create</button>
      </div>

      <div class="lux-gradient-line my-3"></div>

      <div class="table-responsive">
        <table class="table align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Interest</th>
              <th>Max LTV</th>
              <th>Min</th>
              <th>Max</th>
            </tr>
          </thead>
          <tbody>
            ${cacheProducts.map(p => `
              <tr>
                <td>${p.id}</td>
                <td class="fw-bold">${p.name}</td>
                <td>${p.interestRate}%</td>
                <td>${(p.maxLtv*100).toFixed(0)}%</td>
                <td>${money(p.minAmount)}</td>
                <td>${money(p.maxAmount)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById("btnCreateProduct").onclick = async () => {
    try {
      const body = {
        name: document.getElementById("p_name").value.trim(),
        interestRate: Number(document.getElementById("p_rate").value),
        maxLtv: Number(document.getElementById("p_ltv").value),
        minAmount: Number(document.getElementById("p_min").value),
        maxAmount: Number(document.getElementById("p_max").value)
      };
      await apiFetch("/api/products", { method:"POST", body });
      bootstrap.Modal.getInstance(document.getElementById("productModal")).hide();
      toast("Product created", "success");
      await renderProducts();
    } catch (e) {
      toast(e.message, "error");
    }
  };
}

// ---------------- Applications ----------------
async function renderApplications() {
  cacheApps = await apiFetch("/api/applications");

  pageContainer.innerHTML = `
    <div class="lux-card p-4">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <h2 class="lux-title mb-0">Loan Applications</h2>
          <div class="text-muted-lux">Track drafts → submitted → active</div>
        </div>
        <button class="btn btn-outline-lux" onclick="jump('newApp')">+ New Application</button>
      </div>

      <div class="lux-gradient-line my-3"></div>

      <div class="table-responsive">
        <table class="table align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Requested</th>
              <th>Eligible</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${cacheApps.map(a => `
              <tr>
                <td>${a.id}</td>
                <td>
                  <div class="fw-bold">${a.customer.fullName}</div>
                  <div class="text-muted-lux small">${a.customer.pan}</div>
                </td>
                <td><span class="lux-badge">${a.status}</span></td>
                <td>${money(a.requestedAmount)}</td>
                <td>${money(a.eligibleLimit)}</td>
                <td class="d-flex gap-2">
                  <button class="btn btn-outline-lux btn-sm" onclick="openCollateralModal(${a.id})">Add Collateral</button>
                  <button class="btn btn-outline-lux btn-sm" onclick="submitApp(${a.id})">Submit</button>
                  <button class="btn btn-lux btn-sm" onclick="approveDisburse(${a.id})">Approve/Disburse</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.openCollateralModal = function(appId){
  document.getElementById("c_appId").value = String(appId);
  document.getElementById("c_scheme").value = "";
  document.getElementById("c_units").value = "";
  document.getElementById("c_nav").value = "";
  new bootstrap.Modal(document.getElementById("collateralModal")).show();
};

document.getElementById("btnAddCollateral").onclick = async () => {
  try {
    const appId = Number(document.getElementById("c_appId").value);
    const body = {
      schemeName: document.getElementById("c_scheme").value.trim(),
      units: Number(document.getElementById("c_units").value),
      nav: Number(document.getElementById("c_nav").value)
    };
    await apiFetch(`/api/applications/${appId}/collateral`, { method:"POST", body });
    bootstrap.Modal.getInstance(document.getElementById("collateralModal")).hide();
    toast("Collateral added & eligible limit recalculated", "success");
    await renderApplications();
  } catch (e) {
    toast(e.message, "error");
  }
};

window.submitApp = async function(appId){
  try {
    await apiFetch(`/api/applications/${appId}/submit`, { method:"POST", body:{} });
    toast("Application submitted", "success");
    await renderApplications();
  } catch (e) { toast(e.message, "error"); }
};

window.approveDisburse = async function(appId){
  try {
    const loan = await apiFetch(`/api/applications/${appId}/approve-disburse`, { method:"POST", body:{} });
    toast(`Approved & disbursed. Loan ID: ${loan.id}`, "success");
    await renderApplications();
  } catch (e) { toast(e.message, "error"); }
};

// ---------------- Create Application ----------------
async function renderNewApplication() {
  cacheProducts = await apiFetch("/api/products");

  pageContainer.innerHTML = `
    <div class="lux-card p-4">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <h2 class="lux-title mb-0">Create New Loan Application</h2>
          <div class="text-muted-lux">Capture customer + product + requested amount</div>
        </div>
        <span class="lux-badge">Status starts as DRAFT</span>
      </div>

      <div class="lux-gradient-line my-3"></div>

      <div class="row g-3">
        <div class="col-lg-6">
          <div class="lux-card-soft p-4">
            <h6 class="fw-bold mb-3">Customer Details</h6>
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label text-muted-lux">Full Name</label>
                <input id="a_name" class="form-control" placeholder="Amit Kumar">
              </div>
              <div class="col-12">
                <label class="form-label text-muted-lux">Email</label>
                <input id="a_email" class="form-control" placeholder="amit@gmail.com">
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted-lux">Phone</label>
                <input id="a_phone" class="form-control" placeholder="9876543210">
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted-lux">PAN</label>
                <input id="a_pan" class="form-control" placeholder="AMITP1234Q">
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-6">
          <div class="lux-card-soft p-4">
            <h6 class="fw-bold mb-3">Loan Details</h6>
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label text-muted-lux">Loan Product</label>
                <select id="a_product" class="form-select">
                  ${cacheProducts.map(p => `<option value="${p.id}">${p.name} • LTV ${(p.maxLtv*100).toFixed(0)}%</option>`).join("")}
                </select>
              </div>
              <div class="col-12">
                <label class="form-label text-muted-lux">Requested Amount</label>
                <input id="a_amount" class="form-control" type="number" placeholder="150000">
              </div>
              <div class="col-12 d-grid">
                <button class="btn btn-lux" id="btnCreateApp">Create Application</button>
              </div>
            </div>

            <hr class="my-4">
            <div class="text-muted-lux small">
              After creating, go to <b>Loan Applications</b> and add collateral to compute eligible limit.
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById("btnCreateApp").onclick = async () => {
    try {
      const body = {
        fullName: document.getElementById("a_name").value.trim(),
        email: document.getElementById("a_email").value.trim(),
        phone: document.getElementById("a_phone").value.trim(),
        pan: document.getElementById("a_pan").value.trim(),
        loanProductId: Number(document.getElementById("a_product").value),
        requestedAmount: Number(document.getElementById("a_amount").value)
      };
      const app = await apiFetch("/api/applications", { method:"POST", body });
      toast(`Application created (ID: ${app.id})`, "success");
      await renderApplications();
      jump("applications");
    } catch (e) {
      toast(e.message, "error");
    }
  };
}

// ---------------- Loans ----------------
async function renderLoans() {
  cacheLoans = await apiFetch("/api/loans/active");

  pageContainer.innerHTML = `
    <div class="lux-card p-4">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <h2 class="lux-title mb-0">Ongoing Loans</h2>
          <div class="text-muted-lux">Active exposure, outstanding amounts & repayments</div>
        </div>
      </div>

      <div class="lux-gradient-line my-3"></div>

      <div class="table-responsive">
        <table class="table align-middle">
          <thead>
            <tr>
              <th>Loan ID</th>
              <th>Application</th>
              <th>Customer</th>
              <th>Sanctioned</th>
              <th>Outstanding</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${cacheLoans.map(l => `
              <tr>
                <td class="fw-bold">${l.id}</td>
                <td>#${l.loanApplication.id}</td>
                <td>
                  <div class="fw-bold">${l.loanApplication.customer.fullName}</div>
                  <div class="text-muted-lux small">${l.loanApplication.customer.pan}</div>
                </td>
                <td>${money(l.sanctionedLimit)}</td>
                <td>${money(l.outstandingAmount)}</td>
                <td><span class="lux-badge">${l.status}</span></td>
                <td class="d-flex gap-2">
                  <button class="btn btn-outline-lux btn-sm" onclick="viewRepayments(${l.id})">Repayments</button>
                  <button class="btn btn-lux btn-sm" onclick="openRepayModal(${l.id})">Repay</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>

      <div id="repaymentPanel" class="mt-4"></div>
    </div>
  `;
}

window.openRepayModal = function(loanId){
  document.getElementById("r_loanId").value = String(loanId);
  document.getElementById("r_amount").value = "";
  new bootstrap.Modal(document.getElementById("repayModal")).show();
};

document.getElementById("btnRepay").onclick = async () => {
  try {
    const loanId = Number(document.getElementById("r_loanId").value);
    const body = { amount: Number(document.getElementById("r_amount").value) };
    await apiFetch(`/api/loans/${loanId}/repay`, { method:"POST", body });
    bootstrap.Modal.getInstance(document.getElementById("repayModal")).hide();
    toast("Repayment recorded", "success");
    await renderLoans();
  } catch (e) { toast(e.message, "error"); }
};

window.viewRepayments = async function(loanId){
  try {
    const reps = await apiFetch(`/api/loans/${loanId}/repayments`);
    const html = `
      <div class="lux-card-soft p-4">
        <h6 class="fw-bold mb-2">Repayments • Loan #${loanId}</h6>
        <div class="table-responsive">
          <table class="table mb-0">
            <thead><tr><th>ID</th><th>Amount</th><th>Paid At</th></tr></thead>
            <tbody>
              ${reps.map(r => `
                <tr>
                  <td>${r.id}</td>
                  <td>${money(r.amount)}</td>
                  <td class="text-muted-lux">${new Date(r.paidAt).toLocaleString()}</td>
                </tr>
              `).join("") || `<tr><td colspan="3" class="text-muted-lux">No repayments yet.</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    `;
    document.getElementById("repaymentPanel").innerHTML = html;
  } catch (e) { toast(e.message, "error"); }
};

// ---------------- Collaterals ----------------
async function renderCollaterals() {
  cacheCollaterals = await apiFetch("/api/collateral");

  pageContainer.innerHTML = `
    <div class="lux-card p-4">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <h2 class="lux-title mb-0">Collateral Management</h2>
          <div class="text-muted-lux">Mutual fund units, NAV, value, pledge status</div>
        </div>
      </div>

      <div class="lux-gradient-line my-3"></div>

      <div class="table-responsive">
        <table class="table align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Application</th>
              <th>Scheme</th>
              <th>Units</th>
              <th>NAV</th>
              <th>Value</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${cacheCollaterals.map(c => `
              <tr>
                <td class="fw-bold">${c.id}</td>
                <td>#${c.loanApplication ?? "-"}</td>
                <td>${c.schemeName}</td>
                <td>${Number(c.units).toFixed(2)}</td>
                <td>${Number(c.nav).toFixed(2)}</td>
                <td>${money(c.collateralValue)}</td>
                <td><span class="lux-badge">${c.status}</span></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}




// ---------------- Partner API Tester ----------------
async function renderPartnerApi() {
  // Partner API is NOT JWT-based; it uses X-API-KEY header.
  pageContainer.innerHTML = `
    <div class="lux-card p-4">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <h2 class="lux-title mb-0">Partner API</h2>
          <div class="text-muted-lux">Test machine-to-machine onboarding (X-API-KEY). No JWT required.</div>
        </div>
        <span class="lux-badge">POST /partner/v1/loan-applications</span>
      </div>

      <div class="lux-gradient-line my-3"></div>

      <div class="row g-3">
        <div class="col-lg-5">
          <div class="lux-card-soft p-4 h-100">
            <h6 class="fw-bold mb-3">Request</h6>

            <label class="form-label text-muted-lux">X-API-KEY</label>
            <input id="p_apiKey" class="form-control mb-3" placeholder="DEMO_PARTNER_KEY_123" />

            <div class="row g-2">
              <div class="col-12">
                <label class="form-label text-muted-lux">Full Name</label>
                <input id="p_name" class="form-control" placeholder="Partner User" />
              </div>
              <div class="col-12">
                <label class="form-label text-muted-lux">Email</label>
                <input id="p_email" class="form-control" placeholder="partneruser@gmail.com" />
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted-lux">Phone</label>
                <input id="p_phone" class="form-control" placeholder="9999999999" />
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted-lux">PAN</label>
                <input id="p_pan" class="form-control" placeholder="PARTP1234Z" />
              </div>

              <div class="col-12">
                <label class="form-label text-muted-lux">Loan Product ID</label>
                <input id="p_productId" class="form-control" type="number" placeholder="1" />
              </div>

              <div class="col-12">
                <label class="form-label text-muted-lux">Requested Amount</label>
                <input id="p_amount" class="form-control" type="number" placeholder="150000" />
              </div>

              <div class="col-12 d-grid mt-2">
                <button id="btnPartnerSend" class="btn btn-lux">Send Partner Request</button>
              </div>
            </div>

            <hr class="my-4">

            <div class="text-muted-lux small">
              <b>How it works:</b> Partner calls <code>/partner/v1/loan-applications</code> with <code>X-API-KEY</code>.
              System creates a <b>DRAFT</b> application. Admin later adds collateral, submits, approves & disburses.
            </div>
          </div>
        </div>

        <div class="col-lg-7">
          <div class="lux-card-soft p-4 h-100">
            <h6 class="fw-bold mb-3">Response</h6>
            <div class="d-flex gap-2 mb-3">
              <button id="btnPartnerFillDemo" class="btn btn-outline-lux btn-sm">Fill Demo Data</button>
              <button id="btnPartnerClear" class="btn btn-outline-lux btn-sm">Clear</button>
            </div>

            <pre id="partnerResult" class="p-3" style="border-radius:14px; background: rgba(255,255,255,0.6); border: 1px solid rgba(0,0,0,0.06); min-height: 320px; overflow:auto;"></pre>

            <div class="text-muted-lux small mt-3">
              <b>Tip:</b> If you get 401/403, your API key filter is blocking the request (expected if key is missing/wrong).
            </div>
          </div>
        </div>
      </div>
    </div>
  `;








  /* for testing */
  const elResult = document.getElementById("partnerResult");

  function print(obj) {
    elResult.textContent = typeof obj === "string" ? obj : JSON.stringify(obj, null, 2);
  }

  document.getElementById("btnPartnerFillDemo").onclick = () => {
    document.getElementById("p_apiKey").value = "DEMO_PARTNER_KEY_123";
    document.getElementById("p_name").value = "Partner User";
    document.getElementById("p_email").value = "partneruser@gmail.com";
    document.getElementById("p_phone").value = "9999999999";
    document.getElementById("p_pan").value = "PARTP1234Z";
    document.getElementById("p_productId").value = "1";
    document.getElementById("p_amount").value = "150000";
    print("Ready. Click 'Send Partner Request'.");
  };

  document.getElementById("btnPartnerClear").onclick = () => {
    document.getElementById("p_apiKey").value = "";
    document.getElementById("p_name").value = "";
    document.getElementById("p_email").value = "";
    document.getElementById("p_phone").value = "";
    document.getElementById("p_pan").value = "";
    document.getElementById("p_productId").value = "";
    document.getElementById("p_amount").value = "";
    print("");
  };

  document.getElementById("btnPartnerSend").onclick = async () => {
    try {
      const apiKey = document.getElementById("p_apiKey").value.trim();
      if (!apiKey) throw new Error("X-API-KEY is required");

      const body = {
        fullName: document.getElementById("p_name").value.trim(),
        email: document.getElementById("p_email").value.trim(),
        phone: document.getElementById("p_phone").value.trim(),
        pan: document.getElementById("p_pan").value.trim(),
        loanProductId: Number(document.getElementById("p_productId").value),
        requestedAmount: Number(document.getElementById("p_amount").value)
      };

      // Partner API is not JWT-protected, so auth:false
      const data = await apiFetch("/partner/v1/loan-applications", {
        method: "POST",
        auth: false,
        body,
        headers: { "X-API-KEY": apiKey }
      });

      toast(`Partner application created (ID: ${data.id})`, "success");
      print(data);

      // Optional: refresh app caches if admin wants immediate visibility
      // await renderApplications(); // don't auto-navigate; keep user on this page
    } catch (e) {
      toast(e.message || "Partner request failed", "error");
      print({ error: e.message || String(e) });
    }
  };

  print("Fill inputs and send the request. This simulates a partner integration.");
}


// init
(async function init(){
  try {
    await render("overview");
  } catch (e) {
    toast(e.message || "Failed to load dashboard", "error");
  }
})();
