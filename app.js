(function () {
  let branches = loadBranches();
  let products = loadProducts();
  let cabinetProducts = loadCabinetProducts();
  let cabinetProductsVersion = getCabinetProductsVersion();
  let orders = loadOrders();
  let branchMinOrders = loadBranchMinOrders();
  let branchMinOrdersVersion = getBranchMinOrdersVersion();
  let cart = new Map();
  let page = 1;
  let adminPage = 1;
  let cabinetAdminPage = 1;
  let productFormMode = "main";
  const LIST_PAGE_SIZE = 150;
  const SEARCH_HISTORY_LIMIT = 10;
  let productsVersion = getProductsVersion();
  let searchRecords = [];
  let searchHistorySelected = new Set();
  let skipNextQtyChange = false;
  let skipNextMinOrderSync = false;
  let orderSelection = new Set();
  let suggestionSelectedCodes = new Set();
  let overMinAlertSelected = new Set();
  let overMinAlertVisibleKeys = [];
  let suggestionVisibleCodes = [];
  let suggestionsRenderToken = 0;
  let suggestionsContentToken = 0;
  let suggestionSearchTimer = null;
  let ordersListTimer = null;
  let searchSuggestTimer = null;
  let standardSearchSuggestIndex = -1;
  let splitOrderId = null;
  let detailOrderId = null;
  const PAGE_BTN_WINDOW = 7;

  function displayItemName(itemName, itemCode = "") {
    return escapeHtml(cleanDisplayText(itemName, itemCode));
  }

  function displayTextLabel(text, fallback = "") {
    return escapeHtml(cleanDisplayText(text, fallback));
  }

  const els = {
    views: document.querySelectorAll(".view"),
    navItems: document.querySelectorAll(".nav-item"),
    hdrBranch: document.getElementById("hdr-branch"),
    hdrOrderer: document.getElementById("hdr-orderer"),
    hdrBranchDisplay: document.getElementById("hdr-branch-display"),
    hdrDate: document.getElementById("hdr-date"),
    hdrRemark: document.getElementById("hdr-remark"),
    hdrRemarkLabel: document.getElementById("hdr-remark-label"),
    hdrCartCount: document.getElementById("hdr-cart-count"),
    searchCode: document.getElementById("search-code"),
    searchSuggestions: document.getElementById("search-suggestions"),
    searchPreview: document.getElementById("search-preview"),
    searchHistory: document.getElementById("search-history"),
    filterCategory: document.getElementById("filter-category"),
    filterDepartment: document.getElementById("filter-department"),
    filterStock: document.getElementById("filter-stock"),
    productGrid: document.getElementById("product-grid"),
    productPagination: document.getElementById("product-pagination"),
    adminProductPagination: document.getElementById("admin-product-pagination"),
    suggestionsFullList: document.getElementById("suggestions-full-list"),
    suggestionsImportResult: document.getElementById("suggestions-import-result"),
    suggestionSearch: document.getElementById("suggestion-search"),
    suggestionOnlyRestock: document.getElementById("suggestion-only-restock"),
    suggestionFilterCategory: document.getElementById("suggestion-filter-category"),
    suggestionFilterDepartment: document.getElementById("suggestion-filter-department"),
    suggestionBulkBar: document.getElementById("suggestion-bulk-bar"),
    suggestionBulkBranches: document.getElementById("suggestion-bulk-branches"),
    suggestionBulkMinOrder: document.getElementById("suggestion-bulk-min-order"),
    suggestionSelectedCount: document.getElementById("suggestion-selected-count"),
    cartCount: document.getElementById("cart-count"),
    cartTotalQty: document.getElementById("cart-total-qty"),
    cartTotalAmount: document.getElementById("cart-total-amount"),
    cartDialog: document.getElementById("cart-dialog"),
    cartDialogBody: document.getElementById("cart-dialog-body"),
    cartDialogSummary: document.getElementById("cart-dialog-summary"),
    ordersList: document.getElementById("orders-list"),
    ordersGrandTotal: document.getElementById("orders-grand-total"),
    ordersManageList: document.getElementById("orders-manage-list"),
    orderFilterSearch: document.getElementById("order-filter-search"),
    orderFilterBranch: document.getElementById("order-filter-branch"),
    orderFilterStatus: document.getElementById("order-filter-status"),
    detailStatusSelect: document.getElementById("detail-status-select"),
    adminProductBody: document.getElementById("admin-product-body"),
    stockEditBody: document.getElementById("stock-edit-body"),
    adminSearch: document.getElementById("admin-search"),
    productCount: document.getElementById("product-count"),
    productFormDialog: document.getElementById("product-form-dialog"),
    productForm: document.getElementById("product-form"),
    productFormTitle: document.getElementById("product-form-title"),
    reportStats: document.getElementById("report-stats"),
    reportOrders: document.getElementById("report-orders"),
    branchList: document.getElementById("branch-list"),
    newBranch: document.getElementById("new-branch"),
    importResult: document.getElementById("import-result"),
    inventoryImportResult: document.getElementById("inventory-import-result"),
    orderImportResult: document.getElementById("order-import-result"),
    cabinetStockEditBody: document.getElementById("cabinet-stock-edit-body"),
    cabinetAdminSearch: document.getElementById("cabinet-admin-search"),
    cabinetAdminPagination: document.getElementById("cabinet-admin-pagination"),
    cabinetImportResult: document.getElementById("cabinet-import-result"),
    detailDialog: document.getElementById("order-detail-dialog"),
    detailTitle: document.getElementById("detail-title"),
    detailContent: document.getElementById("detail-content"),
    orderSplitDialog: document.getElementById("order-split-dialog"),
    orderSplitBody: document.getElementById("order-split-body"),
    btnMergeOrders: document.getElementById("btn-merge-orders"),
    btnSplitOrder: document.getElementById("btn-split-order"),
    btnDeleteOrders: document.getElementById("btn-delete-orders"),
    toast: document.getElementById("toast"),
    cartBar: document.getElementById("cart-bar"),
  };

  let cabinetPage = 1;
  const cabinetCart = new Map();
  let cabinetSearchRecords = [];
  let cabinetSearchHistorySelected = new Set();
  let cabinetSkipNextQtyChange = false;
  let cabinetSearchSuggestTimer = null;
  let cartDialogCtx = null;

  const cabinetEls = {
    hdrBranch: document.getElementById("cab-hdr-branch"),
    hdrOrderer: document.getElementById("cab-hdr-orderer"),
    hdrBranchDisplay: document.getElementById("cab-hdr-branch-display"),
    hdrDate: document.getElementById("cab-hdr-date"),
    hdrRemark: document.getElementById("cab-hdr-remark"),
    hdrRemarkLabel: document.getElementById("cab-hdr-remark-label"),
    hdrOverMinHint: document.getElementById("cab-hdr-over-min-hint"),
    hdrCartCount: document.getElementById("cab-hdr-cart-count"),
    searchCode: document.getElementById("cab-search-code"),
    searchSuggestions: document.getElementById("cab-search-suggestions"),
    searchPreview: document.getElementById("cab-search-preview"),
    searchHistory: document.getElementById("cab-search-history"),
    productGrid: document.getElementById("cab-product-grid"),
    productPagination: document.getElementById("cab-product-pagination"),
    orderImportResult: document.getElementById("cab-order-import-result"),
  };

  const standardOrderingCtx = {
    id: "ordering",
    orderKind: null,
    paginationAttr: "data-page",
    headerSubmitId: "btn-header-submit",
    get page() {
      return page;
    },
    set page(v) {
      page = v;
    },
    get cart() {
      return cart;
    },
    get searchRecords() {
      return searchRecords;
    },
    set searchRecords(v) {
      searchRecords = v;
    },
    get searchHistorySelected() {
      return searchHistorySelected;
    },
    set searchHistorySelected(v) {
      searchHistorySelected = v;
    },
    get skipNextQtyChange() {
      return skipNextQtyChange;
    },
    set skipNextQtyChange(v) {
      skipNextQtyChange = v;
    },
    els: {
      hdrBranch: els.hdrBranch,
      hdrOrderer: els.hdrOrderer,
      hdrBranchDisplay: els.hdrBranchDisplay,
      hdrDate: els.hdrDate,
      hdrRemark: els.hdrRemark,
      hdrRemarkLabel: els.hdrRemarkLabel,
      hdrOverMinHint: document.getElementById("hdr-over-min-hint"),
      hdrCartCount: els.hdrCartCount,
      searchCode: els.searchCode,
      searchSuggestions: els.searchSuggestions,
      searchPreview: els.searchPreview,
      searchHistory: els.searchHistory,
      filterCategory: els.filterCategory,
      filterDepartment: els.filterDepartment,
      filterStock: els.filterStock,
      productGrid: els.productGrid,
      productPagination: els.productPagination,
      orderImportResult: els.orderImportResult,
    },
  };

  const cabinetOrderingCtx = {
    id: "cabinet-reserve",
    orderKind: "cabinet-reserve",
    paginationAttr: "data-cabinet-page",
    headerSubmitId: "cab-btn-header-submit",
    get page() {
      return cabinetPage;
    },
    set page(v) {
      cabinetPage = v;
    },
    get cart() {
      return cabinetCart;
    },
    get searchRecords() {
      return cabinetSearchRecords;
    },
    set searchRecords(v) {
      cabinetSearchRecords = v;
    },
    get searchHistorySelected() {
      return cabinetSearchHistorySelected;
    },
    set searchHistorySelected(v) {
      cabinetSearchHistorySelected = v;
    },
    get skipNextQtyChange() {
      return cabinetSkipNextQtyChange;
    },
    set skipNextQtyChange(v) {
      cabinetSkipNextQtyChange = v;
    },
    els: cabinetEls,
  };

  function getActiveOrderingCtx() {
    return getActiveViewName() === "cabinet-reserve" ? cabinetOrderingCtx : standardOrderingCtx;
  }

  function getOrderingCtxById(id) {
    return id === "cabinet-reserve" ? cabinetOrderingCtx : standardOrderingCtx;
  }

  const CART_BAR_HIDDEN_VIEWS = new Set(["orders", "suggestions", "products"]);

  function getCatalogForCtx(ctx) {
    return ctx?.id === "cabinet-reserve" ? cabinetProducts : products;
  }

  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      els.toast.hidden = true;
    }, 2800);
  }

  function buildPageButtons(current, totalPages, dataAttr) {
    if (totalPages <= 1) return "";
    let start = Math.max(1, current - Math.floor(PAGE_BTN_WINDOW / 2));
    let end = Math.min(totalPages, start + PAGE_BTN_WINDOW - 1);
    start = Math.max(1, end - PAGE_BTN_WINDOW + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => {
      const p = start + i;
      return `<button class="page-btn ${p === current ? "active" : ""}" ${dataAttr}="${p}">${p}</button>`;
    }).join("");
  }

  function renderCurrentView(options = {}) {
    const view = getActiveViewName();
    if (view === "ordering") renderOrdering(options);
    else if (view === "orders") renderOrdersList();
    else if (view === "suggestions") renderSuggestionsPageContent(options);
    else if (view === "cabinet-reserve") renderCabinetReserve(options);
    else if (view === "products") renderProductAdmin();
    else if (view === "reports") renderReports();
    else if (view === "settings") renderBranchSettings();
  }

  function syncOrdersDependentViews() {
    const view = getActiveViewName();
    if (view === "orders") renderOrdersList();
    if (view === "reports") renderReports();
    if (view === "suggestions") renderSuggestionsPageContent({ skipFilterPopulate: true });
  }

  function getProductPrice(product) {
    if (!product) return 0;
    const price = Number(product.sellPrice ?? product.unitPrice);
    return Number.isFinite(price) ? price : 0;
  }

  function getActiveViewName() {
    const active = document.querySelector(".view.active");
    return active?.id?.replace("view-", "") || "ordering";
  }

  /** 购物车与最新商品数据对齐（价格、库存上限） */
  function syncCartWithProducts() {
    [standardOrderingCtx, cabinetOrderingCtx].forEach((ctx) => {
      const catalog = getCatalogForCtx(ctx);
      const next = new Map();
      ctx.cart.forEach(({ quantity, branchName, product }, code) => {
        const latest = catalog.find((p) => p.itemCode === code);
        if (!latest || latest.orderableQty <= 0) return;
        next.set(code, {
          product: latest,
          quantity: Math.min(quantity, latest.orderableQty),
          branchName,
        });
      });
      ctx.cart.clear();
      next.forEach((v, k) => ctx.cart.set(k, v));
    });
    updateCartBar();
    updateOverMinOrderHint(standardOrderingCtx);
    updateOverMinOrderHint(cabinetOrderingCtx);
  }

  /** 保存新货柜预定商品库 */
  function persistCabinetProducts(nextProducts, options = {}) {
    cabinetProducts = sortProductsByClassification(nextProducts);
    saveCabinetProducts(cabinetProducts);
    cabinetProductsVersion = getCabinetProductsVersion();
    syncCartWithProducts();
    if (getActiveViewName() === "cabinet-reserve") renderCabinetReserve({ preserveView: true });
    if (getActiveViewName() === "products") renderCabinetProductAdmin();
    if (options.toast) showToast(options.toast);
  }

  /** 订购建议 min order 更新后同步订货管理 */
  function syncBranchMinOrdersViews(options = {}) {
    branchMinOrders = loadBranchMinOrders();
    branchMinOrdersVersion = getBranchMinOrdersVersion();
    populateSuggestionBulkBranches(true);
    updateOverMinOrderHint(standardOrderingCtx);
    updateOverMinOrderHint(cabinetOrderingCtx);

    const view = getActiveViewName();
    if (view === "ordering") {
      renderOrdering({ preserveView: true });
      Array.from(cart.keys()).forEach((code) => updateProductCardOverMinBadge(standardOrderingCtx, code));
    } else if (view === "suggestions") {
      renderSuggestionsPageContent({ skipFilterPopulate: true });
    } else {
      Array.from(cart.keys()).forEach((code) => updateProductCardOverMinBadge(standardOrderingCtx, code));
      Array.from(cabinetCart.keys()).forEach((code) => updateProductCardOverMinBadge(cabinetOrderingCtx, code));
    }
    if (options.toast) showToast(options.toast);
  }

  function applyMinOrderCellEdit(itemCode, branchName, value) {
    setBranchMinOrderEntry(branchMinOrders, branchName, itemCode, value);
    skipNextMinOrderSync = true;
    saveBranchMinOrders(branchMinOrders);
    branchMinOrdersVersion = getBranchMinOrdersVersion();
    updateOverMinOrderHint(standardOrderingCtx);
    updateOverMinOrderHint(cabinetOrderingCtx);
    const view = getActiveViewName();
    if (view === "ordering") {
      renderOrdering({ preserveView: true });
      updateProductCardOverMinBadge(standardOrderingCtx, itemCode);
    } else if (view === "suggestions") {
      refreshSuggestionSuggestSection();
    }
  }

  function refreshSuggestionSuggestSection() {
    const section = els.suggestionsFullList?.querySelector(
      ".suggestions-matrix-section:not(.suggestions-matrix-section-min-order)"
    );
    if (!section) return;
    const { branchColumns, rows } = buildMinOrderMatrixRows(products, branchMinOrders);
    const lookup = buildSuggestionLookup(products, branchMinOrders);
    const filteredRows = filterSuggestionRows(rows, lookup, branchColumns);
    const title = t("suggestionsPage.matrixSuggestTitle");
    section.outerHTML = renderSuggestionMatrixSection(
      title,
      filteredRows,
      branchColumns,
      lookup,
      "suggest"
    );
  }

  /** 新货柜预定商品库跨页同步 */
  function syncCabinetProductsViews(options = {}) {
    cabinetProducts = loadCabinetProducts();
    cabinetProductsVersion = getCabinetProductsVersion();
    syncCartWithProducts();
    populateFilters(cabinetOrderingCtx);
    if (getActiveViewName() === "cabinet-reserve") renderCabinetReserve({ preserveView: true });
    if (getActiveViewName() === "products") renderCabinetProductAdmin();
    if (options.toast) showToast(options.toast);
  }

  /** 后台更新后，前台所有页面立即同步 */
  function syncAllViews(options = {}) {
    products = loadProducts();
    productsVersion = getProductsVersion();
    const orderRepair = repairOrderItemNames(orders, products);
    if (orderRepair.changed) {
      orders = orderRepair.orders;
      saveOrders(orders);
    }
    branchMinOrders = loadBranchMinOrders();
    branchMinOrdersVersion = getBranchMinOrdersVersion();
    syncCartWithProducts();
    populateFilters();
    renderCurrentView();
    if (options.toast) showToast(options.toast);
  }

  /** 保存商品数据并立即同步全部前台页面 */
  function persistProducts(nextProducts, options = {}) {
    if (options.fromInventoryUpload) {
      resetWarehouseFiltersAfterUpload();
    }
    products = sortProductsByClassification(nextProducts);
    saveProducts(products);
    productsVersion = getProductsVersion();
    if (options.fromInventoryUpload) {
      syncWarehouseProductsViews(options);
    } else {
      syncAllViews(options);
    }
  }

  function updateCartBarVisibility(viewName) {
    if (!els.cartBar) return;
    els.cartBar.hidden = CART_BAR_HIDDEN_VIEWS.has(viewName);
    if (!els.cartBar.hidden) updateCartBar();
  }

  function switchView(name) {
    els.views.forEach((v) => v.classList.toggle("active", v.id === `view-${name}`));
    els.navItems.forEach((n) => n.classList.toggle("active", n.dataset.view === name));
    updateCartBarVisibility(name);
    if (name === "ordering") renderOrdering();
    if (name === "orders") renderOrdersList();
    if (name === "suggestions") renderSuggestionsPage();
    if (name === "cabinet-reserve") renderCabinetReserve();
    if (name === "products") renderProductAdmin();
    if (name === "reports") renderReports();
    if (name === "settings") renderBranchSettings();
  }

  function populateBranchSelects() {
    const prevHdr = els.hdrBranch.value;
    const prevCabHdr = cabinetEls.hdrBranch?.value;
    const prevFilter = els.orderFilterBranch.value;
    const opts = branches.map((b) => `<option value="${escapeHtml(b)}">${escapeHtml(b)}</option>`).join("");
    els.hdrBranch.innerHTML = opts;
    if (cabinetEls.hdrBranch) cabinetEls.hdrBranch.innerHTML = opts;
    els.orderFilterBranch.innerHTML = `<option value="">${t("orders.allBranches")}</option>${opts}`;
    if (branches.length) {
      els.hdrBranch.value = branches.includes(prevHdr) ? prevHdr : branches[0];
      els.hdrBranchDisplay.value = els.hdrBranch.value;
      if (cabinetEls.hdrBranch) {
        cabinetEls.hdrBranch.value = branches.includes(prevCabHdr) ? prevCabHdr : branches[0];
        if (cabinetEls.hdrBranchDisplay) cabinetEls.hdrBranchDisplay.value = cabinetEls.hdrBranch.value;
      }
    }
    if (prevFilter && [...els.orderFilterBranch.options].some((o) => o.value === prevFilter)) {
      els.orderFilterBranch.value = prevFilter;
    }
  }

  function populateFilters(ctx = standardOrderingCtx) {
    const v = ctx.els;
    if (!v.filterCategory || !v.filterDepartment) return;
    const catalog = getCatalogForCtx(ctx);
    const categories = getProductCategories(catalog);
    const catVal = v.filterCategory.value;
    const deptVal = v.filterDepartment.value;
    const departments = getDepartmentsForCategory(catalog, catVal);

    v.filterCategory.innerHTML =
      `<option value="">${t("order.allCategories")}</option>` +
      categories.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
    v.filterDepartment.innerHTML =
      `<option value="">${t("order.allDepartments")}</option>` +
      departments.map((d) => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join("");

    if (categories.includes(catVal)) v.filterCategory.value = catVal;
    if (departments.includes(deptVal)) v.filterDepartment.value = deptVal;
    else v.filterDepartment.value = "";
  }

  function resetWarehouseFiltersAfterUpload() {
    const ctx = standardOrderingCtx;
    ctx.els.searchCode.value = "";
    ctx.searchRecords = [];
    ctx.searchHistorySelected = new Set();
    renderSearchHistory(ctx);
    hideSearchSuggestions(ctx);
    renderSearchPreview(ctx);
    ctx.els.filterCategory.value = "";
    ctx.els.filterDepartment.value = "";
    ctx.els.filterStock.value = "";
    ctx.page = 1;
    page = 1;
  }

  /** 仅同步现货目录购物车（不影响新货柜预定） */
  function syncStandardCartWithProducts() {
    const ctx = standardOrderingCtx;
    const catalog = products;
    const next = new Map();
    ctx.cart.forEach(({ quantity, branchName, product }, code) => {
      const latest = catalog.find((p) => p.itemCode === code);
      if (!latest || latest.orderableQty <= 0) return;
      next.set(code, {
        product: latest,
        quantity: Math.min(quantity, latest.orderableQty),
        branchName,
      });
    });
    ctx.cart.clear();
    next.forEach((v, k) => ctx.cart.set(k, v));
    updateCartBar();
    updateOverMinOrderHint(standardOrderingCtx);
  }

  /** 库存 Excel 上传后：仅刷新现货目录相关页面，新货柜预定保持不变 */
  function syncWarehouseProductsViews(options = {}) {
    syncStandardCartWithProducts();
    populateFilters(standardOrderingCtx);
    const view = getActiveViewName();
    if (view === "ordering") renderOrdering({ preserveView: true });
    else if (view === "orders") renderOrdersList();
    else if (view === "suggestions") renderSuggestionsPageContent({ skipFilterPopulate: false });
    else if (view === "products") renderProductAdmin();
    else if (view === "reports") renderReports();
    if (options.toast) showToast(options.toast);
  }

  function getFilteredProducts(ctx = standardOrderingCtx) {
    const v = ctx.els;
    const catalog = getCatalogForCtx(ctx);
    const code = v.searchCode.value.trim().toLowerCase();
    const category = v.filterCategory?.value || "";
    const department = v.filterDepartment?.value || "";
    const stock = v.filterStock?.value || "";
    const recordSet = new Set(ctx.searchRecords.map((c) => c.toUpperCase()));

    const filtered = catalog.filter((p) => {
      if (ctx.searchRecords.length) {
        if (!recordSet.has(p.itemCode.toUpperCase())) return false;
      } else if (
        code &&
        !p.itemCode.toLowerCase().includes(code) &&
        !p.itemName.toLowerCase().includes(code) &&
        !(p.barcode && String(p.barcode).toLowerCase().includes(code))
      ) {
        return false;
      }
      if (category && p.category !== category) return false;
      if (department && p.department !== department) return false;
      if (stock && getStockStatus(p) !== stock) return false;
      return true;
    });

    return sortProductsByClassification(filtered);
  }

  function addSearchRecord(ctx, itemCode) {
    if (!itemCode) return;
    ctx.searchRecords = ctx.searchRecords.filter((c) => c !== itemCode);
    ctx.searchRecords.push(itemCode);
    if (ctx.searchRecords.length > SEARCH_HISTORY_LIMIT) {
      ctx.searchRecords = ctx.searchRecords.slice(-SEARCH_HISTORY_LIMIT);
    }
    renderSearchHistory(ctx);
  }

  function removeSearchRecord(ctx, itemCode) {
    ctx.searchRecords = ctx.searchRecords.filter((c) => c !== itemCode);
    ctx.searchHistorySelected.delete(itemCode);
    renderSearchHistory(ctx);
    ctx.page = 1;
    renderOrderingView(ctx);
  }

  function getSelectedSearchRecords(ctx) {
    return ctx.searchRecords.filter((c) => ctx.searchHistorySelected.has(c));
  }

  function updateSearchHistoryToolbar(ctx) {
    const historyEl = ctx.els.searchHistory;
    if (!historyEl) return;
    const selectAll = historyEl.querySelector("#search-history-select-all, #cab-search-history-select-all");
    const clearBtn = historyEl.querySelector("#btn-clear-search-history, #cab-btn-clear-search-history");
    if (!selectAll || !clearBtn) return;
    const selectedCount = getSelectedSearchRecords(ctx).length;
    clearBtn.disabled = selectedCount === 0;
    selectAll.checked = ctx.searchRecords.length > 0 && selectedCount === ctx.searchRecords.length;
    selectAll.indeterminate = selectedCount > 0 && selectedCount < ctx.searchRecords.length;
  }

  function clearSelectedSearchRecords(ctx) {
    const selected = getSelectedSearchRecords(ctx);
    if (!selected.length) return;
    const removeSet = new Set(selected);
    ctx.searchRecords = ctx.searchRecords.filter((c) => !removeSet.has(c));
    selected.forEach((c) => ctx.searchHistorySelected.delete(c));
    renderSearchHistory(ctx);
    ctx.page = 1;
    renderOrderingView(ctx);
    showToast(t("order.historyCleared", { n: selected.length }));
  }

  function renderSearchHistory(ctx) {
    const historyEl = ctx.els.searchHistory;
    if (!historyEl) return;
    const prefix = ctx.id === "cabinet-reserve" ? "cab-" : "";
    ctx.searchHistorySelected = new Set(
      [...ctx.searchHistorySelected].filter((c) => ctx.searchRecords.includes(c))
    );
    if (!ctx.searchRecords.length) {
      historyEl.hidden = true;
      historyEl.innerHTML = "";
      return;
    }

    historyEl.hidden = false;
    const catalog = getCatalogForCtx(ctx);
    historyEl.innerHTML = `
      <div class="search-history-head">
        <label class="search-history-select-all">
          <input type="checkbox" id="${prefix}search-history-select-all" />
          <span>${t("order.selectAll")}</span>
        </label>
        <span class="search-history-label">${t("order.searchRecorded")} (${ctx.searchRecords.length})</span>
        <button type="button" class="btn btn-ghost btn-sm" id="${prefix}btn-clear-search-history" disabled>${t("order.clearSelected")}</button>
      </div>
      <div class="search-history-list">
        ${ctx.searchRecords
          .map((code) => {
            const p = catalog.find((x) => x.itemCode === code);
            const label = p ? `${code} · ${p.itemName}` : code;
            const thumb = p ? renderProductThumb(p, 40) : "";
            const checked = ctx.searchHistorySelected.has(code) ? "checked" : "";
            return `
          <div class="search-history-item" data-history-code="${escapeHtml(code)}">
            <button type="button" class="search-history-delete" data-delete-code="${escapeHtml(code)}" aria-label="${t("order.searchDelete")}">
              ${t("order.searchDelete")}
            </button>
            <div class="search-history-slide">
              <div class="search-history-row">
                <input type="checkbox" class="search-history-check" data-history-check="${escapeHtml(code)}" ${checked} aria-label="${escapeHtml(code)}" />
                <button type="button" class="search-history-chip" data-jump-code="${escapeHtml(code)}">
                  <span class="search-history-chip-text">${escapeHtml(label)}</span>
                  ${thumb ? `<span class="search-history-thumb">${thumb}</span>` : ""}
                </button>
              </div>
            </div>
          </div>`;
          })
          .join("")}
      </div>`;
    updateSearchHistoryToolbar(ctx);
  }

  function bindSearchHistorySwipeFor(ctx) {
    const historyEl = ctx.els.searchHistory;
    if (!historyEl || historyEl._swipeBound) return;
    historyEl._swipeBound = true;
    const selectAllId = ctx.id === "cabinet-reserve" ? "cab-search-history-select-all" : "search-history-select-all";
    const clearBtnId = ctx.id === "cabinet-reserve" ? "cab-btn-clear-search-history" : "btn-clear-search-history";
    const DELETE_WIDTH = 72;
    let active = null;
    let dragged = false;

    const closeSwipe = (item) => {
      const slide = item?.querySelector(".search-history-slide");
      if (slide) {
        slide.style.transform = "";
        item.classList.remove("is-open");
      }
    };

    const closeAllExcept = (except) => {
      historyEl.querySelectorAll(".search-history-item.is-open").forEach((item) => {
        if (item !== except) closeSwipe(item);
      });
    };

    const startSwipe = (item, clientX) => {
      dragged = false;
      active = { item, startX: clientX, currentX: 0, width: DELETE_WIDTH };
      closeAllExcept(item);
    };

    const moveSwipe = (clientX) => {
      if (!active) return;
      const delta = clientX - active.startX;
      if (Math.abs(delta) > 4) dragged = true;
      active.currentX = Math.max(-active.width, Math.min(0, delta));
      active.item.querySelector(".search-history-slide").style.transform =
        `translateX(${active.currentX}px)`;
    };

    const endSwipe = () => {
      if (!active) return;
      const { item, currentX, width } = active;
      const slide = item.querySelector(".search-history-slide");
      if (currentX <= -width / 2) {
        slide.style.transform = `translateX(-${width}px)`;
        item.classList.add("is-open");
      } else {
        closeSwipe(item);
      }
      active = null;
    };

    historyEl.addEventListener("touchstart", (e) => {
      if (e.target.closest(".search-history-check")) return;
      const slide = e.target.closest(".search-history-slide");
      if (!slide) return;
      startSwipe(slide.closest(".search-history-item"), e.touches[0].clientX);
    }, { passive: true });

    historyEl.addEventListener("touchmove", (e) => {
      if (!active) return;
      moveSwipe(e.touches[0].clientX);
    }, { passive: true });

    historyEl.addEventListener("touchend", endSwipe);

    historyEl.addEventListener("mousedown", (e) => {
      if (e.target.closest(`.search-history-check, .search-history-select-all, #${clearBtnId}`)) {
        return;
      }
      const slide = e.target.closest(".search-history-slide");
      if (!slide || e.button !== 0) return;
      startSwipe(slide.closest(".search-history-item"), e.clientX);
    });

    historyEl.addEventListener("change", (e) => {
      if (e.target.id === selectAllId) {
        if (e.target.checked) {
          ctx.searchRecords.forEach((c) => ctx.searchHistorySelected.add(c));
        } else {
          ctx.searchHistorySelected.clear();
        }
        historyEl.querySelectorAll(".search-history-check").forEach((cb) => {
          cb.checked = e.target.checked;
        });
        updateSearchHistoryToolbar(ctx);
        return;
      }
      if (e.target.classList.contains("search-history-check")) {
        const code = e.target.dataset.historyCheck;
        if (e.target.checked) ctx.searchHistorySelected.add(code);
        else ctx.searchHistorySelected.delete(code);
        updateSearchHistoryToolbar(ctx);
      }
    });

    historyEl.addEventListener("click", (e) => {
      if (e.target.id === clearBtnId || e.target.closest(`#${clearBtnId}`)) {
        clearSelectedSearchRecords(ctx);
        return;
      }
      const del = e.target.closest("[data-delete-code]");
      if (del) {
        removeSearchRecord(ctx, del.dataset.deleteCode);
        return;
      }
      const jump = e.target.closest("[data-jump-code]");
      if (jump) {
        if (dragged) {
          dragged = false;
          return;
        }
        const item = jump.closest(".search-history-item");
        if (item?.classList.contains("is-open")) {
          closeSwipe(item);
          return;
        }
        scrollToProductCard(ctx, jump.dataset.jumpCode);
      }
    });
  }

  function bindSearchHistorySwipe() {
    bindSearchHistorySwipeFor(standardOrderingCtx);
    bindSearchHistorySwipeFor(cabinetOrderingCtx);
  }

  function focusProductQtyInput(ctx, itemCode) {
    requestAnimationFrame(() => {
      const card = ctx.els.productGrid.querySelector(
        `.product-card[data-code="${CSS.escape(itemCode)}"]`
      );
      const input = card?.querySelector(".qty-input");
      if (input) {
        input.focus();
        input.select();
      }
    });
  }

  function focusSearchInput(ctx) {
    requestAnimationFrame(() => {
      ctx.els.searchCode.focus();
      ctx.els.searchCode.select();
    });
  }

  function addToCartFromCard(ctx, card, { focusSearch = false } = {}) {
    if (!card) return false;
    const code = card.dataset.code;
    const input = card.querySelector(".qty-input");
    if (!input) return false;
    const val = parseInt(input.value, 10) || 0;
    if (val <= 0) return false;
    addToCart(ctx, code, val);
    showToast(t("order.addedToCart"));
    if (focusSearch) focusSearchInput(ctx);
    return true;
  }

  function scrollToProductCard(ctx, itemCode, { focusQty = false } = {}) {
    const filtered = getFilteredProducts(ctx);
    const index = filtered.findIndex((p) => p.itemCode === itemCode);
    if (index >= 0) {
      ctx.page = Math.floor(index / LIST_PAGE_SIZE) + 1;
      renderOrderingView(ctx);
    }
    requestAnimationFrame(() => {
      const card = ctx.els.productGrid.querySelector(
        `.product-card[data-code="${CSS.escape(itemCode)}"]`
      );
      if (!card) return;
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      card.classList.add("product-card-highlight");
      setTimeout(() => card.classList.remove("product-card-highlight"), 2500);
      if (focusQty) focusProductQtyInput(ctx, itemCode);
    });
  }

  function tryAddSearchRecordFromInput(ctx = standardOrderingCtx) {
    const term = ctx.els.searchCode.value.trim();
    if (!term) return false;
    const catalog = getCatalogForCtx(ctx);
    const match = resolveSearchProduct(term, catalog);
    if (!match) return false;
    addSearchRecord(ctx, match.itemCode);
    ctx.els.searchCode.value = "";
    hideSearchSuggestions(ctx);
    renderSearchPreview(ctx);
    ctx.page = 1;
    renderOrderingView(ctx);
    scrollToProductCard(ctx, match.itemCode, { focusQty: true });
    return true;
  }

  function isSpotOrderingCtx(ctx) {
    return ctx?.id === "ordering";
  }

  function isCabinetOrderingCtx(ctx) {
    return ctx?.id === "cabinet-reserve";
  }

  function scoreSearchMatch(p, q) {
    const code = p.itemCode.toLowerCase();
    const barcode = String(p.barcode || "").toLowerCase();
    const name = p.itemName.toLowerCase();
    if (code === q) return 0;
    if (barcode && barcode === q) return 1;
    if (code.startsWith(q)) return 2;
    if (barcode && barcode.startsWith(q)) return 3;
    if (code.includes(q)) return 4;
    if (barcode && barcode.includes(q)) return 5;
    if (name.includes(q)) return 6;
    return 99;
  }

  function toggleSpotSearchClearBtn() {
    const btn = document.getElementById("btn-clear-search-code");
    const input = els.searchCode;
    if (!btn || !input) return;
    btn.hidden = !input.value.trim();
  }

  function updateSearchSuggestionHighlight(ctx) {
    if (!isSpotOrderingCtx(ctx) || !ctx.els.searchSuggestions) return;
    const items = ctx.els.searchSuggestions.querySelectorAll(".search-suggestion-item");
    items.forEach((item, i) => {
      item.classList.toggle("is-active", i === standardSearchSuggestIndex);
    });
    const active = items[standardSearchSuggestIndex];
    if (active) active.scrollIntoView({ block: "nearest" });
  }

  function resolveSearchProduct(term, catalog = products) {
    const q = term.trim().toLowerCase();
    if (!q) return null;
    const exact = catalog.find(
      (p) =>
        p.itemCode.toLowerCase() === q ||
        (p.barcode && String(p.barcode).toLowerCase() === q)
    );
    if (exact) return exact;
    const startsWith = catalog.find(
      (p) =>
        p.itemCode.toLowerCase().startsWith(q) ||
        (p.barcode && String(p.barcode).toLowerCase().startsWith(q))
    );
    if (startsWith) return startsWith;
    return (
      catalog.find(
        (p) =>
          p.itemCode.toLowerCase().includes(q) ||
          p.itemName.toLowerCase().includes(q) ||
          (p.barcode && String(p.barcode).toLowerCase().includes(q))
      ) || null
    );
  }

  function selectSearchSuggestionAt(ctx, index) {
    const items = ctx.els.searchSuggestions?.querySelectorAll(".search-suggestion-item");
    if (!items?.length || index < 0 || index >= items.length) return false;
    jumpToProduct(ctx, items[index].dataset.suggestCode);
    return true;
  }

  function resolveSearchProductForCtx(ctx, term) {
    return resolveSearchProduct(term, getCatalogForCtx(ctx));
  }

  function renderSearchPreview(ctx = standardOrderingCtx) {
    if (!ctx.els.searchPreview) return;
    const term = ctx.els.searchCode.value.trim();
    if (!term) {
      ctx.els.searchPreview.innerHTML = `<div class="search-preview-empty">${t("order.searchPreviewHint")}</div>`;
      return;
    }
    const product = resolveSearchProductForCtx(ctx, term);
    if (!product) {
      ctx.els.searchPreview.innerHTML = `<div class="search-preview-empty search-preview-not-found">${t("order.searchPreviewEmpty")}</div>`;
      return;
    }
    ctx.els.searchPreview.innerHTML = `
      <div class="search-preview-photo">${renderProductThumb(product, 112)}</div>
      <div class="search-preview-info">
        <div class="search-preview-name">${displayItemName(product.itemName, product.itemCode)}</div>
        <div class="search-preview-code">${escapeHtml(product.itemCode)}</div>
      </div>`;
  }

  function getSearchSuggestions(term, catalog = products, ctx = standardOrderingCtx) {
    const q = term.trim().toLowerCase();
    if (!q) return [];
    const matches = catalog.filter((p) => scoreSearchMatch(p, q) < 99);
    if (isSpotOrderingCtx(ctx)) {
      return matches
        .sort((a, b) => scoreSearchMatch(a, q) - scoreSearchMatch(b, q))
        .slice(0, 12);
    }
    return matches
      .filter(
        (p) =>
          p.itemCode.toLowerCase().includes(q) ||
          p.itemName.toLowerCase().includes(q) ||
          (p.barcode && String(p.barcode).toLowerCase().includes(q))
      )
      .slice(0, 10);
  }

  function hideSearchSuggestions(ctx = standardOrderingCtx) {
    if (!ctx.els.searchSuggestions) return;
    ctx.els.searchSuggestions.hidden = true;
    ctx.els.searchSuggestions.innerHTML = "";
    if (isSpotOrderingCtx(ctx)) standardSearchSuggestIndex = -1;
    renderSearchPreview(ctx);
  }

  function renderSearchSuggestions(ctx = standardOrderingCtx) {
    if (!ctx.els.searchSuggestions) return;
    const term = ctx.els.searchCode.value;
    const matches = getSearchSuggestions(term, getCatalogForCtx(ctx), ctx);
    if (!term.trim() || !matches.length) {
      hideSearchSuggestions(ctx);
      return;
    }

    if (isSpotOrderingCtx(ctx)) standardSearchSuggestIndex = -1;

    ctx.els.searchSuggestions.innerHTML = matches
      .map(
        (p, i) => {
          const meta = isSpotOrderingCtx(ctx)
            ? p.barcode
              ? `<span class="search-suggestion-barcode">${escapeHtml(p.barcode)}</span>`
              : `<span class="search-suggestion-meta">${escapeHtml(p.category || p.spec || "")}</span>`
            : `<span class="search-suggestion-meta">${escapeHtml(p.spec || p.category || "")}</span>`;
          return `
      <button type="button" class="search-suggestion-item" data-suggest-code="${escapeHtml(p.itemCode)}" data-suggest-index="${i}">
        ${renderProductThumb(p, 36)}
        <span class="search-suggestion-body">
          <strong class="search-suggestion-code">${escapeHtml(p.itemCode)}</strong>
          <span class="search-suggestion-name">${displayItemName(p.itemName, p.itemCode)}</span>
          ${meta}
        </span>
      </button>`;
        }
      )
      .join("");
    ctx.els.searchSuggestions.hidden = false;
    renderSearchPreview(ctx);
    updateSearchSuggestionHighlight(ctx);
  }

  function jumpToProduct(ctx, itemCode) {
    addSearchRecord(ctx, itemCode);
    ctx.els.searchCode.value = "";
    hideSearchSuggestions(ctx);
    renderSearchPreview(ctx);
    ctx.page = 1;
    renderOrderingView(ctx);
    scrollToProductCard(ctx, itemCode, { focusQty: true });
  }

  function renderProductThumb(p, size = 48) {
    return `<img class="product-thumb" src="${escapeHtml(p.imageUrl)}" alt="${escapeHtml(p.itemName)}" width="${size}" height="${size}" loading="lazy" onerror="this.src='${productImage(p.itemCode, p.itemName)}'" />`;
  }

  function estimateRestockDate() {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  }

  function renderProductCardSuggestion(p, branchName, suggestionLookup) {
    if (!branchName) return "";
    const suggest = suggestionLookup.get(p.itemCode);
    const minOrder = getBranchMinOrder(branchMinOrders, branchName, p.itemCode);

    if (suggest) {
      return `<div class="product-card-suggest product-card-suggest-active" title="${escapeHtml(suggest.reason)}">
        <span class="product-card-suggest-label">${t("order.branchSuggest")}</span>
        <strong class="product-card-suggest-qty">${suggest.suggestedQty}</strong>
        ${minOrder > 0 ? `<span class="product-card-suggest-min">${t("order.minOrderShort", { n: minOrder })}</span>` : ""}
        <span class="product-card-suggest-tag">${escapeHtml(suggest.tag)}</span>
      </div>`;
    }

    if (minOrder > 0) {
      return `<div class="product-card-suggest">
        <span class="product-card-suggest-label">${t("order.branchSuggest")}</span>
        <span class="product-card-suggest-min">${t("order.minOrderShort", { n: minOrder })}</span>
        <span class="product-card-suggest-ok">${t("order.stockSufficient")}</span>
      </div>`;
    }

    return `<div class="product-card-suggest product-card-suggest-muted">
      <span class="product-card-suggest-label">${t("order.branchSuggest")}</span>
      <span class="product-card-suggest-ok">${t("order.stockSufficient")}</span>
    </div>`;
  }

  function renderProductCard(ctx, p, serialNo, suggestionLookup, branchName) {
    const sellPrice = p.sellPrice ?? p.unitPrice;
    const reserved = isCabinetOrderingCtx(ctx) && p.cabinetReserved;
    const available = p.orderableQty > 0 && !reserved;
    const cartQty = ctx.cart.get(p.itemCode)?.quantity || 0;
    const desc = [p.spec, p.category]
      .map((text) => cleanDisplayText(text, ""))
      .filter(Boolean)
      .map(escapeHtml)
      .join(" · ");
    const restockDate = estimateRestockDate();
    const serialHtml =
      serialNo != null
        ? `<span class="product-card-serial">${serialNo}</span>`
        : "";
    const barcodeHtml = p.barcode
      ? `<div class="product-card-barcode" title="${escapeHtml(p.barcode)}"><span class="product-card-barcode-label">${t("order.barcode")}</span>${escapeHtml(p.barcode)}</div>`
      : "";
    const metaHtml = `<div class="product-card-id" title="${escapeHtml(p.itemCode)}">${escapeHtml(p.itemCode)}</div>
        ${barcodeHtml}
        <div class="product-card-meta">
          <span class="product-card-case">${t("order.unitsPerCase", { n: p.caseQty ?? 0, unit: escapeHtml(p.unit || "") })}</span>
        </div>`;

    const compact = isSpotOrderingCtx(ctx);
    const thumbSize = compact ? 80 : 100;
    const cardClass = `product-card${compact ? " product-card-compact" : ""}${available ? "" : " is-sold-out"}`;

    const stockHtml = reserved
      ? `<div class="product-stock-status out-stock product-stock-reserved"><span class="stock-dot"></span>${t("products.cabinetReserved")}</div>`
      : available
      ? `<div class="product-stock-status in-stock"><span class="stock-dot"></span>${t("order.inStock")}</div>`
      : `<div class="product-stock-status out-stock"><span class="stock-dot"></span>${t("order.soldOut")}</div>`;

    const topHtml = compact
      ? `<div class="product-card-top">${metaHtml}<div class="product-card-stock-wrap">${stockHtml}</div></div>`
      : `${metaHtml}${stockHtml}`;

    const qtyValue = cartQty || 1;
    const actionHtml = available
      ? compact
        ? `<div class="product-card-order">
          <div class="product-card-qty-head product-card-qty-head-compact">
            <span class="product-card-qty-label">${t("order.qty")}</span>
            <span class="product-card-price">${formatMoney(sellPrice)}</span>
          </div>
          <div class="qty-stepper">
            <button type="button" class="qty-btn" data-action="dec" aria-label="-">−</button>
            <input type="number" class="qty-input" value="${qtyValue}" min="0" max="${p.orderableQty}" aria-label="${t("order.qty")}" />
            <button type="button" class="qty-btn" data-action="inc" aria-label="+">+</button>
          </div>
          <button type="button" class="product-card-add" data-action="add" aria-label="${t("order.addToCart")}">${t("order.addShort")}</button>
        </div>`
        : `<div class="product-card-footer">
          <span class="product-card-price">${formatMoney(sellPrice)}</span>
        </div>
        <div class="product-card-order">
          <div class="product-card-qty-head">
            <span class="product-card-qty-label">${t("order.qty")}</span>
          </div>
          <div class="qty-stepper">
            <button type="button" class="qty-btn" data-action="dec" aria-label="-">−</button>
            <input type="number" class="qty-input" value="${qtyValue}" min="0" max="${p.orderableQty}" aria-label="${t("order.qty")}" />
            <button type="button" class="qty-btn" data-action="inc" aria-label="+">+</button>
          </div>
          <button type="button" class="product-card-add" data-action="add" aria-label="${t("order.addToCart")}">${t("order.addShort")}</button>
        </div>`
      : reserved
      ? `<div class="product-restock-note product-reserved-note">${t("products.cabinetReserved")}</div>
         <div class="product-card-footer">
           <span class="product-card-price muted">${formatMoney(sellPrice)}</span>
         </div>`
      : `<div class="product-restock-note">${t("order.restocking")} ${t("order.restockExpected", { date: restockDate })}</div>
         <div class="product-card-footer">
           <span class="product-card-price muted">${formatMoney(sellPrice)}</span>
         </div>`;

    const suggestHtml = renderProductCardSuggestion(p, branchName, suggestionLookup);

    const cartEntry = ctx.cart.get(p.itemCode);
    const lineBranch = cartEntry?.branchName || branchName;
    const overMinWarn =
      cartEntry &&
      lineBranch &&
      needsOverOrderReason(branchMinOrders, lineBranch, p.itemCode, cartEntry.quantity)
        ? `<div class="product-card-over-min">${t("order.overMinOnCard", {
            qty: cartEntry.quantity,
            min: getBranchMinOrder(branchMinOrders, lineBranch, p.itemCode),
          })}</div>`
        : "";

    return `
      <article class="${cardClass}" data-code="${escapeHtml(p.itemCode)}">
        ${serialHtml}
        <div class="product-card-image">${renderProductThumb(p, thumbSize)}</div>
        <div class="product-card-body">
          ${topHtml}
          <h3 class="product-card-name">${displayItemName(p.itemName, p.itemCode)}</h3>
          ${desc ? `<p class="product-card-desc">${escapeHtml(desc)}</p>` : ""}
          ${suggestHtml}
          ${overMinWarn}
          ${actionHtml}
        </div>
      </article>`;
  }

  function getOrderingScrollY() {
    return window.scrollY || document.documentElement.scrollTop || 0;
  }

  function restoreOrderingScrollY(scrollY) {
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
    });
  }

  function syncVisibleProductCardQty(ctx, itemCode) {
    const card = ctx.els.productGrid.querySelector(
      `.product-card[data-code="${CSS.escape(itemCode)}"]`
    );
    if (!card) return;
    const input = card.querySelector(".qty-input");
    if (!input || input === document.activeElement) return;
    const cartQty = ctx.cart.get(itemCode)?.quantity || 0;
    input.value = cartQty > 0 ? cartQty : 1;
  }

  function renderOrderingView(ctx, options = {}) {
    const { preserveView = false } = options;
    const scrollY = preserveView ? getOrderingScrollY() : null;
    const currentPage = ctx.page;
    const v = ctx.els;

    populateFilters(ctx);
    const filtered = getFilteredProducts(ctx);
    const totalPages = Math.max(1, Math.ceil(filtered.length / LIST_PAGE_SIZE));
    if (ctx.page > totalPages) ctx.page = totalPages;
    if (preserveView) ctx.page = currentPage;

    const start = (ctx.page - 1) * LIST_PAGE_SIZE;
    const pageItems = filtered.slice(start, start + LIST_PAGE_SIZE);
    const branchName = v.hdrBranch?.value || "";
    const catalog = getCatalogForCtx(ctx);
    const suggestionLookup = buildBranchSuggestionLookup(catalog, branchMinOrders, branchName);

    v.productGrid.innerHTML = pageItems.length
      ? pageItems
          .map((p, i) => renderProductCard(ctx, p, start + i + 1, suggestionLookup, branchName))
          .join("")
      : `<div class="product-grid-empty">${t("order.noProducts")}</div>`;

    const prevAttr = ctx.paginationAttr.includes("cabinet") ? 'data-cabinet-page="prev"' : 'data-page="prev"';
    const nextAttr = ctx.paginationAttr.includes("cabinet") ? 'data-cabinet-page="next"' : 'data-page="next"';
    v.productPagination.innerHTML = `
      <span>${t("order.totalRows", { n: filtered.length })}</span>
      <div class="page-btns">
        <button class="page-btn" ${prevAttr} ${ctx.page <= 1 ? "disabled" : ""}>‹</button>
        ${buildPageButtons(ctx.page, totalPages, ctx.paginationAttr)}
        <button class="page-btn" ${nextAttr} ${ctx.page >= totalPages ? "disabled" : ""}>›</button>
      </div>
      <span>${t("order.perPage", { n: LIST_PAGE_SIZE })}</span>`;

    if (getActiveOrderingCtx().id === ctx.id) updateCartBar();
    if (v.hdrCartCount) {
      v.hdrCartCount.textContent = ctx.cart.size;
    }
    if (preserveView && scrollY != null) restoreOrderingScrollY(scrollY);
    updateOverMinOrderHint(ctx);
  }

  function renderOrdering(options = {}) {
    renderOrderingView(standardOrderingCtx, options);
  }

  function renderCabinetReserve(options = {}) {
    renderOrderingView(cabinetOrderingCtx, options);
  }

  function populateSuggestionFilters() {
    if (!els.suggestionFilterCategory || !els.suggestionFilterDepartment) return;
    const categories = getProductCategories(products);
    const catVal = els.suggestionFilterCategory.value;
    const deptVal = els.suggestionFilterDepartment.value;
    const departments = getDepartmentsForCategory(products, catVal);

    els.suggestionFilterCategory.innerHTML =
      `<option value="">${t("order.allCategories")}</option>` +
      categories.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
    els.suggestionFilterDepartment.innerHTML =
      `<option value="">${t("order.allDepartments")}</option>` +
      departments.map((d) => `<option value="${escapeHtml(d)}">${escapeHtml(d)}</option>`).join("");

    if (categories.includes(catVal)) els.suggestionFilterCategory.value = catVal;
    if (departments.includes(deptVal)) els.suggestionFilterDepartment.value = deptVal;
    else els.suggestionFilterDepartment.value = "";
  }

  function populateSuggestionBulkBranches(force) {
    if (!els.suggestionBulkBranches) return;
    const branchColumns = getOrderMatrixBranchColumns();
    const current = els.suggestionBulkBranches.querySelectorAll(".suggestion-bulk-branch").length;
    if (!force && current === branchColumns.length) return;

    const prevChecked = new Set(
      Array.from(document.querySelectorAll(".suggestion-bulk-branch:checked")).map((el) => el.value)
    );
    els.suggestionBulkBranches.innerHTML = branchColumns
      .map(
        (col) => `
      <label class="suggestions-bulk-branch-check">
        <input type="checkbox" class="suggestion-bulk-branch" value="${escapeHtml(col.name)}" checked />
        <span>${escapeHtml(col.label)}</span>
      </label>`
      )
      .join("");
    if (prevChecked.size) {
      els.suggestionBulkBranches.querySelectorAll(".suggestion-bulk-branch").forEach((el) => {
        el.checked = prevChecked.has(el.value);
      });
    }
  }

  function resetSuggestionFilters() {
    if (els.suggestionSearch) els.suggestionSearch.value = "";
    if (els.suggestionFilterCategory) els.suggestionFilterCategory.value = "";
    if (els.suggestionFilterDepartment) els.suggestionFilterDepartment.value = "";
    if (els.suggestionOnlyRestock) els.suggestionOnlyRestock.checked = false;
    suggestionSelectedCodes.clear();
    renderSuggestionsPage({ showLoading: false });
  }

  function updateSuggestionBulkBar() {
    const n = suggestionSelectedCodes.size;
    if (els.suggestionSelectedCount) {
      els.suggestionSelectedCount.textContent = t("suggestionsPage.selectedCount", { n });
    }
    const selectAll = document.getElementById("suggestion-select-all");
    if (selectAll && suggestionVisibleCodes.length) {
      const allSelected = suggestionVisibleCodes.every((code) => suggestionSelectedCodes.has(code));
      selectAll.checked = allSelected;
      selectAll.indeterminate =
        !allSelected && suggestionVisibleCodes.some((code) => suggestionSelectedCodes.has(code));
    }
  }

  function getSelectedBulkBranches() {
    return Array.from(document.querySelectorAll(".suggestion-bulk-branch:checked")).map((el) => el.value);
  }

  function applyBulkMinOrderEdit() {
    if (!suggestionSelectedCodes.size) {
      showToast(t("suggestionsPage.bulkSelectFirst"));
      return;
    }
    const bulkBranches = getSelectedBulkBranches();
    if (!bulkBranches.length) {
      showToast(t("suggestionsPage.bulkSelectBranch"));
      return;
    }
    const value = parseInt(els.suggestionBulkMinOrder?.value, 10);
    if (!Number.isFinite(value) || value < 0) {
      showToast(t("suggestionsPage.bulkInvalidQty"));
      return;
    }
    let cells = 0;
    suggestionSelectedCodes.forEach((itemCode) => {
      bulkBranches.forEach((branch) => {
        setBranchMinOrderEntry(branchMinOrders, branch, itemCode, value);
        cells += 1;
      });
    });
    skipNextMinOrderSync = true;
    saveBranchMinOrders(branchMinOrders);
    branchMinOrdersVersion = getBranchMinOrdersVersion();
    updateOverMinOrderHint(standardOrderingCtx);
    if (getActiveViewName() === "ordering") {
      renderOrdering({ preserveView: true });
      Array.from(suggestionSelectedCodes).forEach((code) =>
        updateProductCardOverMinBadge(standardOrderingCtx, code)
      );
    }
    renderSuggestionsPageContent({ skipFilterPopulate: true });
    showToast(t("suggestionsPage.bulkApplied", { n: suggestionSelectedCodes.size, cells }));
  }

  function filterSuggestionRows(rows, lookup, branchColumns) {
    const q = (els.suggestionSearch?.value || "").trim().toLowerCase();
    const onlyRestock = !!els.suggestionOnlyRestock?.checked;
    const category = els.suggestionFilterCategory?.value || "";
    const department = els.suggestionFilterDepartment?.value || "";
    return rows.filter((row) => {
      const codeKey = String(row.itemCode || "").trim().toLowerCase();
      const hasSuggest = branchColumns.some((col) => lookup.has(`${codeKey}::${col.key}`));
      if (onlyRestock && !hasSuggest) return false;
      if (category && row.category !== category) return false;
      if (department && row.department !== department) return false;
      if (!q) return true;
      return (
        codeKey.includes(q) ||
        String(row.itemName || "").toLowerCase().includes(q) ||
        String(row.category || "").toLowerCase().includes(q) ||
        String(row.department || "").toLowerCase().includes(q)
      );
    });
  }

  function renderSuggestionMatrixSection(title, rows, branchColumns, lookup, mode) {
    const infoColCount = mode === "minOrder" ? 3 : 2;
    const checkHeader =
      mode === "minOrder"
        ? `<th class="col-check"><input type="checkbox" id="suggestion-select-all" title="${escapeHtml(t("suggestionsPage.selectAll"))}" /></th>`
        : "";
    const branchHeaders = branchColumns
      .map((c) => {
        const thClass = c.key === "pending" ? "col-pending" : "col-branch";
        return `<th class="${thClass}">${escapeHtml(c.label)}</th>`;
      })
      .join("");

    const body = rows
      .map((row) => {
        const codeKey = String(row.itemCode || "").trim().toLowerCase();
        const rowHasSuggest = branchColumns.some((col) => lookup.has(`${codeKey}::${col.key}`));
        const stockLow = row.stockQty < row.safetyStock;
        const branchCells = branchColumns
          .map((col) => {
            const minOrder = row.branches[col.key] || 0;
            const suggest = lookup.get(`${codeKey}::${col.key}`);
            const tdClass =
              col.key === "pending"
                ? "num col-pending sug-matrix-cell"
                : "num col-branch sug-matrix-cell";

            if (mode === "minOrder") {
              return `<td class="${tdClass}" data-branch-key="${escapeHtml(col.key)}" data-branch="${escapeHtml(col.name)}">
                <input
                  type="number"
                  class="sug-min-order-input"
                  data-item-code="${escapeHtml(row.itemCode)}"
                  data-branch="${escapeHtml(col.name)}"
                  value="${minOrder > 0 ? minOrder : ""}"
                  min="0"
                  step="1"
                  placeholder="0"
                  aria-label="${escapeHtml(col.label)}"
                />
              </td>`;
            }

            if (!suggest) {
              return `<td class="${tdClass}"></td>`;
            }

            return `<td class="${tdClass} sug-matrix-cell-active">
              <strong class="sug-qty-value">${suggest.suggestedQty}</strong>
              ${
                suggest.overMinSuggest
                  ? `<span class="tag tag-warn tag-xs">${t("suggestionsPage.overMinYes")}</span>`
                  : ""
              }
            </td>`;
          })
          .join("");

        const rowClass = [
          rowHasSuggest ? "sug-matrix-row-active" : "",
          stockLow ? "sug-matrix-row-low-stock" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return `<tr class="${rowClass}" data-item-code="${escapeHtml(row.itemCode)}">
          ${
            mode === "minOrder"
              ? `<td class="col-check"><input type="checkbox" class="suggestion-row-check" data-item-code="${escapeHtml(row.itemCode)}" ${
                  suggestionSelectedCodes.has(row.itemCode) ? "checked" : ""
                } /></td>`
              : ""
          }
          <td class="col-item-code"><span class="orders-item-code">${escapeHtml(row.itemCode)}</span></td>
          <td class="col-item-name"><span class="orders-item-name">${displayItemName(row.itemName, row.itemCode)}</span></td>
          ${branchCells}
        </tr>`;
      })
      .join("");

    const sectionClass =
      mode === "minOrder"
        ? "suggestions-matrix-section suggestions-matrix-section-min-order panel"
        : "suggestions-matrix-section panel";

    return `
      <section class="${sectionClass}"${mode === "minOrder" ? ' id="min-order-matrix-section"' : ""}>
        <h3 class="suggestions-matrix-title">${escapeHtml(title)}</h3>
        <div class="table-wrap suggestions-matrix-wrap">
          <table class="data-table suggestions-matrix-table">
            <thead>
              <tr class="sug-matrix-group-row">
                <th colspan="${infoColCount}"></th>
                <th colspan="${branchColumns.length}" class="sug-matrix-group-title">${escapeHtml(title)}</th>
              </tr>
              <tr>
                ${checkHeader}
                <th class="col-item-code">${t("products.code")}</th>
                <th class="col-item-name">${t("products.name")}</th>
                ${branchHeaders}
              </tr>
            </thead>
            <tbody>${body}</tbody>
          </table>
        </div>
      </section>`;
  }

  function renderSuggestionsPage(options = {}) {
    const { showLoading = true, skipFilterPopulate = false } = options;
    const contentOptions = { skipFilterPopulate };
    if (!showLoading) {
      renderSuggestionsPageContent(contentOptions);
      return;
    }

    const token = ++suggestionsRenderToken;
    const refreshBtn = document.getElementById("btn-refresh-suggestions");
    if (refreshBtn) refreshBtn.disabled = true;
    if (els.suggestionsFullList) {
      els.suggestionsFullList.innerHTML = `<div class="suggestions-loading panel"><span class="suggestions-loading-spinner"></span><span>${t("suggestionsPage.refreshing")}</span></div>`;
    }

    setTimeout(() => {
      if (token !== suggestionsRenderToken) return;
      try {
        renderSuggestionsPageContent(contentOptions);
      } catch (err) {
        if (els.suggestionsFullList) {
          els.suggestionsFullList.innerHTML = `<div class="empty-state panel">${escapeHtml(err.message || t("suggestionsPage.renderFail"))}</div>`;
        }
      } finally {
        if (token === suggestionsRenderToken && refreshBtn) refreshBtn.disabled = false;
      }
    }, 0);
  }

  function refreshSuggestionsPage() {
    products = loadProducts();
    productsVersion = getProductsVersion();
    branchMinOrders = loadBranchMinOrders();
    branchMinOrdersVersion = getBranchMinOrdersVersion();
    populateSuggestionBulkBranches(true);
    renderSuggestionsPage();
    showToast(t("suggestionsPage.refreshed"));
  }

  function getVisibleOverMinAlertEntries() {
    return filterOverMinAlertEntries(buildOverMinOrderAlertEntries(orders, branchMinOrders));
  }

  function updateOverMinAlertToolbar() {
    const btn = document.getElementById("btn-clear-over-min-alerts");
    const countEl = document.getElementById("over-min-selected-count");
    const n = overMinAlertSelected.size;
    if (btn) btn.disabled = n === 0;
    if (countEl) {
      countEl.textContent = n ? t("suggestionsPage.overMinSelectedCount", { n }) : "";
    }
    const selectAll = document.getElementById("over-min-select-all");
    if (selectAll && overMinAlertVisibleKeys.length) {
      const allChecked = overMinAlertVisibleKeys.every((key) => overMinAlertSelected.has(key));
      const someChecked = overMinAlertVisibleKeys.some((key) => overMinAlertSelected.has(key));
      selectAll.checked = allChecked;
      selectAll.indeterminate = someChecked && !allChecked;
    } else if (selectAll) {
      selectAll.checked = false;
      selectAll.indeterminate = false;
    }
  }

  function clearSelectedOverMinAlerts() {
    if (!overMinAlertSelected.size) {
      showToast(t("suggestionsPage.overMinSelectFirst"));
      return;
    }
    const keys = [...overMinAlertSelected];
    dismissOverMinAlertKeys(keys);
    overMinAlertSelected.clear();
    renderSuggestionsPageContent();
    showToast(t("suggestionsPage.overMinCleared", { n: keys.length }));
  }

  function renderOverMinOrderAlerts() {
    const entries = getVisibleOverMinAlertEntries();
    if (!entries.length) return "";

    overMinAlertVisibleKeys = entries.map((e) => overMinAlertEntryKey(e));
    Array.from(overMinAlertSelected).forEach((key) => {
      if (!overMinAlertVisibleKeys.includes(key)) overMinAlertSelected.delete(key);
    });

    const rows = entries
      .map((e) => {
        const key = overMinAlertEntryKey(e);
        const checked = overMinAlertSelected.has(key);
        return `
      <tr data-alert-key="${escapeHtml(key)}" class="${checked ? "is-selected" : ""}">
        <td class="col-check">
          <input type="checkbox" class="over-min-alert-check" data-alert-key="${escapeHtml(key)}" ${
            checked ? "checked" : ""
          } />
        </td>
        <td class="col-branch"><span class="orders-branch-name">${escapeHtml(e.branchName)}</span></td>
        <td><code class="over-min-order-no">${escapeHtml(e.orderNo)}</code></td>
        <td class="col-item-code">
          <button
            type="button"
            class="link-btn over-min-alert-jump"
            data-item-code="${escapeHtml(e.itemCode)}"
            data-branch="${escapeHtml(e.branchName)}"
            data-quantity="${e.quantity}"
            title="${escapeHtml(t("suggestionsPage.overMinJumpTitle"))}"
          ><code class="orders-item-code">${escapeHtml(e.itemCode)}</code></button>
        </td>
        <td class="col-item-name"><span class="orders-item-name">${displayItemName(e.itemName, e.itemCode)}</span></td>
        <td class="num">${e.quantity}</td>
        <td class="num">${e.minOrder}</td>
        <td class="over-min-reason">${escapeHtml(e.reason)}</td>
      </tr>`;
      })
      .join("");

    return `
      <section class="panel over-min-alerts-panel">
        <div class="over-min-alerts-head">
          <div class="over-min-alerts-head-main">
            <h3>${t("suggestionsPage.overMinAlertsTitle")}</h3>
            <span class="over-min-alerts-count">${t("suggestionsPage.overMinAlertsCount", { n: entries.length })}</span>
          </div>
          <div class="over-min-alerts-actions">
            <span class="over-min-selected-count" id="over-min-selected-count"></span>
            <button
              type="button"
              class="btn btn-ghost btn-sm"
              id="btn-clear-over-min-alerts"
              disabled
              data-i18n="suggestionsPage.overMinClearRecords"
            >${t("suggestionsPage.overMinClearRecords")}</button>
          </div>
        </div>
        <div class="table-wrap">
          <table class="data-table over-min-alerts-table">
            <thead>
              <tr>
                <th class="col-check">
                  <input type="checkbox" id="over-min-select-all" title="${escapeHtml(t("order.selectAll"))}" />
                </th>
                <th>${t("orders.branch")}</th>
                <th>${t("suggestionsPage.overMinColOrderNo")}</th>
                <th class="col-item-code">${t("products.code")}</th>
                <th class="col-item-name">${t("products.name")}</th>
                <th>${t("orders.qty")}</th>
                <th>${t("suggestionsPage.overMinColStandard")}</th>
                <th>${t("suggestionsPage.overMinReason")}</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </section>`;
  }

  function clearMinOrderMatrixHighlight() {
    els.suggestionsFullList
      ?.querySelectorAll(".sug-matrix-row-highlight, .sug-matrix-cell-highlight")
      .forEach((el) => {
        el.classList.remove("sug-matrix-row-highlight", "sug-matrix-cell-highlight");
      });
    els.suggestionsFullList
      ?.querySelectorAll(".sug-matrix-order-qty-badge, .sug-matrix-jump-qty-tag")
      .forEach((el) => el.remove());
  }

  function findMinOrderMatrixRow(itemCode) {
    const section = els.suggestionsFullList?.querySelector("#min-order-matrix-section");
    if (!section || !itemCode) return null;
    return section.querySelector(`tr[data-item-code="${CSS.escape(itemCode)}"]`);
  }

  function findMinOrderMatrixBranchCell(row, branchName) {
    if (!row || !branchName) return null;
    const branchKey = normalizeBranchKey(branchName);
    const byKey = row.querySelector(`td[data-branch-key="${CSS.escape(branchKey)}"]`);
    if (byKey) return byKey;
    return (
      Array.from(row.querySelectorAll("td[data-branch]")).find(
        (td) => normalizeBranchKey(td.dataset.branch) === branchKey
      ) || null
    );
  }

  function applyMinOrderMatrixHighlight(itemCode, branchName, orderQty) {
    clearMinOrderMatrixHighlight();
    const section = document.getElementById("min-order-matrix-section");
    const row = findMinOrderMatrixRow(itemCode);
    if (!row) return false;

    const qty = parseInt(orderQty, 10);
    const cell = findMinOrderMatrixBranchCell(row, branchName);
    row.classList.add("sug-matrix-row-highlight");

    const codeCell = row.querySelector(".col-item-code");
    if (codeCell && Number.isFinite(qty) && qty > 0) {
      const tag = document.createElement("span");
      tag.className = "sug-matrix-jump-qty-tag";
      tag.textContent = t("suggestionsPage.overMinJumpOrderQty", { n: qty });
      codeCell.appendChild(tag);
    }

    if (cell) {
      cell.classList.add("sug-matrix-cell-highlight");
      if (Number.isFinite(qty) && qty > 0) {
        const badge = document.createElement("span");
        badge.className = "sug-matrix-order-qty-badge";
        badge.textContent = t("suggestionsPage.overMinJumpOrderQtyShort", { n: qty });
        cell.appendChild(badge);
      }
      section?.scrollIntoView({ behavior: "smooth", block: "start" });
      cell.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      const input = cell.querySelector(".sug-min-order-input");
      if (input) {
        window.setTimeout(() => input.focus({ preventScroll: true }), 280);
      }
    } else {
      section?.scrollIntoView({ behavior: "smooth", block: "start" });
      row.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return true;
  }

  function focusMinOrderFromOverAlert(itemCode, branchName, orderQty) {
    if (!itemCode || !branchName) return;
    let row = findMinOrderMatrixRow(itemCode);
    if (!row) {
      if (els.suggestionSearch) els.suggestionSearch.value = itemCode;
      if (els.suggestionOnlyRestock?.checked) els.suggestionOnlyRestock.checked = false;
      renderSuggestionsPageContent({ immediate: true, skipFilterPopulate: true });
      row = findMinOrderMatrixRow(itemCode);
    }
    if (!row) {
      showToast(t("suggestionsPage.overMinJumpNotFound"));
      return;
    }
    if (!applyMinOrderMatrixHighlight(itemCode, branchName, orderQty)) {
      showToast(t("suggestionsPage.overMinJumpNotFound"));
    }
  }

  function renderSuggestionsPageContent(options = {}) {
    const { skipFilterPopulate = false, immediate = false } = options;
    const token = ++suggestionsContentToken;

    const run = () => {
      if (token !== suggestionsContentToken) return;
      if (!skipFilterPopulate) populateSuggestionFilters();
      populateSuggestionBulkBranches();
      const { branchColumns, rows } = buildMinOrderMatrixRows(products, branchMinOrders);
      const lookup = buildSuggestionLookup(products, branchMinOrders);

      if (!rows.length) {
        els.suggestionsFullList.innerHTML = `<div class="empty-state panel">${t("suggestionsPage.noProducts")}</div>`;
        return;
      }

      const filteredRows = filterSuggestionRows(rows, lookup, branchColumns);
      suggestionVisibleCodes = filteredRows.map((row) => row.itemCode);
      Array.from(suggestionSelectedCodes).forEach((code) => {
        if (!rows.some((row) => row.itemCode === code)) suggestionSelectedCodes.delete(code);
      });
      updateSuggestionBulkBar();
      const suggestCount = lookup.size;
      const restockProducts = rows.filter((row) =>
        branchColumns.some((col) =>
          lookup.has(`${String(row.itemCode || "").trim().toLowerCase()}::${col.key}`)
        )
      ).length;

      if (!filteredRows.length) {
        els.suggestionsFullList.innerHTML = `
        <div class="suggestions-summary panel">
          <span>${t("suggestionsPage.summaryProducts", { n: rows.length })}</span>
          <span>${t("suggestionsPage.summaryRestock", { n: restockProducts })}</span>
          <span>${t("suggestionsPage.summarySuggestCells", { n: suggestCount })}</span>
        </div>
        ${renderOverMinOrderAlerts()}
        <div class="empty-state panel">${t("suggestionsPage.noMatch")}</div>`;
        updateOverMinAlertToolbar();
        return;
      }

      els.suggestionsFullList.innerHTML = `
      <div class="suggestions-summary panel">
        <span>${t("suggestionsPage.summaryProducts", { n: rows.length })}</span>
        <span>${t("suggestionsPage.summaryRestock", { n: restockProducts })}</span>
        <span>${t("suggestionsPage.summarySuggestCells", { n: suggestCount })}</span>
        <span>${t("suggestionsPage.summaryShowing", { n: filteredRows.length })}</span>
      </div>
      ${renderOverMinOrderAlerts()}
      ${renderSuggestionMatrixSection(
        t("suggestionsPage.matrixGroupTitle"),
        filteredRows,
        branchColumns,
        lookup,
        "minOrder"
      )}
      ${renderSuggestionMatrixSection(
        t("suggestionsPage.matrixSuggestTitle"),
        filteredRows,
        branchColumns,
        lookup,
        "suggest"
      )}
      <p class="suggestions-footnote panel">${t("suggestionsPage.matrixFootnote")}</p>`;
      updateSuggestionBulkBar();
      updateOverMinAlertToolbar();
    };

    if (!immediate && filteredRowsWillBeHeavy()) {
      requestAnimationFrame(run);
    } else {
      run();
    }

    function filteredRowsWillBeHeavy() {
      const q = (els.suggestionSearch?.value || "").trim().toLowerCase();
      const onlyRestock = !!els.suggestionOnlyRestock?.checked;
      const category = els.suggestionFilterCategory?.value || "";
      const department = els.suggestionFilterDepartment?.value || "";
      if (q || onlyRestock || category || department) return false;
      return products.length > 200;
    }
  }

  function getCartOverMinLines(ctx) {
    const branch = ctx.els.hdrBranch?.value;
    if (!branch) return [];
    const lines = [];
    ctx.cart.forEach(({ product, quantity, branchName }) => {
      const lineBranch = branchName || branch;
      if (needsOverOrderReason(branchMinOrders, lineBranch, product.itemCode, quantity)) {
        lines.push({
          itemCode: product.itemCode,
          itemName: product.itemName,
          quantity,
          minOrder: getBranchMinOrder(branchMinOrders, lineBranch, product.itemCode),
        });
      }
    });
    return lines;
  }

  function updateOverMinOrderHint(ctx = standardOrderingCtx) {
    const v = ctx.els;
    const hintEl = v.hdrOverMinHint;
    const overLines = getCartOverMinLines(ctx);
    const hasOver = overLines.length > 0;
    const remark = v.hdrRemark?.value.trim() || "";
    const blocked = hasOver && !remark;

    if (hintEl) {
      if (!hasOver) {
        hintEl.hidden = true;
        hintEl.textContent = "";
      } else {
        hintEl.hidden = false;
        hintEl.textContent = t("cart.needOverOrderReasonDetail", {
          items: overLines
            .map((l) => `${l.itemCode}×${l.quantity} (min ${l.minOrder})`)
            .join("、"),
        });
      }
    }

    if (v.hdrRemark) {
      if (hasOver) {
        v.hdrRemark.setAttribute("aria-required", "true");
        v.hdrRemark.classList.toggle("remark-required-over-min", blocked);
        if (!remark) {
          v.hdrRemark.placeholder = t("order.remarkPlaceholderOverMin");
        } else {
          v.hdrRemark.placeholder = t("order.remarkPlaceholder");
        }
      } else {
        v.hdrRemark.removeAttribute("aria-required");
        v.hdrRemark.classList.remove("remark-required-over-min");
        v.hdrRemark.placeholder = t("order.remarkPlaceholder");
      }
    }

    if (v.hdrRemarkLabel) {
      v.hdrRemarkLabel.textContent = hasOver
        ? t("order.remarkRequiredOverMin")
        : t("order.remark");
    }

    const submitIds = [ctx.headerSubmitId];
    if (getActiveOrderingCtx().id === ctx.id) {
      submitIds.push("btn-submit-order", "btn-cart-dialog-submit");
    }
    submitIds.forEach((id) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.disabled = blocked;
      btn.title = blocked ? t("cart.needOverOrderReason") : "";
    });
  }

  function updateProductCardOverMinBadge(ctx, itemCode) {
    const card = ctx.els.productGrid?.querySelector(
      `.product-card[data-code="${CSS.escape(itemCode)}"]`
    );
    if (!card) return;
    const cartEntry = ctx.cart.get(itemCode);
    const branchName = cartEntry?.branchName || ctx.els.hdrBranch?.value;
    let warn = card.querySelector(".product-card-over-min");
    const needsWarn =
      cartEntry &&
      branchName &&
      needsOverOrderReason(branchMinOrders, branchName, itemCode, cartEntry.quantity);

    if (!needsWarn) {
      warn?.remove();
      return;
    }

    const text = t("order.overMinOnCard", {
      qty: cartEntry.quantity,
      min: getBranchMinOrder(branchMinOrders, branchName, itemCode),
    });
    if (!warn) {
      warn = document.createElement("div");
      warn.className = "product-card-over-min";
      const anchor = card.querySelector(".product-card-order") || card.querySelector(".product-restock-note");
      if (anchor) card.querySelector(".product-card-body")?.insertBefore(warn, anchor);
    }
    warn.textContent = text;
  }

  function addToCart(ctx, itemCode, qty, branchName) {
    const catalog = getCatalogForCtx(ctx);
    const product = catalog.find((p) => p.itemCode === itemCode);
    if (!product || product.orderableQty <= 0) {
      showToast(t("toast.notOrderable"));
      return;
    }
    const quantity = Math.min(Math.max(parseInt(qty, 10) || 0, 0), product.orderableQty);
    const existing = ctx.cart.get(itemCode);
    const branch = branchName || existing?.branchName || ctx.els.hdrBranch.value;
    if (branchName && ctx.els.hdrBranch) {
      ctx.els.hdrBranch.value = branchName;
      if (ctx.els.hdrBranchDisplay) ctx.els.hdrBranchDisplay.value = branchName;
    }
    if (quantity <= 0) {
      ctx.cart.delete(itemCode);
    } else {
      ctx.cart.set(itemCode, { product, quantity, branchName: branch });
    }
    if (getActiveOrderingCtx().id === ctx.id) updateCartBar();
    if (ctx.els.hdrCartCount) ctx.els.hdrCartCount.textContent = ctx.cart.size;
    syncVisibleProductCardQty(ctx, itemCode);
    updateProductCardOverMinBadge(ctx, itemCode);
    updateOverMinOrderHint(ctx);
    if (els.cartDialog?.open && cartDialogCtx?.id === ctx.id) renderCartDialog(ctx);
  }

  function applyOrderImportLines(ctx, lines) {
    let added = 0;
    let noStock = 0;
    const branch = ctx.els.hdrBranch?.value || "";

    const catalog = getCatalogForCtx(ctx);

    lines.forEach(({ itemCode, quantity }) => {
      const product = findProductByCode(catalog, itemCode);
      if (!product || product.orderableQty <= 0) {
        noStock += 1;
        return;
      }
      const finalQty = Math.min(
        Math.max(parseInt(quantity, 10) || 0, 0),
        product.orderableQty
      );
      if (finalQty <= 0) {
        noStock += 1;
        return;
      }
      ctx.cart.set(product.itemCode, { product, quantity: finalQty, branchName: branch });
      addSearchRecord(ctx, product.itemCode);
      added += 1;
      syncVisibleProductCardQty(ctx, product.itemCode);
      updateProductCardOverMinBadge(ctx, product.itemCode);
    });

    if (getActiveOrderingCtx().id === ctx.id) updateCartBar();
    if (ctx.els.hdrCartCount) ctx.els.hdrCartCount.textContent = ctx.cart.size;
    updateOverMinOrderHint(ctx);
    if (els.cartDialog?.open && cartDialogCtx?.id === ctx.id) renderCartDialog(ctx);
    renderOrderingView(ctx);
    return { added, noStock };
  }

  function renderCartDialog(ctx = cartDialogCtx || getActiveOrderingCtx()) {
    if (!els.cartDialogBody) return;
    if (!ctx.cart.size) {
      els.cartDialogBody.innerHTML = `<div class="empty-state">${t("cart.empty")}</div>`;
      if (els.cartDialogSummary) els.cartDialogSummary.innerHTML = "";
      return;
    }

    let totalQty = 0;
    let totalAmount = 0;
    const sortedCart = Array.from(ctx.cart.values()).sort((a, b) =>
      a.product.itemCode.localeCompare(b.product.itemCode, undefined, { numeric: true })
    );
    const rows = sortedCart
      .map(({ product, quantity, branchName }, index) => {
        const latest = getCatalogForCtx(ctx).find((p) => p.itemCode === product.itemCode) || product;
        const sellPrice = getProductPrice(latest);
        const subtotal = quantity * sellPrice;
        const branch = branchName || ctx.els.hdrBranch?.value;
        const minOrder = branch ? getBranchMinOrder(branchMinOrders, branch, latest.itemCode) : 0;
        const overMin = needsOverOrderReason(branchMinOrders, branch, latest.itemCode, quantity);
        totalQty += quantity;
        totalAmount += subtotal;
        return `
        <div class="cart-line${overMin ? " cart-line-over-min" : ""}" data-cart-code="${escapeHtml(latest.itemCode)}">
          <div class="cart-col cart-col-no" aria-hidden="true">${index + 1}</div>
          <div class="cart-col cart-col-img">${renderProductThumb(latest, 52)}</div>
          <div class="cart-col cart-col-product">
            <code class="cart-line-code">${escapeHtml(latest.itemCode)}</code>
            <span class="cart-line-name" title="${displayItemName(latest.itemName, latest.itemCode)}">${displayItemName(latest.itemName, latest.itemCode)}</span>
            ${
              overMin
                ? `<span class="cart-over-min-tag">${t("order.overMinOnCard", { qty: quantity, min: minOrder })}</span>`
                : ""
            }
          </div>
          <div class="cart-col cart-col-price">${formatMoney(sellPrice)}</div>
          <div class="cart-col cart-col-qty">
            <div class="qty-stepper cart-qty-stepper">
              <button type="button" class="qty-btn" data-cart-action="dec" aria-label="-">−</button>
              <input type="number" class="qty-input cart-qty-input" value="${quantity}" min="0" max="${latest.orderableQty}" aria-label="${t("order.qty")}" />
              <button type="button" class="qty-btn" data-cart-action="inc" aria-label="+">+</button>
            </div>
          </div>
          <div class="cart-col cart-col-subtotal">${formatMoney(subtotal)}</div>
          <div class="cart-col cart-col-action">
            <button type="button" class="link-btn danger cart-remove-btn" data-cart-remove="${escapeHtml(latest.itemCode)}">${t("cart.remove")}</button>
          </div>
        </div>`;
      })
      .join("");

    els.cartDialogBody.innerHTML = `
      <div class="cart-list">
        <div class="cart-list-header" aria-hidden="true">
          <div class="cart-col cart-col-no">#</div>
          <div class="cart-col cart-col-img">${t("order.image")}</div>
          <div class="cart-col cart-col-product">${t("products.code")} / ${t("products.name")}</div>
          <div class="cart-col cart-col-price">${t("orders.price")}</div>
          <div class="cart-col cart-col-qty">${t("orders.qty")}</div>
          <div class="cart-col cart-col-subtotal">${t("orders.subtotal")}</div>
          <div class="cart-col cart-col-action">${t("orders.actions")}</div>
        </div>
        <div class="cart-list-body">${rows}</div>
      </div>`;

    if (els.cartDialogSummary) {
      els.cartDialogSummary.innerHTML = `
        <div class="cart-summary-item"><span class="cart-summary-label">${t("cart.selected")}</span><strong>${ctx.cart.size}</strong></div>
        <div class="cart-summary-item"><span class="cart-summary-label">${t("cart.totalQty")}</span><strong>${totalQty}</strong></div>
        <div class="cart-summary-item cart-summary-total"><span class="cart-summary-label">${t("cart.totalAmount")}</span><strong>${formatMoney(totalAmount)}</strong></div>`;
    }
    updateOverMinOrderHint(ctx);
  }

  function openCartDialog(ctx) {
    cartDialogCtx = ctx || getActiveOrderingCtx();
    renderCartDialog(cartDialogCtx);
    els.cartDialog.showModal();
  }

  function updateCartBar() {
    const ctx = getActiveOrderingCtx();
    let count = 0;
    let totalQty = 0;
    let totalAmount = 0;
    ctx.cart.forEach(({ product, quantity }) => {
      count += 1;
      totalQty += quantity;
      totalAmount += quantity * getProductPrice(product);
    });
    els.cartCount.textContent = count;
    if (standardOrderingCtx.els.hdrCartCount) {
      standardOrderingCtx.els.hdrCartCount.textContent = standardOrderingCtx.cart.size;
    }
    if (cabinetOrderingCtx.els.hdrCartCount) {
      cabinetOrderingCtx.els.hdrCartCount.textContent = cabinetOrderingCtx.cart.size;
    }
    els.cartTotalQty.textContent = totalQty;
    els.cartTotalAmount.textContent = formatMoney(totalAmount);
  }

  function resetVisibleProductQtyInputs(ctx, itemCodes) {
    itemCodes.forEach((code) => {
      const card = ctx.els.productGrid?.querySelector(
        `.product-card[data-code="${CSS.escape(code)}"]`
      );
      if (!card) return;
      const input = card.querySelector(".qty-input");
      if (input) input.value = 1;
    });
  }

  function submitOrder(ctx = cartDialogCtx || getActiveOrderingCtx()) {
    if (!ctx.cart.size) {
      showToast(t("cart.empty"));
      return;
    }
    const branch = ctx.els.hdrBranch.value;
    const orderer = ctx.els.hdrOrderer.value.trim();
    if (!branch || !orderer) {
      showToast(t("cart.fillBranch"));
      return;
    }

    const remark = ctx.els.hdrRemark.value.trim();
    const overMin = Array.from(ctx.cart.values()).some(({ product, quantity, branchName }) =>
      needsOverOrderReason(branchMinOrders, branchName || branch, product.itemCode, quantity)
    );
    if (overMin && !remark) {
      updateOverMinOrderHint(ctx);
      showToast(t("cart.needOverOrderReason"));
      ctx.els.hdrRemark.focus();
      return;
    }

    const lines = Array.from(ctx.cart.values()).map(({ product, quantity, branchName }) => {
      const price = getProductPrice(product);
      const lineBranch = branchName || branch;
      const minOrder = getBranchMinOrder(branchMinOrders, lineBranch, product.itemCode);
      const isOver = needsOverOrderReason(
        branchMinOrders,
        lineBranch,
        product.itemCode,
        quantity
      );
      return {
        itemCode: product.itemCode,
        itemName: product.itemName,
        quantity,
        unit: product.unit,
        unitPrice: price,
        imageUrl: product.imageUrl,
        branchName: lineBranch,
        ...(isOver ? { overMinOrder: true, minOrder, overReason: remark } : {}),
      };
    });

    const totalAmount = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
    const orderRemark =
      ctx.orderKind === "cabinet-reserve"
        ? [remark, t("cabinetReserve.title")].filter(Boolean).join(" · ")
        : remark;
    const order = {
      id: generateId(),
      orderNo: nextOrderNo(),
      branchName: branch,
      orderer,
      orderDate: ctx.els.hdrDate.value || todayISO(),
      remark: orderRemark,
      status: "submitted",
      lines,
      totalQty: lines.reduce((s, l) => s + l.quantity, 0),
      totalAmount,
      createdAt: new Date().toISOString(),
      ...(ctx.orderKind ? { orderKind: ctx.orderKind } : {}),
    };

    orders.unshift(order);
    saveOrders(orders);
    const scrollY = getOrderingScrollY();
    const submittedCodes = Array.from(ctx.cart.keys());
    ctx.cart.clear();
    ctx.els.hdrRemark.value = "";
    updateOverMinOrderHint(ctx);
    resetVisibleProductQtyInputs(ctx, submittedCodes);
    submittedCodes.forEach((code) => updateProductCardOverMinBadge(ctx, code));
    updateCartBar();
    const toastKey = ctx.orderKind === "cabinet-reserve" ? "cabinetReserve.submitted" : "cart.submitted";
    showToast(
      t(toastKey, { no: order.orderNo, amount: formatMoney(totalAmount) }) ||
        t("cart.submitted", { no: order.orderNo, amount: formatMoney(totalAmount) })
    );
    if (els.cartDialog?.open) els.cartDialog.close();
    cartDialogCtx = null;
    restoreOrderingScrollY(scrollY);
    if (getActiveViewName() === "suggestions") {
      renderSuggestionsPageContent({ skipFilterPopulate: true });
    }
  }

  function recalcOrderTotals(lines) {
    const totalQty = lines.reduce((s, l) => s + (l.quantity || 0), 0);
    const totalAmount = lines.reduce((s, l) => s + (l.quantity || 0) * (l.unitPrice || 0), 0);
    return { totalQty, totalAmount };
  }

  function mergeOrderLines(sourceOrders) {
    const lineMap = new Map();
    sourceOrders.forEach((order) => {
      order.lines.forEach((line) => {
        const branchName = line.branchName || order.branchName;
        const key = `${branchName}::${line.itemCode}`;
        if (lineMap.has(key)) {
          lineMap.get(key).quantity += line.quantity;
        } else {
          lineMap.set(key, { ...line, branchName });
        }
      });
    });
    return Array.from(lineMap.values());
  }

  function orderMatchesBranchFilter(order, branch) {
    if (!branch) return true;
    if (order.branchName === branch) return true;
    return order.lines.some((line) => (line.branchName || order.branchName) === branch);
  }

  function buildOrderPayload({ branchName, orderer, orderDate, remark, status, lines, mergedFrom, splitFrom }) {
    const { totalQty, totalAmount } = recalcOrderTotals(lines);
    return {
      id: generateId(),
      orderNo: nextOrderNo(),
      branchName,
      orderer,
      orderDate: orderDate || todayISO(),
      remark: remark || "",
      status: status || "submitted",
      lines,
      totalQty,
      totalAmount,
      createdAt: new Date().toISOString(),
      ...(mergedFrom?.length ? { mergedFrom } : {}),
      ...(splitFrom ? { splitFrom } : {}),
    };
  }

  function getSelectedOrders() {
    return orders.filter((o) => orderSelection.has(o.id));
  }

  function updateOrderSelectionToolbar() {
    const selected = getSelectedOrders();
    const count = selected.length;
    if (els.btnMergeOrders) els.btnMergeOrders.disabled = count < 2;
    if (els.btnSplitOrder) els.btnSplitOrder.disabled = count !== 1;
    if (els.btnDeleteOrders) els.btnDeleteOrders.disabled = count < 1;
  }

  function confirmDeleteOrders(ordersToDelete) {
    if (!ordersToDelete.length) return false;
    const message =
      ordersToDelete.length === 1
        ? t("orders.deleteConfirmOne", { no: ordersToDelete[0].orderNo })
        : t("orders.deleteConfirm", { n: ordersToDelete.length });
    return confirm(message);
  }

  function deleteOrdersByIds(ids) {
    const idSet = new Set(ids);
    const removed = orders.filter((o) => idSet.has(o.id));
    if (!removed.length) return 0;
    orders = orders.filter((o) => !idSet.has(o.id));
    saveOrders(orders);
    removed.forEach((o) => orderSelection.delete(o.id));
    if (detailOrderId && idSet.has(detailOrderId)) {
      detailOrderId = null;
      els.detailDialog.close();
    }
    if (splitOrderId && idSet.has(splitOrderId)) {
      splitOrderId = null;
      els.orderSplitDialog.close();
    }
    syncOrdersDependentViews();
    return removed.length;
  }

  function deleteSelectedOrders() {
    const selected = getSelectedOrders();
    if (!selected.length) return;
    if (!confirmDeleteOrders(selected)) return;
    const count = deleteOrdersByIds(selected.map((o) => o.id));
    orderSelection.clear();
    showToast(t("orders.deleted", { n: count }));
  }

  function deleteSingleOrder(orderId) {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    if (!confirmDeleteOrders([order])) return;
    const count = deleteOrdersByIds([orderId]);
    showToast(t("orders.deleted", { n: count }));
  }

  function mergeSelectedOrders() {
    const selected = getSelectedOrders();
    if (selected.length < 2) {
      showToast(t("orders.mergeNeedTwo"));
      return;
    }

    const branches = [...new Set(selected.map((o) => o.branchName).filter(Boolean))];
    if (branches.length > 1) {
      showToast(t("orders.mergeSameBranchOnly"));
      return;
    }

    const lines = mergeOrderLines(selected);
    const lineBranches = [
      ...new Set(lines.map((line) => line.branchName || branches[0]).filter(Boolean)),
    ];
    if (lineBranches.length > 1) {
      showToast(t("orders.mergeSameBranchOnly"));
      return;
    }

    const orderers = [...new Set(selected.map((o) => o.orderer).filter(Boolean))];
    const remarks = [...new Set(selected.map((o) => o.remark).filter(Boolean))];
    const merged = buildOrderPayload({
      branchName: branches[0],
      orderer: orderers.join(" / "),
      orderDate: selected[0].orderDate,
      remark: remarks.join("；"),
      status: selected[0].status,
      lines,
      mergedFrom: selected.map((o) => o.orderNo),
    });

    const removeIds = new Set(selected.map((o) => o.id));
    orders = orders.filter((o) => !removeIds.has(o.id));
    orders.unshift(merged);
    saveOrders(orders);
    orderSelection.clear();
    syncOrdersDependentViews();
    showToast(
      t("orders.merged", {
        no: merged.orderNo,
        n: selected.length,
        branches: 1,
      })
    );
  }

  function openSplitDialog(orderId) {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    splitOrderId = orderId;
    els.orderSplitBody.innerHTML = `
      <p class="split-order-meta"><strong>${escapeHtml(order.orderNo)}</strong> · ${escapeHtml(order.branchName)}</p>
      <table class="data-table">
        <thead>
          <tr>
            <th>${t("products.code")}</th>
            <th>${t("products.name")}</th>
            <th>${t("orders.totalQty")}</th>
            <th>${t("orders.batch1Qty")}</th>
            <th>${t("orders.batch2Qty")}</th>
          </tr>
        </thead>
        <tbody>
          ${order.lines
            .map(
              (line) => `
            <tr data-split-code="${escapeHtml(line.itemCode)}">
              <td><code>${escapeHtml(line.itemCode)}</code></td>
              <td>${displayItemName(line.itemName, line.itemCode)}</td>
              <td>${line.quantity}</td>
              <td><input type="number" class="split-qty-input" min="0" max="${line.quantity}" value="${Math.floor(line.quantity / 2)}" /></td>
              <td class="split-batch2-qty">${Math.ceil(line.quantity / 2)}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>`;
    els.orderSplitDialog.showModal();
  }

  function confirmSplitOrder() {
    const order = orders.find((o) => o.id === splitOrderId);
    if (!order) return;

    const lines1 = [];
    const lines2 = [];
    els.orderSplitBody.querySelectorAll("tr[data-split-code]").forEach((row) => {
      const code = row.dataset.splitCode;
      const line = order.lines.find((l) => l.itemCode === code);
      if (!line) return;
      const input = row.querySelector(".split-qty-input");
      const batch1 = Math.min(line.quantity, Math.max(0, parseInt(input.value, 10) || 0));
      const batch2 = line.quantity - batch1;
      if (batch1 > 0) lines1.push({ ...line, quantity: batch1 });
      if (batch2 > 0) lines2.push({ ...line, quantity: batch2 });
    });

    if (!lines1.length || !lines2.length) {
      showToast(t("orders.splitInvalid"));
      return;
    }

    const batch1Order = buildOrderPayload({
      branchName: order.branchName,
      orderer: order.orderer,
      orderDate: order.orderDate,
      remark: order.remark ? `${order.remark} (${t("orders.batch1")})` : t("orders.batch1"),
      status: order.status,
      lines: lines1,
      splitFrom: order.orderNo,
    });
    const batch2Order = buildOrderPayload({
      branchName: order.branchName,
      orderer: order.orderer,
      orderDate: order.orderDate,
      remark: order.remark ? `${order.remark} (${t("orders.batch2")})` : t("orders.batch2"),
      status: order.status,
      lines: lines2,
      splitFrom: order.orderNo,
    });

    orders = orders.filter((o) => o.id !== order.id);
    orders.unshift(batch2Order, batch1Order);
    saveOrders(orders);
    orderSelection.clear();
    splitOrderId = null;
    els.orderSplitDialog.close();
    syncOrdersDependentViews();
    showToast(t("orders.splitDone", { a: batch1Order.orderNo, b: batch2Order.orderNo }));
  }

  function isCabinetReserveOrder(order) {
    return order?.orderKind === "cabinet-reserve";
  }

  function getCabinetOrderCatalog() {
    const byCode = new Map(products.map((p) => [p.itemCode.toUpperCase(), p]));
    cabinetProducts.forEach((p) => byCode.set(p.itemCode.toUpperCase(), p));
    return Array.from(byCode.values());
  }

  function getCabinetBranchStatusList(cabinetFiltered) {
    const submitted = new Set(
      cabinetFiltered
        .filter((o) => o.status !== "shipped")
        .map((o) => o.branchName)
        .filter(Boolean)
    );
    return branches.map((branch) => ({
      branch,
      submitted: submitted.has(branch),
    }));
  }

  function renderCabinetBranchStatus(statusList) {
    const el = document.getElementById("cabinet-branch-status");
    if (!el) return;
    if (!branches.length) {
      el.innerHTML = `<p class="hint">${t("settings.enterBranch")}</p>`;
      return;
    }
    el.innerHTML = statusList
      .map(
        ({ branch, submitted }) => `
      <div class="cabinet-branch-chip ${submitted ? "cabinet-branch-submitted" : "cabinet-branch-pending"}">
        <span class="cabinet-branch-name">${escapeHtml(branch)}</span>
        <span class="cabinet-branch-tag">${submitted ? t("orders.cabinetBranchSubmitted") : t("orders.cabinetBranchPending")}</span>
      </div>`
      )
      .join("");
  }

  function renderCabinetOrdersSection(cabinetFiltered) {
    const panel = document.getElementById("orders-cabinet-panel");
    if (!panel) return;

    renderCabinetBranchStatus(getCabinetBranchStatusList(cabinetFiltered));

    const summaryOrders = getOrdersForSummary(cabinetFiltered);
    const catalog = getCabinetOrderCatalog();
    const matrix = buildOrderMatrix(summaryOrders, catalog);
    const grandEl = document.getElementById("cabinet-orders-grand-total");
    renderOrdersGrandTotalFromMatrix(matrix, grandEl);

    const countEl = document.getElementById("cabinet-orders-matrix-count");
    if (countEl) {
      countEl.textContent = t("orders.listCount", { n: cabinetFiltered.length });
    }

    const listEl = document.getElementById("cabinet-orders-list");
    if (listEl) {
      if (!cabinetFiltered.length) {
        listEl.innerHTML = `<div class="empty-state">${t("orders.cabinetEmpty")}</div>`;
      } else if (!summaryOrders.length) {
        listEl.innerHTML = `<div class="empty-state">${t("orders.matrixEmpty")}</div>`;
      } else {
        listEl.innerHTML = renderOrderMatrixTableFromMatrix(matrix);
      }
    }

    const manageEl = document.getElementById("cabinet-orders-manage-list");
    if (manageEl) {
      if (!cabinetFiltered.length) {
        manageEl.innerHTML = `<div class="empty-state">${t("orders.cabinetEmpty")}</div>`;
      } else {
        renderOrdersManageList(cabinetFiltered, {
          listEl: manageEl,
          showCheckboxes: false,
          selection: null,
        });
      }
    }
  }

  function getFilteredOrders() {
    const search = els.orderFilterSearch.value.trim().toLowerCase();
    const branch = els.orderFilterBranch.value;
    const status = els.orderFilterStatus.value;

    return orders.filter((o) => {
      if (branch && !orderMatchesBranchFilter(o, branch)) return false;
      if (status && o.status !== status) return false;
      if (search) {
        const hay = [o.orderNo, o.orderer, o.branchName, o.remark || "", ...o.lines.map((l) => `${l.itemCode} ${l.itemName}`)]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    });
  }

  function getOrderMatrixLabels() {
    return {
      docTitle: t("orders.title"),
      itemCode: t("products.code"),
      itemName: t("products.name"),
      pending: t("orders.pendingCol"),
      total: t("orders.totalCol"),
      cases: t("orders.casesCol"),
      sheetName: t("orders.exportSheet"),
      summarySheet: t("orders.exportSummarySheet"),
      summaryTotal: t("orders.summaryTotal"),
      empty: t("orders.matrixEmpty"),
    };
  }

  function getOrderExportLabels() {
    return {
      docTitle: t("orders.exportDocTitle"),
      orderNo: t("orders.orderNo"),
      branch: t("orders.branch"),
      orderer: t("orders.orderer"),
      date: t("orders.date"),
      status: t("orders.status"),
      remark: t("orders.remark"),
      itemCode: t("products.code"),
      itemName: t("products.name"),
      qty: t("orders.qty"),
      unit: t("order.unit"),
      price: t("orders.price"),
      subtotal: t("orders.subtotal"),
      totalQty: t("orders.totalQty"),
      totalAmount: t("orders.totalAmount"),
      mergedFrom: t("orders.mergedFrom"),
      splitFrom: t("orders.splitFrom"),
      sheetName: t("orders.exportSheet"),
      detailSheet: t("orders.exportDetailSheet"),
    };
  }

  function getOrdersForExport() {
    return getFilteredOrders();
  }

  function getCabinetOrdersForExport() {
    return getFilteredOrders().filter(isCabinetReserveOrder);
  }

  function exportCabinetOrdersExcel() {
    const list = getCabinetOrdersForExport();
    if (!list.length) {
      showToast(t("orders.cabinetExportEmpty"));
      return;
    }
    const matrixLabels = {
      ...getOrderMatrixLabels(),
      docTitle: t("orders.cabinetSectionTitle"),
      sheetName: t("orders.cabinetExportSheet"),
      summarySheet: t("orders.cabinetExportSummarySheet"),
    };
    const detailLabels = {
      ...getOrderExportLabels(),
      docTitle: t("orders.cabinetSectionTitle"),
      detailSheet: t("orders.cabinetExportDetailSheet"),
    };
    downloadOrdersFileExcel(
      `cabinet_orders_${todayISO()}.xlsx`,
      list,
      getCabinetOrderCatalog(),
      matrixLabels,
      detailLabels,
      getStatusLabel
    );
    showToast(t("orders.exportedExcelFile"));
  }

  function exportOrdersExcel(list) {
    if (!list.length) {
      showToast(t("orders.exportListEmpty"));
      return;
    }
    downloadOrdersFileExcel(
      `orders_${todayISO()}.xlsx`,
      list,
      products,
      getOrderMatrixLabels(),
      getOrderExportLabels(),
      getStatusLabel
    );
    showToast(t("orders.exportedExcelFile"));
  }

  function exportSingleOrderExcel(order) {
    if (!order) return;
    downloadOrdersFileExcel(
      `${order.orderNo}.xlsx`,
      [order],
      products,
      getOrderMatrixLabels(),
      getOrderExportLabels(),
      getStatusLabel
    );
    showToast(t("orders.exportedExcelFile"));
  }

  function renderOrdersGrandTotalFromMatrix(matrix, targetEl = els.ordersGrandTotal) {
    if (!targetEl) return;
    const { branchColumns, grand } = matrix;
    if (!grand) return;

    const branchHtml = branchColumns
      .map(
        (c) => `
      <div class="orders-grand-item ${c.key === "pending" ? "orders-grand-item-pending" : "orders-grand-item-branch"}">
        <span class="${c.key === "pending" ? "orders-pending-label" : "orders-branch-name"}">${escapeHtml(c.label)}</span>
        <strong>${grand.branchTotals[c.key] || ""}</strong>
      </div>`
      )
      .join("");

    targetEl.innerHTML = `
      <h3 class="orders-grand-title">${t("orders.grandTotal")}</h3>
      <div class="orders-grand-grid">
        ${branchHtml}
        <div class="orders-grand-item orders-grand-item-total">
          <span class="orders-grand-label">total</span>
          <strong>${grand.total || ""}</strong>
        </div>
      </div>`;
  }

  function renderOrderMatrixTableFromMatrix(matrix) {
    const { branchColumns, rows } = matrix;
    if (!rows.length) {
      return `<div class="empty-state">${t("orders.matrixEmpty")}</div>`;
    }
    const branchHeaders = branchColumns
      .map((c) => {
        const thClass = c.key === "pending" ? "col-pending" : "col-branch";
        return `<th class="${thClass}">${escapeHtml(c.label)}</th>`;
      })
      .join("");
    const body = rows
      .map((row) => {
        const branchCells = branchColumns
          .map((c) => {
            const tdClass = c.key === "pending" ? "num col-pending" : "num col-branch";
            return `<td class="${tdClass}">${row.branches[c.key] ? row.branches[c.key] : ""}</td>`;
          })
          .join("");
        return `<tr>
          <td class="col-item-code"><span class="orders-item-code">${escapeHtml(row.itemCode)}</span></td>
          <td class="col-item-name"><span class="orders-item-name">${displayItemName(row.itemName, row.itemCode)}</span></td>
          ${branchCells}
          <td class="num col-total"><strong>${row.total}</strong></td>
        </tr>`;
      })
      .join("");
    return `<div class="table-wrap orders-matrix-wrap">
      <table class="data-table orders-matrix-table">
        <thead><tr>
          <th class="col-item-code">${t("products.code")}</th>
          <th class="col-item-name">${t("products.name")}</th>
          ${branchHeaders}
          <th class="col-total">${t("orders.totalCol")}</th>
        </tr></thead>
        <tbody>${body}</tbody>
      </table>
    </div>`;
  }

  function renderOrderMatrixTable(filtered) {
    return renderOrderMatrixTableFromMatrix(
      buildOrderMatrix(getOrdersForSummary(filtered), products)
    );
  }

  function renderOrdersGrandTotal(filtered) {
    renderOrdersGrandTotalFromMatrix(buildOrderMatrix(getOrdersForSummary(filtered), products));
  }

  function renderOrdersManageList(filtered, options = {}) {
    const listEl = options.listEl || els.ordersManageList;
    const showCheckboxes = options.showCheckboxes !== false;
    const selection = options.selection !== undefined ? options.selection : orderSelection;
    if (!listEl) return;
    if (!filtered.length) {
      listEl.innerHTML = `<div class="empty-state">${t("orders.empty")}</div>`;
      return;
    }
    const checkHeader = showCheckboxes ? `<th class="col-check"></th>` : "";
    listEl.innerHTML = `
      <div class="table-wrap">
        <table class="data-table orders-manage-table">
          <thead><tr>
            ${checkHeader}
            <th>${t("orders.orderNo")}</th>
            <th>${t("orders.branch")}</th>
            <th>${t("orders.orderer")}</th>
            <th>${t("orders.date")}</th>
            <th>${t("orders.totalQty")}</th>
            <th>${t("orders.status")}</th>
            <th>${t("orders.actions")}</th>
          </tr></thead>
          <tbody>
            ${filtered
              .map(
                (o) => `
            <tr class="${selection?.has(o.id) ? "is-selected" : ""}" data-order-id="${o.id}">
              ${
                showCheckboxes
                  ? `<td class="col-check"><input type="checkbox" class="order-select-check" data-order-id="${o.id}" ${selection.has(o.id) ? "checked" : ""} /></td>`
                  : ""
              }
              <td><button type="button" class="link-btn" data-view-order="${o.id}">${escapeHtml(o.orderNo)}</button></td>
              <td class="col-branch"><span class="orders-branch-name">${escapeHtml(o.branchName)}</span></td>
              <td>${escapeHtml(o.orderer)}</td>
              <td>${formatDate(o.orderDate)}</td>
              <td>${o.totalQty}</td>
              <td>
                <select class="order-status-select" data-status-order="${o.id}" aria-label="${t("orders.changeStatus")}">
                  ${renderOrderStatusOptions(o.status)}
                </select>
              </td>
              <td class="orders-manage-actions">
                <button type="button" class="link-btn" data-view-order="${o.id}">${t("orders.details")}</button>
                <button type="button" class="link-btn" data-split-order="${o.id}">${t("orders.split")}</button>
                <button type="button" class="link-btn danger" data-delete-order="${o.id}">${t("orders.delete")}</button>
              </td>
            </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>`;
  }

  function renderOrderStatusOptions(selected) {
    return ["submitted", "confirmed", "shipped"]
      .map(
        (s) =>
          `<option value="${s}" ${s === selected ? "selected" : ""}>${getStatusLabel(s)}</option>`
      )
      .join("");
  }

  function updateOrderStatus(orderId, status) {
    const order = orders.find((o) => o.id === orderId);
    if (!order || order.status === status) return;
    order.status = status;
    saveOrders(orders);
    syncOrdersDependentViews();
    showToast(t("orders.statusUpdated"));
  }

  function renderOrdersList() {
    const allFiltered = getFilteredOrders();
    const filtered = allFiltered.filter((o) => !isCabinetReserveOrder(o));
    const cabinetFiltered = allFiltered.filter(isCabinetReserveOrder);
    const summaryOrders = getOrdersForSummary(filtered);

    orderSelection = new Set(
      [...orderSelection].filter((id) => {
        const o = orders.find((x) => x.id === id);
        return o && !isCabinetReserveOrder(o);
      })
    );
    const matrix = buildOrderMatrix(summaryOrders, products);
    renderOrdersGrandTotalFromMatrix(matrix);

    const countEl = document.getElementById("orders-matrix-count");
    if (countEl) {
      countEl.textContent = t("orders.listCount", { n: filtered.length });
    }

    if (!filtered.length) {
      els.ordersList.innerHTML = `<div class="empty-state">${t("orders.empty")}</div>`;
    } else if (!summaryOrders.length) {
      els.ordersList.innerHTML = `<div class="empty-state">${t("orders.matrixEmpty")}</div>`;
    } else {
      els.ordersList.innerHTML = renderOrderMatrixTableFromMatrix(matrix);
    }

    renderOrdersManageList(filtered);
    renderCabinetOrdersSection(cabinetFiltered);

    const selectAll = document.getElementById("orders-select-all");
    if (selectAll) {
      const allChecked = filtered.length > 0 && filtered.every((o) => orderSelection.has(o.id));
      const someChecked = filtered.some((o) => orderSelection.has(o.id));
      selectAll.checked = allChecked;
      selectAll.indeterminate = someChecked && !allChecked;
    }
    updateOrderSelectionToolbar();
  }

  function openOrderDetail(id) {
    const order = orders.find((o) => o.id === id);
    if (!order) return;
    detailOrderId = id;
    const showLineBranch = order.lines.some((l) => l.branchName);
    els.detailTitle.textContent = order.orderNo;
    if (els.detailStatusSelect) {
      els.detailStatusSelect.innerHTML = renderOrderStatusOptions(order.status);
    }
    els.detailContent.innerHTML = `
      <div class="order-detail-summary">
        <div class="detail-item detail-item-branch"><label>${t("orders.branch")}</label><span class="orders-branch-name">${escapeHtml(order.branchName)}</span></div>
        <div class="detail-item"><label>${t("orders.orderer")}</label><span>${escapeHtml(order.orderer)}</span></div>
        <div class="detail-item"><label>${t("orders.date")}</label><span>${formatDate(order.orderDate)}</span></div>
        <div class="detail-item"><label>${t("orders.status")}</label><span class="badge badge-${order.status}">${getStatusLabel(order.status)}</span></div>
        <div class="detail-item"><label>${t("orders.totalQty")}</label><span>${order.totalQty}</span></div>
        <div class="detail-item"><label>${t("orders.totalAmount")}</label><span>${formatMoney(order.totalAmount)}</span></div>
      </div>
      ${order.remark ? `<div class="order-detail-note"><label>${t("orders.remark")}</label><p>${escapeHtml(order.remark)}</p></div>` : ""}
      ${order.mergedFrom?.length ? `<div class="order-detail-note"><label>${t("orders.mergedFrom")}</label><p>${escapeHtml(order.mergedFrom.join(", "))}</p></div>` : ""}
      ${order.splitFrom ? `<div class="order-detail-note"><label>${t("orders.splitFrom")}</label><p>${escapeHtml(order.splitFrom)}</p></div>` : ""}
      <h4 class="order-detail-lines-title">${t("orders.lineItems")}</h4>
      <div class="table-wrap">
        <table class="data-table order-detail-lines-table">
          <thead><tr>${showLineBranch ? `<th class="col-branch">${t("orders.branch")}</th>` : ""}<th class="col-item-code">${t("products.code")}</th><th class="col-item-name">${t("products.name")}</th><th>${t("orders.qty")}</th><th>${t("orders.price")}</th><th>${t("orders.subtotal")}</th></tr></thead>
          <tbody>
            ${order.lines
              .map((l) => {
                return `
              <tr>
                ${showLineBranch ? `<td class="col-branch"><span class="orders-branch-name">${escapeHtml(l.branchName || order.branchName || "")}</span></td>` : ""}
                <td class="col-item-code"><span class="orders-item-code">${escapeHtml(l.itemCode)}</span></td>
                <td class="col-item-name"><span class="orders-item-name">${displayItemName(l.itemName, l.itemCode)}</span></td>
                <td>${l.quantity} ${escapeHtml(l.unit || "")}</td>
                <td>${formatMoney(l.unitPrice || 0)}</td>
                <td>${formatMoney((l.quantity || 0) * (l.unitPrice || 0))}</td>
              </tr>`;
              })
              .join("")}
          </tbody>
        </table>
      </div>`;
    els.detailDialog.showModal();
  }

  function renderProductAdmin() {
    els.productCount.textContent = products.length;
    renderAdminProductList();
    renderCabinetProductAdmin();
  }

  function syncStockRowsFromDom() {
    els.stockEditBody?.querySelectorAll("tr[data-code]").forEach((row) => {
      const code = row.dataset.code;
      const product = products.find((p) => p.itemCode === code);
      if (!product) return;
      Object.assign(product, readStockFromRow(row));
    });
  }

  function getAdminPagedProducts() {
    const filtered = getAdminFilteredProducts();
    const totalPages = Math.max(1, Math.ceil(filtered.length / LIST_PAGE_SIZE));
    if (adminPage > totalPages) adminPage = totalPages;
    const start = (adminPage - 1) * LIST_PAGE_SIZE;
    return {
      filtered,
      pageItems: filtered.slice(start, start + LIST_PAGE_SIZE),
      totalPages,
    };
  }

  function renderAdminPagination({ filtered, totalPages }) {
    if (!els.adminProductPagination) return;
    els.adminProductPagination.innerHTML = `
      <span>${t("order.totalRows", { n: filtered.length })}</span>
      <div class="page-btns">
        <button class="page-btn" data-admin-page="prev" ${adminPage <= 1 ? "disabled" : ""}>‹</button>
        ${buildPageButtons(adminPage, totalPages, "data-admin-page")}
        <button class="page-btn" data-admin-page="next" ${adminPage >= totalPages ? "disabled" : ""}>›</button>
      </div>
      <span>${t("order.perPage", { n: LIST_PAGE_SIZE })}</span>`;
  }

  function renderAdminProductPreview(pageItems) {
    if (!els.adminProductBody) return;
    if (!pageItems.length) {
      els.adminProductBody.innerHTML = `<tr><td colspan="7" class="empty-cell">${t("products.emptyAdmin")}</td></tr>`;
      return;
    }
    els.adminProductBody.innerHTML = pageItems
      .map(
        (p, i) => `
      <tr class="${i % 2 === 0 ? "preview-row-a" : "preview-row-b"}">
        <td class="preview-cell-img">${renderProductThumb(p, 48)}</td>
        <td class="preview-cell-info">
          <code class="preview-code">${escapeHtml(p.itemCode)}</code>
          <span class="preview-name" title="${escapeHtml(p.itemName)}">${escapeHtml(p.itemName)}</span>
        </td>
        <td class="preview-cell-cat">
          <span class="preview-cat">${escapeHtml(p.category)}</span>
          <span class="preview-dept">${escapeHtml(p.department || t("products.generalDept"))}</span>
        </td>
        <td class="preview-cell-case">
          <strong class="preview-case-num">${p.caseQty ?? 0}</strong>
          <span class="preview-case-unit">${escapeHtml(p.unit || "")}</span>
        </td>
        <td class="preview-cell-cost">${formatMoney(p.unitPrice)}</td>
        <td class="preview-cell-barcode"><code class="preview-barcode">${escapeHtml(p.barcode || "—")}</code></td>
        <td class="preview-cell-price">${formatMoney(p.sellPrice ?? p.unitPrice)}</td>
      </tr>`
      )
      .join("");
  }

  function getAdminFilteredProducts() {
    const q = (els.adminSearch?.value || "").trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.itemCode.toLowerCase().includes(q) ||
        p.itemName.toLowerCase().includes(q) ||
        (p.brand || "").toLowerCase().includes(q) ||
        (p.barcode && String(p.barcode).toLowerCase().includes(q))
    );
  }

  function renderAdminProductList() {
    const { filtered, pageItems, totalPages } = getAdminPagedProducts();
    if (!filtered.length) {
      renderAdminProductPreview([]);
      if (els.adminProductPagination) els.adminProductPagination.innerHTML = "";
      return;
    }
    renderAdminProductPreview(pageItems);
    renderAdminPagination({ filtered, totalPages });
  }

  function renderStockEditTable() {
    renderAdminProductList();
  }

  function readCabinetStockFromRow(row) {
    const getNum = (field) => {
      const el = row.querySelector(`[data-field="${field}"]`);
      if (!el) return undefined;
      const n = parseFloat(el.value);
      return Number.isFinite(n) ? Math.max(0, n) : 0;
    };
    const patch = {};
    const caseQty = getNum("caseQty");
    if (caseQty !== undefined) patch.caseQty = caseQty;
    const unitPrice = getNum("unitPrice");
    if (unitPrice !== undefined) patch.unitPrice = unitPrice;
    const sellPrice = getNum("sellPrice");
    if (sellPrice !== undefined) patch.sellPrice = sellPrice;
    return patch;
  }

  function readStockFromRow(row) {
    const getNum = (field) => {
      const el = row.querySelector(`[data-field="${field}"]`);
      const n = parseFloat(el?.value);
      return Number.isFinite(n) ? Math.max(0, n) : 0;
    };
    const getText = (field) => {
      const el = row.querySelector(`[data-field="${field}"]`);
      return el ? String(el.value ?? "").trim() : undefined;
    };
    const cabinetNo = getText("cabinetNo");
    return {
      stockQty: getNum("stockQty"),
      caseQty: getNum("caseQty"),
      orderableQty: getNum("orderableQty"),
      safetyStock: getNum("safetyStock"),
      unitPrice: getNum("unitPrice"),
      sellPrice: getNum("sellPrice"),
      ...(cabinetNo !== undefined ? { cabinetNo } : {}),
    };
  }

  function applyStockFromRow(itemCode, row) {
    const product = products.find((p) => p.itemCode === itemCode);
    if (!product) return false;

    const data = readStockFromRow(row);
    if (data.orderableQty > data.stockQty) {
      showToast(t("toast.orderableExceeds", { code: itemCode }));
      return false;
    }

    Object.assign(product, normalizeProduct({ ...product, ...data }));
    return true;
  }

  function saveAllStockChanges() {
    if (!els.stockEditBody) {
      showToast(t("toast.noData"));
      return;
    }
    syncStockRowsFromDom();
    const rows = els.stockEditBody.querySelectorAll("tr[data-code]");
    if (!rows.length) {
      showToast(t("toast.noData"));
      return;
    }

    let saved = 0;
    let failed = false;
    rows.forEach((row) => {
      const code = row.dataset.code;
      if (applyStockFromRow(code, row)) saved += 1;
      else failed = true;
    });

    if (saved) {
      persistProducts(products, {
        toast: t("toast.stockSaved", { n: saved }),
      });
      return;
    }
    if (failed) showToast(t("toast.stockPartial"));
    else showToast(t("toast.noData"));
  }

  function saveSingleStock(itemCode) {
    const row = els.stockEditBody?.querySelector(`tr[data-code="${CSS.escape(itemCode)}"]`);
    if (!row) return;
    if (applyStockFromRow(itemCode, row)) {
      persistProducts(products, { toast: t("toast.itemUpdated", { code: itemCode }) });
    }
  }

  function deleteProduct(itemCode) {
    if (!confirm(`${t("products.delete")} ${itemCode}?`)) return;
    cart.delete(itemCode);
    persistProducts(
      products.filter((p) => p.itemCode !== itemCode),
      { toast: t("toast.deleted", { code: itemCode }) }
    );
  }

  function getCabinetAdminFilteredProducts() {
    const q = (els.cabinetAdminSearch?.value || "").trim().toLowerCase();
    if (!q) return cabinetProducts;
    return cabinetProducts.filter(
      (p) =>
        p.itemCode.toLowerCase().includes(q) ||
        p.itemName.toLowerCase().includes(q) ||
        (p.brand || "").toLowerCase().includes(q)
    );
  }

  function getCabinetAdminPagedProducts() {
    const filtered = getCabinetAdminFilteredProducts();
    const totalPages = Math.max(1, Math.ceil(filtered.length / LIST_PAGE_SIZE));
    if (cabinetAdminPage > totalPages) cabinetAdminPage = totalPages;
    const start = (cabinetAdminPage - 1) * LIST_PAGE_SIZE;
    return {
      filtered,
      pageItems: filtered.slice(start, start + LIST_PAGE_SIZE),
      totalPages,
    };
  }

  function renderCabinetAdminRowActions(p) {
    const reserved = Boolean(p.cabinetReserved);
    const reserveLabel = reserved ? t("products.cabinetUnreserve") : t("products.cabinetMarkReserved");
    return `
        <td class="row-actions">
          <div class="row-action-menu">
            <button
              type="button"
              class="row-action-menu-trigger"
              aria-haspopup="true"
              aria-expanded="false"
              data-action-menu-trigger
              title="${escapeHtml(t("order.action"))}"
            >⋯</button>
            <div class="row-action-menu-panel" hidden>
              <button type="button" class="row-action-menu-item" data-save-cabinet-stock="${escapeHtml(p.itemCode)}">${t("products.save")}</button>
              <button type="button" class="row-action-menu-item${reserved ? " is-active" : ""}" data-toggle-cabinet-reserved="${escapeHtml(p.itemCode)}">${reserveLabel}</button>
              <button type="button" class="row-action-menu-item danger" data-delete-cabinet-product="${escapeHtml(p.itemCode)}">${t("products.delete")}</button>
            </div>
          </div>
        </td>`;
  }

  function renderCabinetAdminProductRow(p) {
    return `
      <tr data-code="${escapeHtml(p.itemCode)}" class="${p.cabinetReserved ? "is-cabinet-reserved" : ""}">
        <td><code>${escapeHtml(p.itemCode)}</code>${p.cabinetReserved ? `<span class="cabinet-reserved-badge">${t("products.cabinetReserved")}</span>` : ""}</td>
        <td>${escapeHtml(p.itemName)}</td>
        <td>${escapeHtml(p.unit)}</td>
        <td><input type="number" class="stock-input" data-field="caseQty" value="${p.caseQty ?? 0}" min="0" step="1" /></td>
        <td><input type="number" class="stock-input stock-input-price" data-field="unitPrice" value="${p.unitPrice}" min="0" step="0.01" /></td>
        <td><input type="number" class="stock-input stock-input-price" data-field="sellPrice" value="${p.sellPrice ?? p.unitPrice}" min="0" step="0.01" /></td>
        ${renderCabinetAdminRowActions(p)}
      </tr>`;
  }

  function renderCabinetAdminPagination({ filtered, totalPages }) {
    if (!els.cabinetAdminPagination) return;
    els.cabinetAdminPagination.innerHTML = `
      <span>${t("order.totalRows", { n: filtered.length })}</span>
      <div class="page-btns">
        <button class="page-btn" data-cabinet-admin-page="prev" ${cabinetAdminPage <= 1 ? "disabled" : ""}>‹</button>
        ${buildPageButtons(cabinetAdminPage, totalPages, "data-cabinet-admin-page")}
        <button class="page-btn" data-cabinet-admin-page="next" ${cabinetAdminPage >= totalPages ? "disabled" : ""}>›</button>
      </div>
      <span>${t("order.perPage", { n: LIST_PAGE_SIZE })}</span>`;
  }

  function syncCabinetStockRowsFromDom() {
    els.cabinetStockEditBody?.querySelectorAll("tr[data-code]").forEach((row) => {
      const code = row.dataset.code;
      const product = cabinetProducts.find((p) => p.itemCode === code);
      if (!product) return;
      Object.assign(product, readCabinetStockFromRow(row));
    });
  }

  function applyCabinetStockFromRow(itemCode, row) {
    const product = cabinetProducts.find((p) => p.itemCode === itemCode);
    if (!product) return false;
    const data = readCabinetStockFromRow(row);
    Object.assign(product, finalizeCabinetProduct({ ...product, ...data }));
    return true;
  }

  function renderCabinetProductAdmin() {
    if (!els.cabinetStockEditBody) return;
    const { filtered, pageItems, totalPages } = getCabinetAdminPagedProducts();
    if (!filtered.length) {
      els.cabinetStockEditBody.innerHTML = `<tr><td colspan="7" class="empty-cell">${t("products.cabinetEmptyAdmin")}</td></tr>`;
      if (els.cabinetAdminPagination) els.cabinetAdminPagination.innerHTML = "";
      return;
    }

    els.cabinetStockEditBody.innerHTML = pageItems.map((p) => renderCabinetAdminProductRow(p)).join("");
    renderCabinetAdminPagination({ filtered, totalPages });
  }

  function saveAllCabinetStockChanges() {
    syncCabinetStockRowsFromDom();
    const rows = els.cabinetStockEditBody?.querySelectorAll("tr[data-code]");
    if (!rows?.length) {
      showToast(t("toast.noData"));
      return;
    }
    let saved = 0;
    let failed = false;
    rows.forEach((row) => {
      const code = row.dataset.code;
      if (applyCabinetStockFromRow(code, row)) saved += 1;
      else failed = true;
    });
    if (saved) {
      persistCabinetProducts(cabinetProducts, {
        toast: t("toast.stockSaved", { n: saved }),
      });
      return;
    }
    if (failed) showToast(t("toast.stockPartial"));
    else showToast(t("toast.noData"));
  }

  function saveSingleCabinetStock(itemCode) {
    const row = els.cabinetStockEditBody?.querySelector(`tr[data-code="${CSS.escape(itemCode)}"]`);
    if (!row) return;
    if (applyCabinetStockFromRow(itemCode, row)) {
      persistCabinetProducts(cabinetProducts, { toast: t("toast.itemUpdated", { code: itemCode }) });
    }
  }

  function toggleCabinetReserved(itemCode) {
    const product = cabinetProducts.find((p) => p.itemCode === itemCode);
    if (!product) return;
    syncCabinetStockRowsFromDom();
    const row = els.cabinetStockEditBody?.querySelector(`tr[data-code="${CSS.escape(itemCode)}"]`);
    if (row) applyCabinetStockFromRow(itemCode, row);
    product.cabinetReserved = !product.cabinetReserved;
    Object.assign(product, finalizeCabinetProduct(product));
    if (product.cabinetReserved) cabinetCart.delete(itemCode);
    persistCabinetProducts(cabinetProducts, {
      toast: t(product.cabinetReserved ? "toast.cabinetReservedOn" : "toast.cabinetReservedOff", {
        code: itemCode,
      }),
    });
  }

  function closeCabinetRowActionMenus() {
    document.querySelectorAll(".cabinet-products-admin .row-action-menu-panel:not([hidden])").forEach((panel) => {
      panel.hidden = true;
    });
    document.querySelectorAll(".cabinet-products-admin [data-action-menu-trigger][aria-expanded='true']").forEach((btn) => {
      btn.setAttribute("aria-expanded", "false");
    });
  }

  function deleteCabinetProduct(itemCode) {
    if (!confirm(`${t("products.delete")} ${itemCode}?`)) return;
    cabinetCart.delete(itemCode);
    persistCabinetProducts(
      cabinetProducts.filter((p) => p.itemCode !== itemCode),
      { toast: t("toast.deleted", { code: itemCode }) }
    );
  }

  function copyMainProductsToCabinet() {
    if (!products.length) {
      showToast(t("toast.noData"));
      return;
    }
    if (cabinetProducts.length && !confirm(`${t("products.cabinetCopyFromMain")}?`)) return;
    cabinetProducts = products.map((p) => finalizeCabinetProduct({ ...p }));
    persistCabinetProducts(cabinetProducts, {
      toast: t("toast.exported", { n: cabinetProducts.length }),
    });
  }

  function openProductForm(mode = "main") {
    productFormMode = mode;
    els.productForm.reset();
    els.productForm.querySelector('[name="unit"]').value = "个";
    els.productForm.querySelector('[name="brand"]').value = "其他";
    els.productForm.querySelector('[name="category"]').value = t("products.uncategorized");
    els.productForm.querySelector('[name="department"]').value = t("products.generalDept");
    els.productForm.querySelector('[name="safetyStock"]').value = "10";
    els.productFormTitle.textContent =
      productFormMode === "cabinet" ? t("products.cabinetNewProduct") : t("products.newProduct");
    els.productFormDialog.showModal();
  }

  function saveNewProduct(formData) {
    const itemCode = formData.get("itemCode").trim().toUpperCase();
    if (!itemCode) {
      showToast(t("toast.needCode"));
      return;
    }
    const targetList = productFormMode === "cabinet" ? cabinetProducts : products;
    if (targetList.some((p) => p.itemCode === itemCode)) {
      showToast(t("toast.codeExists"));
      return;
    }

    const stockQty = Math.max(0, parseInt(formData.get("stockQty"), 10) || 0);
    const caseQty = Math.max(0, parseInt(formData.get("caseQty"), 10) || 0);
    let orderableQty = parseInt(formData.get("orderableQty"), 10);
    if (!Number.isFinite(orderableQty)) orderableQty = stockQty;
    orderableQty = Math.max(0, Math.min(orderableQty, stockQty));

    const unitPrice = Math.max(0, parseFloat(formData.get("unitPrice")) || 0);
    let sellPrice = parseFloat(formData.get("sellPrice"));
    if (!Number.isFinite(sellPrice)) sellPrice = unitPrice;

    const itemName = formData.get("itemName").trim() || itemCode;
    const product = normalizeProduct({
      itemCode,
      itemName,
      spec: formData.get("spec").trim(),
      unit: formData.get("unit").trim() || "个",
      brand: formData.get("brand").trim() || "其他",
      category: formData.get("category").trim() || "未分类",
      department: formData.get("department").trim() || "通用",
      stockQty,
      caseQty,
      orderableQty,
      unitPrice,
      sellPrice,
      safetyStock: Math.max(0, parseInt(formData.get("safetyStock"), 10) || 10),
      imageUrl: formData.get("imageUrl").trim() || productImage(itemCode, itemName),
    });

    els.productFormDialog.close();
    if (productFormMode === "cabinet") {
      cabinetProducts.push(finalizeCabinetProduct(product));
      persistCabinetProducts(cabinetProducts, { toast: t("toast.productAdded", { code: itemCode }) });
      return;
    }
    products.push(product);
    persistProducts(products, { toast: t("toast.productAdded", { code: itemCode }) });
  }

  function renderReports() {
    const totalOrders = orders.length;
    const totalAmount = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const thisMonth = orders.filter((o) => o.orderDate?.startsWith(todayISO().slice(0, 7))).length;

    els.reportStats.innerHTML = `
      <div class="stat-card"><div class="label">${t("reports.totalOrders")}</div><div class="value">${totalOrders}</div></div>
      <div class="stat-card"><div class="label">${t("reports.monthOrders")}</div><div class="value">${thisMonth}</div></div>
      <div class="stat-card"><div class="label">${t("reports.totalAmount")}</div><div class="value">${formatMoney(totalAmount)}</div></div>
      <div class="stat-card"><div class="label">${t("reports.skuCount")}</div><div class="value">${products.length}</div></div>`;

    if (!orders.length) {
      els.reportOrders.innerHTML = `<div class="empty-state">${t("reports.empty")}</div>`;
      return;
    }

    els.reportOrders.innerHTML = `
      <table class="data-table">
        <thead><tr><th>${t("reports.orderNo")}</th><th>${t("orders.branch")}</th><th>${t("orders.date")}</th><th>${t("orders.totalQty")}</th><th>${t("orders.totalAmount")}</th><th>${t("orders.status")}</th></tr></thead>
        <tbody>
          ${orders
            .slice(0, 10)
            .map(
              (o) => `
            <tr>
              <td>${escapeHtml(o.orderNo)}</td>
              <td>${escapeHtml(o.branchName)}</td>
              <td>${formatDate(o.orderDate)}</td>
              <td>${o.totalQty}</td>
              <td>${formatMoney(o.totalAmount)}</td>
              <td><span class="badge badge-${o.status}">${getStatusLabel(o.status)}</span></td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>`;
  }

  function renderBranchSettings() {
    els.branchList.innerHTML = branches
      .map(
        (b, i) => `
      <li>
        <span>${escapeHtml(b)}</span>
        <button class="btn-danger" data-remove-branch="${i}">${t("products.delete")}</button>
      </li>`
      )
      .join("");
  }

  function bindOrderingViewEvents(ctx) {
    const v = ctx.els;
    const isCabinet = ctx.id === "cabinet-reserve";
    const pageKey = isCabinet ? "cabinetPage" : "page";

    v.hdrBranch?.addEventListener("change", () => {
      const branch = v.hdrBranch.value;
      if (v.hdrBranchDisplay) v.hdrBranchDisplay.value = branch;
      ctx.cart.forEach((entry) => {
        entry.branchName = branch;
      });
      updateOverMinOrderHint(ctx);
      if (getActiveViewName() === ctx.id) renderOrderingView(ctx, { preserveView: true });
    });

    v.hdrRemark?.addEventListener("input", () => updateOverMinOrderHint(ctx));

    const searchBtn = document.getElementById(isCabinet ? "cab-btn-search" : "btn-search");
    searchBtn?.addEventListener("click", () => {
      hideSearchSuggestions(ctx);
      if (!tryAddSearchRecordFromInput(ctx)) {
        ctx.page = 1;
        renderOrderingView(ctx);
      }
    });

    v.searchCode?.addEventListener("input", () => {
      if (isCabinet) {
        clearTimeout(cabinetSearchSuggestTimer);
        cabinetSearchSuggestTimer = setTimeout(() => renderSearchSuggestions(ctx), 150);
      } else {
        toggleSpotSearchClearBtn();
        clearTimeout(searchSuggestTimer);
        searchSuggestTimer = setTimeout(() => renderSearchSuggestions(ctx), 120);
      }
    });
    v.searchCode?.addEventListener("focus", () => renderSearchSuggestions(ctx));
    v.searchCode?.addEventListener("keydown", (e) => {
      if (!isCabinet && !v.searchSuggestions?.hidden) {
        const items = v.searchSuggestions.querySelectorAll(".search-suggestion-item");
        if (items.length) {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            standardSearchSuggestIndex = Math.min(standardSearchSuggestIndex + 1, items.length - 1);
            updateSearchSuggestionHighlight(ctx);
            return;
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            standardSearchSuggestIndex = Math.max(standardSearchSuggestIndex - 1, 0);
            updateSearchSuggestionHighlight(ctx);
            return;
          }
          if (e.key === "Enter" && standardSearchSuggestIndex >= 0) {
            e.preventDefault();
            if (selectSearchSuggestionAt(ctx, standardSearchSuggestIndex)) return;
          }
        }
      }
      if (e.key === "Enter") {
        hideSearchSuggestions(ctx);
        if (!tryAddSearchRecordFromInput(ctx)) {
          ctx.page = 1;
          renderOrderingView(ctx);
        }
      }
      if (e.key === "Escape") hideSearchSuggestions(ctx);
    });

    if (!isCabinet) {
      document.getElementById("btn-clear-search-code")?.addEventListener("click", () => {
        v.searchCode.value = "";
        toggleSpotSearchClearBtn();
        hideSearchSuggestions(ctx);
        renderSearchPreview(ctx);
        v.searchCode.focus();
      });
    }

    v.searchSuggestions?.addEventListener("mousedown", (e) => {
      const btn = e.target.closest("[data-suggest-code]");
      if (!btn) return;
      e.preventDefault();
      jumpToProduct(ctx, btn.dataset.suggestCode);
    });

    v.filterCategory?.addEventListener("change", () => {
      populateFilters(ctx);
      ctx.page = 1;
      renderOrderingView(ctx);
    });
    [v.filterDepartment, v.filterStock].forEach((el) => {
      el?.addEventListener("change", () => {
        ctx.page = 1;
        renderOrderingView(ctx);
      });
    });

    const resetBtn = document.getElementById(isCabinet ? "cab-btn-reset-filters" : "btn-reset-filters");
    resetBtn?.addEventListener("click", () => {
      v.searchCode.value = "";
      if (!isCabinet) toggleSpotSearchClearBtn();
      ctx.searchRecords = [];
      ctx.searchHistorySelected = new Set();
      renderSearchHistory(ctx);
      hideSearchSuggestions(ctx);
      renderSearchPreview(ctx);
      v.filterCategory.value = "";
      v.filterDepartment.value = "";
      v.filterStock.value = "";
      ctx.page = 1;
      renderOrderingView(ctx);
    });

    const tplBtn = document.getElementById(
      isCabinet ? "cab-btn-download-order-import-template" : "btn-download-order-import-template"
    );
    tplBtn?.addEventListener("click", () => {
      downloadOrderImportTemplate(t("order.orderTemplateFilename"), products);
      showToast(t("order.orderTemplateDownloaded"));
    });

    const uploadInput = document.getElementById(isCabinet ? "cab-order-excel-upload" : "order-excel-upload");
    uploadInput?.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      if (v.orderImportResult) v.orderImportResult.hidden = true;
      try {
        const { lines } = await parseOrderImportFile(file);
        const { added, noStock } = applyOrderImportLines(ctx, lines);
        const msg = t("order.orderImported", { added, noStock });
        if (v.orderImportResult) {
          v.orderImportResult.hidden = false;
          v.orderImportResult.className = "import-result success";
          v.orderImportResult.textContent = `✓ ${msg}`;
        }
        showToast(msg);
      } catch (err) {
        if (v.orderImportResult) {
          v.orderImportResult.hidden = false;
          v.orderImportResult.className = "import-result error";
          v.orderImportResult.textContent = `✗ ${err.message}`;
        }
        showToast(err.message || t("order.orderImportFail"));
      }
    });

    v.productGrid?.addEventListener("click", (e) => {
      const card = e.target.closest(".product-card[data-code]");
      if (!card) return;
      const input = card.querySelector(".qty-input");
      if (!input) return;
      if (e.target.dataset.action === "dec") {
        input.value = Math.max(0, parseInt(input.value, 10) - 1 || 0);
      }
      if (e.target.dataset.action === "inc") {
        const max = parseInt(input.max, 10);
        input.value = Math.min(max, (parseInt(input.value, 10) || 0) + 1);
      }
      if (e.target.dataset.action === "add") {
        addToCartFromCard(ctx, card);
      }
    });

    v.productGrid?.addEventListener("keydown", (e) => {
      if (!e.target.classList.contains("qty-input") || e.key !== "Enter") return;
      const card = e.target.closest(".product-card[data-code]");
      if (!card) return;
      e.preventDefault();
      ctx.skipNextQtyChange = true;
      const max = parseInt(e.target.max, 10);
      const val = parseInt(e.target.value, 10) || 0;
      e.target.value = Math.min(max, Math.max(0, val));
      addToCartFromCard(ctx, card);
    });

    v.productGrid?.addEventListener("change", (e) => {
      if (!e.target.classList.contains("qty-input")) return;
      if (ctx.skipNextQtyChange) {
        ctx.skipNextQtyChange = false;
        return;
      }
      const max = parseInt(e.target.max, 10);
      const val = parseInt(e.target.value, 10) || 0;
      e.target.value = Math.min(max, Math.max(0, val));
      const card = e.target.closest(".product-card[data-code]");
      if (card && val > 0) addToCartFromCard(ctx, card);
    });

    v.productPagination?.addEventListener("click", (e) => {
      const btn = e.target.closest(".page-btn");
      if (!btn || btn.disabled) return;
      const p = btn.dataset[pageKey];
      if (p === "prev") ctx.page -= 1;
      else if (p === "next") ctx.page += 1;
      else ctx.page = parseInt(p, 10);
      renderOrderingView(ctx);
    });

    document.getElementById(ctx.headerSubmitId)?.addEventListener("click", () => submitOrder(ctx));
  }

  /* Events */
  els.navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const view = item.dataset.view;
      if (!view) return;
      switchView(view);
    });
  });

  bindOrderingViewEvents(standardOrderingCtx);
  bindOrderingViewEvents(cabinetOrderingCtx);

  document.addEventListener("click", (e) => {
    [standardOrderingCtx, cabinetOrderingCtx].forEach((ctx) => {
      const group = ctx.els.searchCode?.closest(".search-group-autocomplete");
      if (!ctx.els.searchSuggestions || ctx.els.searchSuggestions.hidden) return;
      if (!group?.contains(e.target)) hideSearchSuggestions(ctx);
    });
  });

  document.getElementById("btn-clear-cart").addEventListener("click", () => {
    const ctx = getActiveOrderingCtx();
    ctx.cart.clear();
    updateCartBar();
    updateOverMinOrderHint(ctx);
    renderOrderingView(ctx);
    if (els.cartDialog?.open) renderCartDialog(ctx);
    showToast(t("cart.cleared"));
  });

  document.getElementById("btn-view-cart").addEventListener("click", () => openCartDialog());

  document.getElementById("btn-close-cart-dialog").addEventListener("click", () => {
    cartDialogCtx = null;
    els.cartDialog.close();
  });
  document.getElementById("btn-cart-dialog-continue").addEventListener("click", () => {
    cartDialogCtx = null;
    els.cartDialog.close();
  });
  document.getElementById("btn-cart-dialog-clear").addEventListener("click", () => {
    const ctx = cartDialogCtx || getActiveOrderingCtx();
    ctx.cart.clear();
    updateCartBar();
    updateOverMinOrderHint(ctx);
    renderOrderingView(ctx);
    renderCartDialog(ctx);
    showToast(t("cart.cleared"));
  });
  document.getElementById("btn-cart-dialog-submit").addEventListener("click", () =>
    submitOrder(cartDialogCtx || getActiveOrderingCtx())
  );

  els.cartDialogBody.addEventListener("click", (e) => {
    const ctx = cartDialogCtx || getActiveOrderingCtx();
    const row = e.target.closest("[data-cart-code]");
    if (!row) return;
    const code = row.dataset.cartCode;
    const input = row.querySelector(".cart-qty-input");
    if (e.target.dataset.cartAction === "dec") {
      input.value = Math.max(0, parseInt(input.value, 10) - 1 || 0);
      addToCart(ctx, code, input.value);
    }
    if (e.target.dataset.cartAction === "inc") {
      const max = parseInt(input.max, 10);
      input.value = Math.min(max, (parseInt(input.value, 10) || 0) + 1);
      addToCart(ctx, code, input.value);
    }
    if (e.target.dataset.cartRemove) {
      addToCart(ctx, code, 0);
      if (!ctx.cart.size) {
        cartDialogCtx = null;
        els.cartDialog.close();
      }
    }
  });

  els.cartDialogBody.addEventListener("change", (e) => {
    const ctx = cartDialogCtx || getActiveOrderingCtx();
    if (!e.target.classList.contains("cart-qty-input")) return;
    const row = e.target.closest("[data-cart-code]");
    if (!row) return;
    const max = parseInt(e.target.max, 10);
    const val = Math.min(max, Math.max(0, parseInt(e.target.value, 10) || 0));
    e.target.value = val;
    addToCart(ctx, row.dataset.cartCode, val);
    if (!ctx.cart.size) {
      cartDialogCtx = null;
      els.cartDialog.close();
    }
  });

  document.getElementById("btn-submit-order").addEventListener("click", () => submitOrder());

  document.getElementById("btn-refresh-suggestions")?.addEventListener("click", refreshSuggestionsPage);

  document.getElementById("btn-export-suggestions")?.addEventListener("click", () => {
    downloadSuggestionsExcel(`suggestions_${todayISO()}.xlsx`, products, branchMinOrders);
    showToast(t("suggestionsPage.exported"));
  });

  document.getElementById("btn-download-suggestions-template")?.addEventListener("click", () => {
    downloadSuggestionsTemplate(t("suggestionsPage.templateFilename"), products);
    showToast(t("suggestionsPage.templateDownloaded"));
  });

  document.getElementById("suggestions-excel-upload")?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const { count } = await parseSuggestionsImportFile(file);
      if (els.suggestionsImportResult) {
        els.suggestionsImportResult.hidden = false;
        els.suggestionsImportResult.innerHTML = t("suggestionsPage.imported", { n: count });
      }
      showToast(t("suggestionsPage.imported", { n: count }));
    } catch (err) {
      showToast(err.message || t("suggestionsPage.importFail"));
    }
  });

  els.suggestionSearch?.addEventListener("input", () => {
    clearTimeout(suggestionSearchTimer);
    suggestionSearchTimer = setTimeout(
      () => renderSuggestionsPage({ showLoading: false, skipFilterPopulate: true }),
      300
    );
  });
  els.suggestionOnlyRestock?.addEventListener("change", () =>
    renderSuggestionsPage({ showLoading: false, skipFilterPopulate: true })
  );
  els.suggestionFilterCategory?.addEventListener("change", () => {
    populateSuggestionFilters();
    renderSuggestionsPage({ showLoading: false });
  });
  els.suggestionFilterDepartment?.addEventListener("change", () =>
    renderSuggestionsPage({ showLoading: false, skipFilterPopulate: true })
  );
  document.getElementById("btn-reset-suggestion-filters")?.addEventListener("click", resetSuggestionFilters);
  document.getElementById("btn-suggestion-bulk-apply")?.addEventListener("click", applyBulkMinOrderEdit);

  els.suggestionsFullList?.addEventListener("click", (e) => {
    if (e.target.id === "btn-clear-over-min-alerts") {
      clearSelectedOverMinAlerts();
      return;
    }
    const jump = e.target.closest(".over-min-alert-jump");
    if (jump) {
      focusMinOrderFromOverAlert(jump.dataset.itemCode, jump.dataset.branch, jump.dataset.quantity);
    }
  });

  els.suggestionsFullList?.addEventListener("change", (e) => {
    if (e.target.id === "over-min-select-all") {
      overMinAlertVisibleKeys.forEach((key) => {
        if (e.target.checked) overMinAlertSelected.add(key);
        else overMinAlertSelected.delete(key);
      });
      els.suggestionsFullList?.querySelectorAll("tr[data-alert-key]").forEach((row) => {
        const key = row.dataset.alertKey;
        const checked = overMinAlertSelected.has(key);
        row.classList.toggle("is-selected", checked);
        const cb = row.querySelector(".over-min-alert-check");
        if (cb) cb.checked = checked;
      });
      updateOverMinAlertToolbar();
      return;
    }
    if (e.target.classList.contains("over-min-alert-check")) {
      const key = e.target.dataset.alertKey;
      if (e.target.checked) overMinAlertSelected.add(key);
      else overMinAlertSelected.delete(key);
      const row = e.target.closest("tr[data-alert-key]");
      if (row) row.classList.toggle("is-selected", e.target.checked);
      updateOverMinAlertToolbar();
      return;
    }
    if (e.target.classList.contains("sug-min-order-input")) {
      const itemCode = e.target.dataset.itemCode;
      const branch = e.target.dataset.branch;
      const val = Math.max(0, parseInt(e.target.value, 10) || 0);
      e.target.value = val > 0 ? String(val) : "";
      applyMinOrderCellEdit(itemCode, branch, val);
      return;
    }
    if (e.target.id === "suggestion-select-all") {
      suggestionVisibleCodes.forEach((code) => {
        if (e.target.checked) suggestionSelectedCodes.add(code);
        else suggestionSelectedCodes.delete(code);
      });
      els.suggestionsFullList
        ?.querySelectorAll(".suggestion-row-check")
        .forEach((cb) => {
          cb.checked = e.target.checked;
        });
      updateSuggestionBulkBar();
      return;
    }
    if (e.target.classList.contains("suggestion-row-check")) {
      const code = e.target.dataset.itemCode;
      if (e.target.checked) suggestionSelectedCodes.add(code);
      else suggestionSelectedCodes.delete(code);
      updateSuggestionBulkBar();
    }
  });

  els.orderFilterSearch?.addEventListener("input", () => {
    clearTimeout(ordersListTimer);
    ordersListTimer = setTimeout(renderOrdersList, 200);
  });
  els.orderFilterBranch?.addEventListener("change", renderOrdersList);
  els.orderFilterStatus?.addEventListener("change", renderOrdersList);
  document.getElementById("btn-clear-order-filters").addEventListener("click", () => {
    els.orderFilterSearch.value = "";
    els.orderFilterBranch.value = "";
    els.orderFilterStatus.value = "";
    renderOrdersList();
  });

  document.getElementById("btn-export-orders-excel")?.addEventListener("click", () => {
    exportOrdersExcel(getOrdersForExport());
  });

  document.getElementById("btn-export-cabinet-orders-excel")?.addEventListener("click", () => {
    exportCabinetOrdersExcel();
  });

  els.ordersManageList?.addEventListener("click", (e) => {
    const viewId = e.target.dataset.viewOrder;
    const deleteId = e.target.dataset.deleteOrder;
    const splitId = e.target.dataset.splitOrder;
    if (viewId) openOrderDetail(viewId);
    if (splitId) openSplitDialog(splitId);
    if (deleteId) deleteSingleOrder(deleteId);
  });

  document.getElementById("cabinet-orders-manage-list")?.addEventListener("click", (e) => {
    const viewId = e.target.dataset.viewOrder;
    const deleteId = e.target.dataset.deleteOrder;
    const splitId = e.target.dataset.splitOrder;
    if (viewId) openOrderDetail(viewId);
    if (splitId) openSplitDialog(splitId);
    if (deleteId) deleteSingleOrder(deleteId);
  });

  document.querySelector(".orders-cabinet-panel")?.addEventListener("change", (e) => {
    if (e.target.dataset.statusOrder) {
      updateOrderStatus(e.target.dataset.statusOrder, e.target.value);
    }
  });

  document.querySelector(".orders-manage-panel")?.addEventListener("change", (e) => {
    if (e.target.dataset.statusOrder) {
      updateOrderStatus(e.target.dataset.statusOrder, e.target.value);
      return;
    }
    if (e.target.id === "orders-select-all") {
      if (e.target.checked) {
        getFilteredOrders()
          .filter((o) => !isCabinetReserveOrder(o))
          .forEach((o) => orderSelection.add(o.id));
      } else {
        orderSelection.clear();
      }
      renderOrdersList();
      return;
    }
  });

  els.ordersManageList?.addEventListener("change", (e) => {
    if (e.target.classList.contains("order-select-check")) {
      const id = e.target.dataset.orderId;
      if (e.target.checked) orderSelection.add(id);
      else orderSelection.delete(id);
      updateOrderSelectionToolbar();
      const row = e.target.closest("tr[data-order-id]");
      if (row) row.classList.toggle("is-selected", e.target.checked);
      const selectAll = document.getElementById("orders-select-all");
      if (selectAll) {
        const checks = els.ordersManageList.querySelectorAll(".order-select-check");
        const checked = [...checks].filter((cb) => cb.checked).length;
        selectAll.checked = checks.length > 0 && checked === checks.length;
        selectAll.indeterminate = checked > 0 && checked < checks.length;
      }
    }
  });

  els.ordersList.addEventListener("click", (e) => {
    // matrix table has no row actions
  });

  els.ordersList.addEventListener("change", () => {
    // matrix table has no inputs
  });

  els.detailStatusSelect?.addEventListener("change", (e) => {
    if (!detailOrderId) return;
    updateOrderStatus(detailOrderId, e.target.value);
    openOrderDetail(detailOrderId);
  });

  document.getElementById("btn-detail-export-excel")?.addEventListener("click", () => {
    const order = orders.find((o) => o.id === detailOrderId);
    exportSingleOrderExcel(order);
  });

  document.getElementById("btn-detail-export")?.addEventListener("click", () => {
    const order = orders.find((o) => o.id === detailOrderId);
    if (!order) return;
    downloadCSV(`${order.orderNo}.csv`, exportOrderCSV(order));
    showToast(t("orders.exported"));
  });

  document.getElementById("btn-detail-delete")?.addEventListener("click", () => {
    if (!detailOrderId) return;
    deleteSingleOrder(detailOrderId);
  });

  els.btnDeleteOrders?.addEventListener("click", deleteSelectedOrders);
  els.btnMergeOrders?.addEventListener("click", mergeSelectedOrders);
  els.btnSplitOrder?.addEventListener("click", () => {
    const selected = getSelectedOrders();
    if (selected.length === 1) openSplitDialog(selected[0].id);
  });

  els.orderSplitBody?.addEventListener("input", (e) => {
    if (!e.target.classList.contains("split-qty-input")) return;
    const row = e.target.closest("tr[data-split-code]");
    if (!row) return;
    const max = parseInt(e.target.max, 10);
    const batch1 = Math.min(max, Math.max(0, parseInt(e.target.value, 10) || 0));
    e.target.value = batch1;
    row.querySelector(".split-batch2-qty").textContent = max - batch1;
  });

  document.getElementById("btn-close-split")?.addEventListener("click", () => {
    splitOrderId = null;
    els.orderSplitDialog.close();
  });
  document.getElementById("btn-split-cancel")?.addEventListener("click", () => {
    splitOrderId = null;
    els.orderSplitDialog.close();
  });
  document.getElementById("btn-split-confirm")?.addEventListener("click", confirmSplitOrder);

  document.getElementById("btn-close-detail").addEventListener("click", () => els.detailDialog.close());
  document.getElementById("btn-detail-close").addEventListener("click", () => els.detailDialog.close());

  /* Stock admin */
  document.getElementById("btn-save-all-stock")?.addEventListener("click", saveAllStockChanges);
  document.getElementById("btn-add-product")?.addEventListener("click", () => openProductForm("main"));
  els.adminSearch?.addEventListener("input", () => {
    adminPage = 1;
    renderAdminProductList();
  });

  els.adminProductPagination?.addEventListener("click", (e) => {
    const btn = e.target.closest(".page-btn");
    if (!btn || btn.disabled) return;
    const p = btn.dataset.adminPage;
    if (p === "prev") adminPage -= 1;
    else if (p === "next") adminPage += 1;
    else adminPage = parseInt(p, 10);
    renderAdminProductList();
  });

  els.stockEditBody?.addEventListener("click", (e) => {
    const saveCode = e.target.dataset.saveStock;
    const deleteCode = e.target.dataset.deleteProduct;
    if (saveCode) saveSingleStock(saveCode);
    if (deleteCode) deleteProduct(deleteCode);
  });

  els.stockEditBody?.addEventListener("change", (e) => {
    if (!e.target.classList.contains("stock-input")) return;
    const row = e.target.closest("tr[data-code]");
    if (!row || e.target.dataset.field !== "stockQty") return;
    const stockQty = Math.max(0, parseInt(e.target.value, 10) || 0);
    const orderableInput = row.querySelector('[data-field="orderableQty"]');
    if (orderableInput && parseInt(orderableInput.value, 10) > stockQty) {
      orderableInput.value = stockQty;
    }
  });

  /* Cabinet product admin */
  document.getElementById("btn-save-all-cabinet-stock")?.addEventListener("click", saveAllCabinetStockChanges);
  document.getElementById("btn-add-cabinet-product")?.addEventListener("click", () => openProductForm("cabinet"));
  els.cabinetAdminSearch?.addEventListener("input", () => {
    syncCabinetStockRowsFromDom();
    cabinetAdminPage = 1;
    renderCabinetProductAdmin();
  });
  els.cabinetAdminPagination?.addEventListener("click", (e) => {
    const btn = e.target.closest(".page-btn");
    if (!btn || btn.disabled) return;
    syncCabinetStockRowsFromDom();
    const p = btn.dataset.cabinetAdminPage;
    if (p === "prev") cabinetAdminPage -= 1;
    else if (p === "next") cabinetAdminPage += 1;
    else cabinetAdminPage = parseInt(p, 10);
    renderCabinetProductAdmin();
  });
  els.cabinetStockEditBody?.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-action-menu-trigger]");
    if (trigger) {
      e.stopPropagation();
      const panel = trigger.nextElementSibling;
      const wasOpen = panel && !panel.hidden;
      closeCabinetRowActionMenus();
      if (panel && !wasOpen) {
        panel.hidden = false;
        trigger.setAttribute("aria-expanded", "true");
      }
      return;
    }
    const saveCode = e.target.dataset.saveCabinetStock;
    const toggleCode = e.target.dataset.toggleCabinetReserved;
    const deleteCode = e.target.dataset.deleteCabinetProduct;
    if (saveCode) {
      closeCabinetRowActionMenus();
      saveSingleCabinetStock(saveCode);
    }
    if (toggleCode) {
      closeCabinetRowActionMenus();
      toggleCabinetReserved(toggleCode);
    }
    if (deleteCode) {
      closeCabinetRowActionMenus();
      deleteCabinetProduct(deleteCode);
    }
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".cabinet-products-admin .row-action-menu")) {
      closeCabinetRowActionMenus();
    }
  });
  document.getElementById("btn-download-cabinet-template")?.addEventListener("click", () => {
    const source = cabinetProducts.length
      ? cabinetProducts
      : DEFAULT_PRODUCTS.map((p) => normalizeProduct({ ...p }));
    downloadCabinetExcel("新货柜预定商品模板.xlsx", source);
    showToast(t("toast.tplDownloaded"));
  });
  document.getElementById("btn-export-cabinet-products")?.addEventListener("click", () => {
    downloadCabinetExcel(`cabinet_products_${todayISO()}.xlsx`, cabinetProducts);
    showToast(t("toast.exported", { n: cabinetProducts.length }));
  });
  document.getElementById("btn-copy-from-main-products")?.addEventListener("click", copyMainProductsToCabinet);
  document.getElementById("cabinet-excel-upload")?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (els.cabinetImportResult) els.cabinetImportResult.hidden = true;
    try {
      const imported = await parseCabinetExcelFile(file);
      const result = mergeCabinetProducts(cabinetProducts, imported);
      persistCabinetProducts(result.products, {
        toast: t("toast.cabinetExcelSynced", {
          n: result.total,
          removed: result.removed,
        }),
      });
      if (els.cabinetImportResult) {
        els.cabinetImportResult.hidden = false;
        els.cabinetImportResult.className = "import-result success";
        const removedNote =
          result.removed > 0
            ? `，<strong>移除 ${result.removed} 件</strong>（Excel 中未出现）`
            : "";
        els.cabinetImportResult.innerHTML =
          `✓ 导入成功：共 ${result.total} 行，` +
          `<strong>覆盖更新 ${result.updated} 件</strong>，新增 ${result.added} 件${removedNote}。` +
          ` 新货柜预定商品库已按 Excel 全部更新。`;
      }
    } catch (err) {
      if (els.cabinetImportResult) {
        els.cabinetImportResult.hidden = false;
        els.cabinetImportResult.className = "import-result error";
        els.cabinetImportResult.textContent = `✗ 导入失败：${err.message}`;
      }
      showToast(t("toast.importFail"));
    }
    e.target.value = "";
  });

  document.getElementById("btn-close-product-form").addEventListener("click", () => els.productFormDialog.close());
  document.getElementById("btn-cancel-product-form").addEventListener("click", () => els.productFormDialog.close());
  els.productForm.addEventListener("submit", (e) => {
    e.preventDefault();
    saveNewProduct(new FormData(els.productForm));
  });

  function handleInventoryExcelUpload(file) {
    els.inventoryImportResult.hidden = true;
    return parseInventoryExcelFile(file).then((patches) => {
      const result = mergeInventoryUpdate(products, patches);
      persistProducts(result.products, {
        fromInventoryUpload: true,
        toast: t("toast.inventorySynced", { n: result.total }),
      });
      els.inventoryImportResult.hidden = false;
      els.inventoryImportResult.className = "import-result success";
      els.inventoryImportResult.innerHTML =
        `✓ 库存同步成功：共 ${result.total} 行，` +
        `覆盖 ${result.updated} 件，新增 ${result.added} 件，移除 ${result.removed} 件。` +
        `<br/>现货目录、商品分类与部门分类已按 Excel 全部更新；新货柜预定商品库未变动。`;
      return result;
    });
  }

  /* Inventory Excel */
  document.getElementById("btn-download-inventory-template").addEventListener("click", () => {
    downloadInventoryExcel("现货目录模板.xlsx", [], { templateOnly: true });
    showToast(t("toast.inventoryTplDownloaded"));
  });

  document.getElementById("btn-export-inventory").addEventListener("click", () => {
    downloadInventoryExcel(`现货目录_${todayISO()}.xlsx`, products);
    showToast(t("toast.inventoryExported", { n: products.length }));
  });

  document.getElementById("inventory-excel-upload").addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await handleInventoryExcelUpload(file);
    } catch (err) {
      els.inventoryImportResult.hidden = false;
      els.inventoryImportResult.className = "import-result error";
      els.inventoryImportResult.textContent = `✗ 库存更新失败：${err.message}`;
      showToast(t("toast.inventoryImportFail"));
    }
    e.target.value = "";
  });

  document.getElementById("btn-add-branch").addEventListener("click", () => {
    const name = els.newBranch.value.trim();
    if (!name) {
      showToast(t("settings.enterBranch"));
      return;
    }
    if (branches.includes(name)) {
      showToast(t("settings.branchExists"));
      return;
    }
    branches.push(name);
    saveBranches(branches);
    els.newBranch.value = "";
    populateBranchSelects();
    renderBranchSettings();
    showToast(t("settings.branchAdded", { name }));
  });

  els.branchList.addEventListener("click", (e) => {
    const idx = e.target.dataset.removeBranch;
    if (idx === undefined) return;
    const i = parseInt(idx, 10);
    branches.splice(i, 1);
    saveBranches(branches);
    populateBranchSelects();
    renderBranchSettings();
    showToast(t("settings.branchDeleted"));
  });

  document.getElementById("btn-logout")?.addEventListener("click", () => {
    sessionStorage.removeItem("orderPlatform_session");
    window.location.href = "login.html";
  });

  /* 跨标签页 / 同页后台更新 → 前台自动同步 */
  window.addEventListener(PRODUCTS_UPDATED_EVENT, () => {
    if (getProductsVersion() === productsVersion) return;
    syncAllViews();
  });

  window.addEventListener(CABINET_PRODUCTS_UPDATED_EVENT, () => {
    if (getCabinetProductsVersion() === cabinetProductsVersion) return;
    syncCabinetProductsViews();
  });

  window.addEventListener(BRANCH_MIN_ORDERS_UPDATED_EVENT, () => {
    if (skipNextMinOrderSync) {
      skipNextMinOrderSync = false;
      return;
    }
    if (getBranchMinOrdersVersion() === branchMinOrdersVersion) return;
    syncBranchMinOrdersViews();
  });

  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEYS.products || e.key === STORAGE_KEYS.productsVersion) {
      if (getProductsVersion() === productsVersion) return;
      syncAllViews();
      return;
    }
    if (
      e.key === STORAGE_KEYS.cabinetProducts ||
      e.key === STORAGE_KEYS.cabinetProductsVersion
    ) {
      if (getCabinetProductsVersion() === cabinetProductsVersion) return;
      syncCabinetProductsViews();
      return;
    }
    if (
      e.key === STORAGE_KEYS.branchMinOrders ||
      e.key === STORAGE_KEYS.branchMinOrdersVersion
    ) {
      if (getBranchMinOrdersVersion() === branchMinOrdersVersion) return;
      syncBranchMinOrdersViews();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    const productsStale = getProductsVersion() !== productsVersion;
    const cabinetStale = getCabinetProductsVersion() !== cabinetProductsVersion;
    const minOrdersStale = getBranchMinOrdersVersion() !== branchMinOrdersVersion;
    if (productsStale) {
      syncAllViews({ toast: t("toast.autoSynced") });
    } else if (cabinetStale) {
      syncCabinetProductsViews({ toast: t("toast.autoSynced") });
    } else if (minOrdersStale) {
      syncBranchMinOrdersViews({ toast: t("toast.minOrderSynced") });
    }
  });

  function refreshLanguage() {
    applyStaticI18n();
    syncAllViews();
  }

  bindSearchHistorySwipe();

  /* Init */
  applyStaticI18n();
  initLangSwitcher(refreshLanguage);
  initThemeSwitcher();
  initPrefPanel();
  branches = loadBranches();
  renderSearchPreview();
  renderSearchPreview(cabinetOrderingCtx);
  toggleSpotSearchClearBtn();
  els.hdrDate.value = todayISO();
  if (cabinetEls.hdrDate) cabinetEls.hdrDate.value = todayISO();
  populateBranchSelects();
  switchView("ordering");
})();
