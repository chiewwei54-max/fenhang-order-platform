/** 订单汇总表分行列（按此顺序显示，表头为小写） */
const ORDER_MATRIX_BRANCHES = [
  "SIBURAN",
  "TAPAH",
  "GEDONG",
  "LACHAU",
  "SARATOK",
  "KABONG",
];

/** 默认分行列表（含 PENDING + 订单矩阵分行） */
const DEFAULT_BRANCHES = ["PENDING", ...ORDER_MATRIX_BRANCHES];

const STATUS_LABELS = {
  draft: "草稿",
  submitted: "已提交",
  confirmed: "已确认",
  shipped: "已发货",
};

const STORAGE_KEYS = {
  orders: "orderPlatform_orders",
  branches: "orderPlatform_branches",
  products: "orderPlatform_products",
  productsVersion: "orderPlatform_productsVersion",
  cabinetProducts: "orderPlatform_cabinetProducts",
  cabinetProductsVersion: "orderPlatform_cabinetProductsVersion",
  branchMinOrders: "orderPlatform_branchMinOrders",
  branchMinOrdersVersion: "orderPlatform_branchMinOrdersVersion",
  overMinDismissed: "orderPlatform_overMinDismissed",
  counter: "orderPlatform_counter",
  storageSyncVersion: "orderPlatform_storageSyncVersion",
};

const PRODUCTS_UPDATED_EVENT = "orderPlatform:productsUpdated";
const CABINET_PRODUCTS_UPDATED_EVENT = "orderPlatform:cabinetProductsUpdated";
const BRANCH_MIN_ORDERS_UPDATED_EVENT = "orderPlatform:branchMinOrdersUpdated";

/** Excel 模板列定义（中英文映射） */
const EXCEL_COLUMNS = [
  { key: "itemCode", zh: "商品代码", en: "itemCode" },
  { key: "itemName", zh: "商品名称", en: "itemName" },
  { key: "spec", zh: "规格型号", en: "spec" },
  { key: "unit", zh: "单位", en: "unit" },
  { key: "brand", zh: "品牌", en: "brand" },
  { key: "category", zh: "商品分类", en: "category" },
  { key: "department", zh: "部门分类", en: "department" },
  { key: "stockQty", zh: "库存数量", en: "stockQty" },
  { key: "orderableQty", zh: "可订购数量", en: "orderableQty" },
  { key: "caseQty", zh: "箱数", en: "caseQty" },
  { key: "unitPrice", zh: "单价", en: "unitPrice" },
  { key: "sellPrice", zh: "卖价", en: "sellPrice" },
  { key: "safetyStock", zh: "安全库存", en: "safetyStock" },
  { key: "imageUrl", zh: "图片URL", en: "imageUrl" },
];

/** 新货柜预定商品 Excel 列（与商品管理字段一致，不含操作） */
const CABINET_EXCEL_COLUMNS = [
  { key: "itemCode", zh: "ITEM CODE", en: "itemcode" },
  { key: "itemName", zh: "商品名称", en: "itemname" },
  { key: "unit", zh: "单位", en: "unit" },
  { key: "caseQty", zh: "CTN(PCS)", en: "ctn(pcs)" },
  { key: "unitPrice", zh: "COST PRICE", en: "costprice" },
  { key: "sellPrice", zh: "SELLING PRICE", en: "sellingprice" },
  { key: "cabinetReserved", zh: "已预定", en: "reserved" },
  { key: "imageUrl", zh: "PHOTO", en: "photo" },
  { key: "barcode", zh: "Barcode", en: "barcode" },
];

/** 现货目录统一 Excel 模块（下载模板、导出、上传均使用此列定义） */
const INVENTORY_EXCEL_COLUMNS = [
  { key: "caseQty", zh: "箱数/ctn", en: "caseqty" },
  { key: "category", zh: "Item Group", en: "itemgroup" },
  { key: "department", zh: "Department", en: "department" },
  { key: "itemCode", zh: "Item Code", en: "itemcode" },
  { key: "barcode", zh: "Bar Code", en: "barcode" },
  { key: "imageUrl", zh: "Photo", en: "photo" },
  { key: "itemName", zh: "Description", en: "description" },
  { key: "unit", zh: "UOM", en: "uom" },
  { key: "unitPrice", zh: "Cost", en: "cost" },
  { key: "sellPrice", zh: "Price", en: "price" },
];

const INVENTORY_EXCEL_SHEET_NAME = "现货目录";

/** 订货管理 Excel 导入列（商品代码 + 订购数量） */
const ORDER_IMPORT_COLUMNS = [
  { key: "itemCode", zh: "商品代码", en: "itemCode" },
  { key: "itemName", zh: "商品名称", en: "itemName" },
  { key: "quantity", zh: "订购数量", en: "quantity" },
];

function productImage(code, name) {
  const seed = encodeURIComponent(code || name || "product");
  return `https://picsum.photos/seed/${seed}/120/120`;
}

/** 默认商品库（含图片） */
const DEFAULT_PRODUCTS = [
  {
    itemCode: "IC00001",
    itemName: "A4 复印纸",
    spec: "80g 500张/包",
    unit: "包",
    brand: "得力",
    category: "办公文具",
    department: "行政部",
    stockQty: 120,
    orderableQty: 100,
    caseQty: 10,
    unitPrice: 25.5,
    sellPrice: 32.0,
    safetyStock: 50,
    imageUrl: productImage("IC00001", "A4纸"),
  },
  {
    itemCode: "IC00002",
    itemName: "中性笔",
    spec: "0.5mm 黑色",
    unit: "支",
    brand: "晨光",
    category: "办公文具",
    department: "行政部",
    stockQty: 500,
    orderableQty: 480,
    caseQty: 20,
    unitPrice: 2.5,
    sellPrice: 3.5,
    safetyStock: 200,
    imageUrl: productImage("IC00002", "中性笔"),
  },
  {
    itemCode: "IC00003",
    itemName: "订书机",
    spec: "12号标准型",
    unit: "个",
    brand: "齐心",
    category: "办公文具",
    department: "行政部",
    stockQty: 45,
    orderableQty: 40,
    caseQty: 5,
    unitPrice: 18.0,
    sellPrice: 24.0,
    safetyStock: 20,
    imageUrl: productImage("IC00003", "订书机"),
  },
  {
    itemCode: "IC00004",
    itemName: "文件夹",
    spec: "A4 双强力夹",
    unit: "个",
    brand: "得力",
    category: "办公文具",
    department: "行政部",
    stockQty: 80,
    orderableQty: 75,
    caseQty: 8,
    unitPrice: 6.8,
    sellPrice: 9.9,
    safetyStock: 30,
    imageUrl: productImage("IC00004", "文件夹"),
  },
  {
    itemCode: "IC00005",
    itemName: "便签纸",
    spec: "76×76mm 100张",
    unit: "本",
    brand: "3M",
    category: "办公文具",
    department: "行政部",
    stockQty: 15,
    orderableQty: 12,
    caseQty: 2,
    unitPrice: 8.5,
    sellPrice: 12.0,
    safetyStock: 25,
    imageUrl: productImage("IC00005", "便签纸"),
  },
  {
    itemCode: "IC00006",
    itemName: "白板笔",
    spec: "可擦 黑色",
    unit: "支",
    brand: "晨光",
    category: "办公文具",
    department: "行政部",
    stockQty: 200,
    orderableQty: 190,
    caseQty: 15,
    unitPrice: 4.2,
    sellPrice: 6.0,
    safetyStock: 80,
    imageUrl: productImage("IC00006", "白板笔"),
  },
  {
    itemCode: "IC00007",
    itemName: "抽纸",
    spec: "3层 130抽×6包",
    unit: "提",
    brand: "维达",
    category: "日用品",
    department: "后勤部",
    stockQty: 60,
    orderableQty: 55,
    caseQty: 10,
    unitPrice: 19.9,
    sellPrice: 26.9,
    safetyStock: 30,
    imageUrl: productImage("IC00007", "抽纸"),
  },
  {
    itemCode: "IC00008",
    itemName: "洗手液",
    spec: "500ml 抑菌",
    unit: "瓶",
    brand: "蓝月亮",
    category: "日用品",
    department: "后勤部",
    stockQty: 8,
    orderableQty: 5,
    caseQty: 1,
    unitPrice: 12.8,
    sellPrice: 16.8,
    safetyStock: 20,
    imageUrl: productImage("IC00008", "洗手液"),
  },
  {
    itemCode: "IC00009",
    itemName: "垃圾袋",
    spec: "45×55cm 50只",
    unit: "卷",
    brand: "妙洁",
    category: "日用品",
    department: "后勤部",
    stockQty: 90,
    orderableQty: 85,
    caseQty: 9,
    unitPrice: 9.9,
    sellPrice: 13.5,
    safetyStock: 40,
    imageUrl: productImage("IC00009", "垃圾袋"),
  },
  {
    itemCode: "IC00010",
    itemName: "U 盘",
    spec: "32GB USB3.0",
    unit: "个",
    brand: "金士顿",
    category: "电子设备",
    department: "营业部",
    stockQty: 25,
    orderableQty: 22,
    caseQty: 3,
    unitPrice: 45.0,
    sellPrice: 58.0,
    safetyStock: 15,
    imageUrl: productImage("IC00010", "U盘"),
  },
  {
    itemCode: "IC00011",
    itemName: "鼠标垫",
    spec: "大号 防滑",
    unit: "张",
    brand: "罗技",
    category: "电子设备",
    department: "营业部",
    stockQty: 0,
    orderableQty: 0,
    caseQty: 0,
    unitPrice: 15.0,
    sellPrice: 19.9,
    safetyStock: 10,
    imageUrl: productImage("IC00011", "鼠标垫"),
  },
  {
    itemCode: "IC00012",
    itemName: "硒鼓",
    spec: "HP 88A 兼容",
    unit: "个",
    brand: "格之格",
    category: "电子设备",
    department: "营业部",
    stockQty: 18,
    orderableQty: 15,
    caseQty: 2,
    unitPrice: 89.0,
    sellPrice: 108.0,
    safetyStock: 10,
    imageUrl: productImage("IC00012", "硒鼓"),
  },
];

function loadBranches() {
  const saved = localStorage.getItem(STORAGE_KEYS.branches);
  let list = null;
  if (saved) {
    try {
      list = JSON.parse(saved);
    } catch {
      list = null;
    }
  }
  if (!Array.isArray(list) || !list.length) {
    return [...DEFAULT_BRANCHES];
  }
  const seen = new Set();
  const merged = [];
  ["PENDING", ...ORDER_MATRIX_BRANCHES].forEach((name) => {
    const key = normalizeBranchKey(name);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(name);
    }
  });
  list.forEach((name) => {
    const trimmed = String(name || "").trim();
    if (!trimmed) return;
    const key = normalizeBranchKey(trimmed);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(trimmed);
    }
  });
  return merged.length ? merged : [...DEFAULT_BRANCHES];
}

function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function saveBranches(branches) {
  localStorage.setItem(STORAGE_KEYS.branches, JSON.stringify(branches));
  bumpStorageSyncVersion();
}

function normalizeProduct(p) {
  const unitPrice = Number(p.unitPrice) || 0;
  return {
    ...p,
    barcode: p.barcode || "",
    cabinetNo: p.cabinetNo || "",
    cabinetReserved: Boolean(p.cabinetReserved),
    category: p.category || "未分类",
    department: p.department || "通用",
    caseQty: Math.max(0, parseInt(p.caseQty, 10) || 0),
    sellPrice: Number(p.sellPrice) >= 0 && p.sellPrice !== undefined && p.sellPrice !== ""
      ? Number(p.sellPrice)
      : unitPrice,
  };
}

/** 库存 Excel 无库存列时，新商品默认可订购数量 */
const CATALOG_DEFAULT_ORDER_QTY = 99999;

const MOJIBAKE_RE = /Ã|â€|Æ|â‚|Â|ï¿½/;
const CORRUPT_TEXT_RE = /Ã|â€|Æ|â‚|Â|ï¿½|\uFFFD|A,A|[\u0080-\u009F]/;

function hasMojibakeText(text) {
  return typeof text === "string" && MOJIBAKE_RE.test(text);
}

function hasCorruptText(text) {
  return typeof text === "string" && CORRUPT_TEXT_RE.test(text);
}

/** 去掉 UTF-8 被错误编码后产生的乱码后缀，保留前面的英文/数字名称 */
function stripMojibakeText(text) {
  if (!text || typeof text !== "string") return "";
  if (!hasCorruptText(text)) return text;
  const idx = text.search(CORRUPT_TEXT_RE);
  if (idx < 0) return text;
  if (idx === 0) return "";
  return text.slice(0, idx).trimEnd();
}

/** 展示用文本：去掉乱码，必要时回退为 fallback */
function cleanDisplayText(text, fallback = "") {
  if (!text || typeof text !== "string") return fallback;
  if (!hasCorruptText(text)) return text;
  return stripMojibakeText(text) || fallback;
}

/** 库存目录文本字段：去掉乱码，空值回退 fallback */
function sanitizeCatalogTextField(text, fallback = "") {
  if (text == null || text === "") return fallback;
  const s = String(text).trim();
  if (!s) return fallback;
  if (!hasCorruptText(s)) return s;
  return stripMojibakeText(s) || fallback;
}

function bumpStorageSyncVersion() {
  localStorage.setItem(STORAGE_KEYS.storageSyncVersion, String(Date.now()));
}

function getStorageSyncVersion() {
  return localStorage.getItem(STORAGE_KEYS.storageSyncVersion) || "0";
}

/** 从快照对象读取同步版本（用于 storage-bridge 与服务器比对） */
function readSnapshotSyncVersion(snapshot) {
  const ls = snapshot?.localStorage || {};
  return String(
    ls[STORAGE_KEYS.storageSyncVersion] ||
      ls.orderPlatform_storageSyncVersion ||
      ls[STORAGE_KEYS.productsVersion] ||
      ls.orderPlatform_productsVersion ||
      "0"
  );
}

/** 现货目录商品：统一清洗华语/文本字段，避免乱码残留 */
function sanitizeInventoryProduct(p) {
  if (!p) return p;
  const code = p.itemCode || "";
  return {
    ...p,
    itemName: sanitizeCatalogTextField(p.itemName, code),
    category: sanitizeCatalogTextField(p.category, "未分类"),
    department: sanitizeCatalogTextField(p.department, "通用"),
    spec: sanitizeCatalogTextField(p.spec, ""),
    unit: sanitizeCatalogTextField(p.unit, "") || p.unit || "个",
    brand: sanitizeCatalogTextField(p.brand, "") || p.brand || "其他",
    barcode: p.barcode ? sanitizeCatalogTextField(p.barcode, "") : p.barcode || "",
  };
}

/** 现货目录 Excel 上传后：清洗商品并同步订单行商品名称 */
function finalizeInventoryCatalogUpload(products, orders) {
  const cleanProducts = sortProductsByClassification(
    (products || []).map(sanitizeInventoryProduct)
  );
  const catalog = getMergedProductCatalog();
  cleanProducts.forEach((p) => {
    const key = String(p.itemCode || "").trim().toLowerCase();
    const idx = catalog.findIndex(
      (c) => String(c.itemCode || "").trim().toLowerCase() === key
    );
    if (idx >= 0) catalog[idx] = p;
    else catalog.push(p);
  });
  const { orders: cleanOrders, changed: ordersChanged } = repairOrderItemNames(
    orders || [],
    catalog
  );
  return { products: cleanProducts, orders: cleanOrders, ordersChanged };
}

function findProductByCode(products, itemCode) {
  const key = String(itemCode || "").trim().toLowerCase();
  return products.find((p) => String(p.itemCode || "").trim().toLowerCase() === key);
}

/** 现货目录 + 新货柜预定：订单解析商品名时合并查找（现货优先） */
function getMergedProductCatalog() {
  const main = loadProducts();
  const cabinet = loadCabinetProducts();
  const seen = new Set(main.map((p) => String(p.itemCode || "").trim().toLowerCase()));
  const merged = [...main];
  cabinet.forEach((p) => {
    const key = String(p.itemCode || "").trim().toLowerCase();
    if (key && !seen.has(key)) merged.push(p);
  });
  return merged;
}

function resolveItemName(itemCode, lineName, products) {
  const code = String(itemCode || "").trim();
  const product = findProductByCode(products, code);
  return cleanDisplayText(product?.itemName || lineName, code);
}

function repairOrderItemNames(orders, products) {
  let changed = false;
  const next = (orders || []).map((order) => ({
    ...order,
    lines: (order.lines || []).map((line) => {
      const itemName = resolveItemName(line.itemCode, line.itemName, products);
      if (itemName !== line.itemName) {
        changed = true;
        return { ...line, itemName };
      }
      return line;
    }),
  }));
  return { orders: next, changed };
}

function repairProductTextFields(p) {
  const n = sanitizeInventoryProduct(p);
  const fields = ["itemName", "category", "department", "spec", "unit", "brand", "barcode"];
  const changed = fields.some((key) => (n[key] ?? "") !== (p[key] ?? ""));
  return { product: n, changed };
}

/** 新货柜预定：箱数即可预定数量 */
function finalizeCabinetProduct(p) {
  const n = normalizeProduct(p);
  if (n.cabinetReserved) {
    return { ...n, orderableQty: 0 };
  }
  const caseQty = n.caseQty || 0;
  if (caseQty <= 0) {
    if (n.orderableQty <= 0 && n.stockQty > 0) n.orderableQty = n.stockQty;
    return n;
  }
  const stockQty = Math.max(n.stockQty || 0, caseQty);
  const orderableQty = Math.max(n.orderableQty || 0, caseQty, stockQty);
  return { ...n, stockQty, orderableQty };
}

function repairProductOrderable(p) {
  const { product } = repairProductTextFields(p);
  const n = normalizeProduct(product);
  if (n.orderableQty <= 0 && n.stockQty > 0) n.orderableQty = n.stockQty;
  return n;
}

function repairPersistedStorageOnBoot() {
  const nextProducts = loadProducts();
  const nextCabinet = loadCabinetProducts();
  const nextOrders = loadOrders();
  return {
    products: nextProducts,
    cabinetProducts: nextCabinet,
    orders: nextOrders,
    productsVersion: getProductsVersion(),
    cabinetProductsVersion: getCabinetProductsVersion(),
  };
}

function loadProducts() {
  const saved = localStorage.getItem(STORAGE_KEYS.products);
  if (saved) {
    try {
      let repairedAny = false;
      const products = JSON.parse(saved).map((p) => {
        const { product, changed } = repairProductTextFields(p);
        if (changed) repairedAny = true;
        return repairProductOrderable(product);
      });
      if (repairedAny) saveProducts(products);
      return products;
    } catch {
      /* fall through */
    }
  }
  return DEFAULT_PRODUCTS.map((p) => repairProductOrderable({ ...p }));
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
  localStorage.setItem(STORAGE_KEYS.productsVersion, String(Date.now()));
  bumpStorageSyncVersion();
  window.dispatchEvent(new CustomEvent(PRODUCTS_UPDATED_EVENT));
}

function getProductsVersion() {
  return localStorage.getItem(STORAGE_KEYS.productsVersion) || "0";
}

function loadCabinetProducts() {
  const saved = localStorage.getItem(STORAGE_KEYS.cabinetProducts);
  if (saved) {
    try {
      let repairedAny = false;
      const products = JSON.parse(saved).map((p) => {
        const { product, changed } = repairProductTextFields(p);
        if (changed) repairedAny = true;
        return finalizeCabinetProduct(product);
      });
      if (repairedAny) saveCabinetProducts(products);
      return sortProductsByClassification(products);
    } catch {
      /* fall through */
    }
  }
  return [];
}

function saveCabinetProducts(list) {
  localStorage.setItem(STORAGE_KEYS.cabinetProducts, JSON.stringify(list));
  localStorage.setItem(STORAGE_KEYS.cabinetProductsVersion, String(Date.now()));
  bumpStorageSyncVersion();
  window.dispatchEvent(new CustomEvent(CABINET_PRODUCTS_UPDATED_EVENT));
}

function getCabinetProductsVersion() {
  return localStorage.getItem(STORAGE_KEYS.cabinetProductsVersion) || "0";
}

function loadOrders() {
  const saved = localStorage.getItem(STORAGE_KEYS.orders);
  if (saved) {
    try {
      const orders = JSON.parse(saved);
      const { orders: repaired, changed } = repairOrderItemNames(orders, getMergedProductCatalog());
      if (changed) saveOrders(repaired);
      return repaired;
    } catch {
      /* fall through */
    }
  }
  return [];
}

function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
  bumpStorageSyncVersion();
}

function nextOrderNo() {
  let counter = parseInt(localStorage.getItem(STORAGE_KEYS.counter) || "0", 10);
  counter += 1;
  localStorage.setItem(STORAGE_KEYS.counter, String(counter));
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `PO-${y}${m}${d}-${String(counter).padStart(4, "0")}`;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(iso) {
  if (!iso) return "-";
  const [y, m, d] = iso.split("-");
  return `${y}-${m}-${d}`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function formatMoney(n) {
  return `RM ${Number(n || 0).toFixed(2)}`;
}

function getStockStatus(product) {
  if (product.stockQty <= 0) return "out";
  if (product.stockQty < product.safetyStock) return "low";
  return "normal";
}

const SUGGESTION_IMPORT_COLUMNS = [
  { key: "itemCode", zh: "商品代码", en: "itemCode" },
  { key: "itemName", zh: "商品名称", en: "itemName" },
  { key: "branch", zh: "分行", en: "branch" },
  { key: "minOrder", zh: "最低订购", en: "minOrder" },
];

const MIN_ORDER_MATRIX_GROUP_TITLE = "分行标准采购";
const MIN_ORDER_MATRIX_SUGGEST_TITLE = "采购建议";

function getMinOrderMatrixBranchColumns() {
  return getOrderMatrixBranchColumns();
}

function resolveMinOrderBranchName(headerText) {
  const key = normalizeBranchKey(headerText);
  if (key === "pending") return "PENDING";
  const col = findMatrixBranchColumn(headerText, getOrderMatrixBranchColumns());
  return col ? col.name : null;
}

function findMinOrderMatrixHeader(rows) {
  for (let i = 0; i < Math.min(rows.length, 6); i++) {
    const row = rows[i] || [];
    let codeIdx = -1;
    row.forEach((cell, idx) => {
      const key = normalizeBranchKey(cell);
      if (codeIdx >= 0) return;
      if (
        key.includes("商品代码") ||
        key.includes("商品编码") ||
        key === "itemcode" ||
        key.includes("代码") ||
        key.includes("编码") ||
        key === "code"
      ) {
        codeIdx = idx;
      }
    });
    if (codeIdx < 0) continue;

    const branchCols = [];
    for (let j = codeIdx + 2; j < row.length; j++) {
      const branchName = resolveMinOrderBranchName(row[j]);
      if (branchName) branchCols.push({ idx: j, name: branchName });
    }
    if (branchCols.length) {
      return { headerRowIndex: i, codeIdx, nameIdx: codeIdx + 1, branchCols };
    }
  }
  return null;
}

function buildMinOrderMatrixRows(products, branchMinOrders) {
  const branchColumns = getMinOrderMatrixBranchColumns();
  const rows = [...(products || DEFAULT_PRODUCTS)]
    .sort((a, b) => a.itemCode.localeCompare(b.itemCode, undefined, { numeric: true }))
    .map((p) => ({
      itemCode: p.itemCode,
      itemName: cleanDisplayText(p.itemName, p.itemCode),
      category: cleanDisplayText(p.category, "未分类"),
      department: cleanDisplayText(p.department, "通用"),
      stockQty: p.stockQty,
      safetyStock: p.safetyStock,
      orderableQty: p.orderableQty,
      unit: p.unit,
      branches: Object.fromEntries(
        branchColumns.map((col) => [
          col.key,
          getBranchMinOrder(branchMinOrders, col.name, p.itemCode) || 0,
        ])
      ),
    }));
  return { branchColumns, rows };
}

function buildSuggestionLookup(products, branchMinOrders) {
  const map = new Map();
  getBranchSuggestions(products, branchMinOrders).forEach((s) => {
    map.set(
      `${String(s.itemCode || "").trim().toLowerCase()}::${normalizeBranchKey(s.branchName)}`,
      s
    );
  });
  return map;
}

function minOrderMatrixSheetRows(products, branchMinOrders, groupTitle) {
  const { branchColumns, rows } = buildMinOrderMatrixRows(products, branchMinOrders);
  const branchNames = branchColumns.map((c) => c.name);
  const title = groupTitle || MIN_ORDER_MATRIX_GROUP_TITLE;
  const headerGroup = ["", "", title];
  for (let i = 1; i < branchNames.length; i++) headerGroup.push("");
  const header = [
    typeof t === "function" ? t("products.code") : "商品代码",
    typeof t === "function" ? t("products.name") : "商品名称",
    ...branchNames,
  ];
  const body = rows.map((row) => [
    row.itemCode,
    row.itemName,
    ...branchColumns.map((col) => row.branches[col.key] || ""),
  ]);
  return { rows: [headerGroup, header, ...body], branchColumns, merge: { fromCol: 2, toCol: 2 + branchNames.length - 1 } };
}

function suggestionMatrixSheetRows(products, branchMinOrders, groupTitle) {
  const { branchColumns, rows } = buildMinOrderMatrixRows(products, branchMinOrders);
  const lookup = buildSuggestionLookup(products, branchMinOrders);
  const branchNames = branchColumns.map((c) => c.name);
  const title = groupTitle || MIN_ORDER_MATRIX_SUGGEST_TITLE;
  const headerGroup = ["", "", title];
  for (let i = 1; i < branchNames.length; i++) headerGroup.push("");
  const header = [
    typeof t === "function" ? t("products.code") : "商品代码",
    typeof t === "function" ? t("products.name") : "商品名称",
    ...branchNames,
  ];
  const body = rows.map((row) => {
    const cells = branchColumns.map((col) => {
      const s = lookup.get(
        `${String(row.itemCode || "").trim().toLowerCase()}::${col.key}`
      );
      return s ? s.suggestedQty : "";
    });
    return [row.itemCode, row.itemName, ...cells];
  });
  return { rows: [headerGroup, header, ...body], branchColumns, merge: { fromCol: 2, toCol: 2 + branchNames.length - 1 } };
}

function writeMatrixSheet(wb, sheetName, matrixData) {
  const ws = XLSX.utils.aoa_to_sheet(matrixData.rows);
  ws["!cols"] = [{ wch: 14 }, { wch: 36 }, ...matrixData.branchColumns.map(() => ({ wch: 12 }))];
  if (matrixData.merge && matrixData.merge.toCol >= matrixData.merge.fromCol) {
    ws["!merges"] = [
      {
        s: { r: 0, c: matrixData.merge.fromCol },
        e: { r: 0, c: matrixData.merge.toCol },
      },
    ];
  }
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
}

function branchMinOrderKey(branchName, itemCode) {
  return `${normalizeBranchKey(branchName)}::${String(itemCode || "").trim().toLowerCase()}`;
}

function loadBranchMinOrders() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.branchMinOrders);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveBranchMinOrders(map) {
  localStorage.setItem(STORAGE_KEYS.branchMinOrders, JSON.stringify(map));
  localStorage.setItem(STORAGE_KEYS.branchMinOrdersVersion, String(Date.now()));
  bumpStorageSyncVersion();
  window.dispatchEvent(new CustomEvent(BRANCH_MIN_ORDERS_UPDATED_EVENT));
}

function getBranchMinOrdersVersion() {
  return localStorage.getItem(STORAGE_KEYS.branchMinOrdersVersion) || "0";
}

function getBranchMinOrder(branchMinOrders, branchName, itemCode) {
  const key = branchMinOrderKey(branchName, itemCode);
  const value = branchMinOrders[key];
  return value != null ? Number(value) || 0 : 0;
}

function setBranchMinOrderEntry(branchMinOrders, branchName, itemCode, minOrder) {
  const key = branchMinOrderKey(branchName, itemCode);
  const qty = Math.max(0, parseInt(minOrder, 10) || 0);
  if (qty > 0) branchMinOrders[key] = qty;
  else delete branchMinOrders[key];
}

function needsOverOrderReason(branchMinOrders, branchName, itemCode, quantity) {
  const minOrder = getBranchMinOrder(branchMinOrders, branchName, itemCode);
  return minOrder > 0 && Number(quantity) > minOrder;
}

/** 未发货订单中超标准采购的明细（供分行标准采购页提示） */
function buildOverMinOrderAlertEntries(orders, branchMinOrders) {
  const entries = [];
  const noReason =
    typeof t === "function" ? t("suggestionsPage.overMinNoReason") : "未填写理由";

  (orders || []).forEach((order) => {
    if (order.status === "shipped") return;
    const orderReason = String(order.remark || "").trim();
    order.lines.forEach((line) => {
      const branchName = line.branchName || order.branchName;
      const itemCode = String(line.itemCode || "").trim();
      if (!itemCode) return;
      const quantity = line.quantity || 0;
      const minOrder =
        line.minOrder != null
          ? Number(line.minOrder) || 0
          : getBranchMinOrder(branchMinOrders, branchName, itemCode);
      const isOver =
        line.overMinOrder === true ||
        needsOverOrderReason(branchMinOrders, branchName, itemCode, quantity);
      if (!isOver) return;
      const reason = String(line.overReason || orderReason || "").trim();
      entries.push({
        orderId: order.id,
        orderNo: order.orderNo,
        orderDate: order.orderDate || "",
        branchName,
        itemCode,
        itemName: line.itemName || itemCode,
        quantity,
        minOrder,
        reason: reason || noReason,
      });
    });
  });

  return entries.sort((a, b) => {
    const byDate = (b.orderDate || "").localeCompare(a.orderDate || "");
    if (byDate) return byDate;
    return a.itemCode.localeCompare(b.itemCode, undefined, { numeric: true });
  });
}

function overMinAlertEntryKey(entry) {
  const orderKey = String(entry.orderId || entry.orderNo || "").trim();
  const branchKey = normalizeBranchKey(entry.branchName);
  const codeKey = String(entry.itemCode || "").trim().toLowerCase();
  return `${orderKey}::${branchKey}::${codeKey}`;
}

function loadOverMinDismissed() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.overMinDismissed);
    const list = saved ? JSON.parse(saved) : [];
    return new Set(Array.isArray(list) ? list : []);
  } catch {
    return new Set();
  }
}

function saveOverMinDismissed(set) {
  localStorage.setItem(STORAGE_KEYS.overMinDismissed, JSON.stringify([...set]));
}

function filterOverMinAlertEntries(entries, dismissed = loadOverMinDismissed()) {
  return (entries || []).filter((entry) => !dismissed.has(overMinAlertEntryKey(entry)));
}

function dismissOverMinAlertKeys(keys) {
  const dismissed = loadOverMinDismissed();
  keys.forEach((key) => {
    if (key) dismissed.add(key);
  });
  saveOverMinDismissed(dismissed);
  return dismissed;
}

function getSuggestionBranchNames() {
  return getMinOrderMatrixBranchColumns().map((c) => c.name);
}

function getBranchSuggestions(products, branchMinOrders, options = {}) {
  const { branchFilter } = options;
  const branches = branchFilter ? [branchFilter] : getSuggestionBranchNames();
  const branchColumns = getMinOrderMatrixBranchColumns();
  const list = [];

  branches.forEach((branchName) => {
    const col = branchColumns.find(
      (c) =>
        c.key === normalizeBranchKey(branchName) ||
        normalizeBranchKey(c.name) === normalizeBranchKey(branchName)
    );
    if (!col) return;

    products.forEach((p) => {
      if (p.stockQty >= p.safetyStock || p.orderableQty <= 0) return;

      const minOrder = getBranchMinOrder(branchMinOrders, branchName, p.itemCode);
      const gap = Math.max(p.safetyStock - p.stockQty, 1);
      const suggestedQty = Math.min(
        p.orderableQty,
        minOrder > 0 ? Math.max(minOrder, gap) : gap
      );
      const overMinSuggest = minOrder > 0 && suggestedQty > minOrder;

      const tag =
        p.stockQty <= 0
          ? typeof t === "function"
            ? t("order.suggestRestock")
            : "建议补货"
          : typeof t === "function"
            ? t("order.suggestIncrease")
            : "建议增加";

      let reason;
      if (minOrder > 0) {
        reason =
          typeof t === "function"
            ? t("suggestionsPage.reasonMinOrder", { min: minOrder, branch: branchName })
            : `${branchName} 最低订购 ${minOrder}`;
      } else if (p.stockQty <= 0) {
        reason = typeof t === "function" ? t("order.reasonOut") : "库存已耗尽，需紧急补货";
      } else {
        reason = typeof t === "function" ? t("order.reasonLow") : "库存低于安全库存水平";
      }

      list.push({
        itemCode: p.itemCode,
        itemName: p.itemName,
        spec: p.spec,
        unit: p.unit,
        unitPrice: p.unitPrice,
        sellPrice: p.sellPrice,
        stockQty: p.stockQty,
        safetyStock: p.safetyStock,
        orderableQty: p.orderableQty,
        imageUrl: p.imageUrl,
        branchName,
        minOrder,
        suggestedQty,
        overMinSuggest,
        tag,
        reason,
      });
    });
  });

  return list.sort((a, b) => {
    const byBranch = a.branchName.localeCompare(b.branchName, undefined, { numeric: true });
    if (byBranch) return byBranch;
    return a.stockQty / a.safetyStock - b.stockQty / b.safetyStock;
  });
}

/** 当前分行下各商品的订购建议（itemCode → suggestion） */
let _branchSuggestionCache = { key: "", map: new Map() };

function buildBranchSuggestionLookup(products, branchMinOrders, branchName) {
  const map = new Map();
  if (!branchName) return map;
  const key = `${getProductsVersion()}::${getBranchMinOrdersVersion()}::${normalizeBranchKey(branchName)}`;
  if (_branchSuggestionCache.key === key) return _branchSuggestionCache.map;
  getBranchSuggestions(products, branchMinOrders, { branchFilter: branchName }).forEach((s) => {
    map.set(s.itemCode, s);
  });
  _branchSuggestionCache = { key, map };
  return map;
}

function downloadSuggestionsTemplate(filename, products) {
  const groupTitle =
    typeof t === "function" ? t("suggestionsPage.matrixGroupTitle") : MIN_ORDER_MATRIX_GROUP_TITLE;
  const matrixData = minOrderMatrixSheetRows(products, {}, groupTitle);
  const wb = XLSX.utils.book_new();
  writeMatrixSheet(wb, "MinOrder", matrixData);
  XLSX.writeFile(wb, filename);
}

function downloadSuggestionsExcel(filename, products, branchMinOrders) {
  const minTitle =
    typeof t === "function" ? t("suggestionsPage.matrixGroupTitle") : MIN_ORDER_MATRIX_GROUP_TITLE;
  const suggestTitle =
    typeof t === "function" ? t("suggestionsPage.matrixSuggestTitle") : MIN_ORDER_MATRIX_SUGGEST_TITLE;
  const wb = XLSX.utils.book_new();
  writeMatrixSheet(wb, "MinOrder", minOrderMatrixSheetRows(products, branchMinOrders, minTitle));
  writeMatrixSheet(
    wb,
    typeof t === "function" ? t("suggestionsPage.exportSheetSuggest") : "采购建议",
    suggestionMatrixSheetRows(products, branchMinOrders, suggestTitle)
  );
  XLSX.writeFile(wb, filename);
}

function parseSuggestionsImportFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
        if (rows.length < 2) {
          reject(new Error("Excel 文件为空或缺少数据行"));
          return;
        }

        const branchMinOrders = loadBranchMinOrders();
        let count = 0;

        const matrixHeader = findMinOrderMatrixHeader(rows);
        if (matrixHeader) {
          rows.slice(matrixHeader.headerRowIndex + 1).forEach((row) => {
            const itemCode = String(row[matrixHeader.codeIdx] ?? "").trim();
            if (!itemCode) return;
            matrixHeader.branchCols.forEach(({ idx, name }) => {
              const raw = row[idx];
              if (raw === "" || raw == null) return;
              const minOrder = parseInt(String(raw).trim(), 10);
              if (!Number.isFinite(minOrder)) return;
              setBranchMinOrderEntry(branchMinOrders, name, itemCode, minOrder);
              count += 1;
            });
          });
        } else {
          const headerMap = buildHeaderMap(rows[0], SUGGESTION_IMPORT_COLUMNS);
          if (headerMap.itemCode === undefined) {
            reject(new Error("未找到「商品代码」列，请使用矩阵模板（商品代码 + 各分行列）"));
            return;
          }
          if (headerMap.branch === undefined || headerMap.minOrder === undefined) {
            reject(new Error("未识别矩阵表头，请使用「分行标准采购」模板"));
            return;
          }

          const get = (row, key) => {
            const idx = headerMap[key];
            if (idx === undefined) return "";
            return String(row[idx] ?? "").trim();
          };

          rows.slice(1).forEach((row) => {
            const itemCode = get(row, "itemCode");
            const branch = get(row, "branch");
            const minOrder = parseInt(get(row, "minOrder"), 10);
            if (!itemCode || !branch || !Number.isFinite(minOrder)) return;
            if (!resolveMinOrderBranchName(branch)) return;
            setBranchMinOrderEntry(branchMinOrders, branch, itemCode, minOrder);
            count += 1;
          });
        }

        if (!count) {
          reject(new Error("没有有效的 min order 数据行"));
          return;
        }
        saveBranchMinOrders(branchMinOrders);
        resolve({ count, branchMinOrders });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsArrayBuffer(file);
  });
}

function downloadOrderImportTemplate(filename, products) {
  const header = ORDER_IMPORT_COLUMNS.map((c) => c.zh);
  const sample = (products?.length ? products : DEFAULT_PRODUCTS)
    .slice(0, 3)
    .map((p) => [p.itemCode, p.itemName, 10]);
  const ws = XLSX.utils.aoa_to_sheet([header, ...sample]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "订货");
  XLSX.writeFile(wb, filename);
}

function parseOrderImportFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
        if (rows.length < 2) {
          reject(new Error("Excel 文件为空或缺少数据行"));
          return;
        }

        const headerMap = buildHeaderMap(rows[0], ORDER_IMPORT_COLUMNS);
        if (headerMap.itemCode === undefined) {
          reject(new Error("缺少商品代码列"));
          return;
        }
        if (headerMap.quantity === undefined) {
          reject(new Error("缺少订购数量列"));
          return;
        }

        const get = (row, key) => {
          const idx = headerMap[key];
          if (idx === undefined) return "";
          const val = row[idx];
          return val === undefined || val === null ? "" : String(val).trim();
        };

        const lineMap = new Map();
        rows.slice(1).forEach((row) => {
          const itemCode = get(row, "itemCode");
          if (!itemCode) return;
          const qty = parseInt(get(row, "quantity"), 10);
          if (!Number.isFinite(qty) || qty <= 0) return;
          const key = itemCode.toLowerCase();
          const prev = lineMap.get(key);
          lineMap.set(key, {
            itemCode,
            quantity: (prev?.quantity || 0) + qty,
          });
        });

        if (!lineMap.size) {
          reject(new Error("没有有效的订货数据行"));
          return;
        }
        resolve({ lines: Array.from(lineMap.values()) });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsArrayBuffer(file);
  });
}

function getSuggestions(products) {
  return getBranchSuggestions(products, loadBranchMinOrders());
}

function productsToSheetRows(products) {
  return sheetRowsFromColumns(products, EXCEL_COLUMNS);
}

function cabinetProductsToSheetRows(products) {
  return sheetRowsFromColumns(products, CABINET_EXCEL_COLUMNS);
}

function parseCabinetReservedValue(val) {
  if (val === undefined || val === null) return undefined;
  const s = String(val).trim().toLowerCase();
  if (!s) return false;
  if (["是", "yes", "y", "1", "true", "已预定", "预定", "reserved"].includes(s)) return true;
  if (["否", "no", "n", "0", "false", "未预定", "否"].includes(s)) return false;
  return undefined;
}

/** 解析新货柜预定 Excel 行 → 商品对象 */
function rowToCabinetProduct(row, headerMap) {
  const get = (key) => {
    const idx = headerMap[key];
    if (idx === undefined) return undefined;
    const val = row[idx];
    return val === undefined || val === null ? "" : String(val).trim();
  };

  const itemCode = get("itemCode");
  if (!itemCode) return null;

  const num = (key, fallback = 0) => {
    const v = get(key);
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
  };

  const imageUrl = get("imageUrl");
  const itemName = get("itemName");
  const unit = get("unit");
  const reservedRaw = headerMap.cabinetReserved !== undefined ? row[headerMap.cabinetReserved] : undefined;
  const cabinetReserved = parseCabinetReservedValue(reservedRaw);

  const patch = {
    itemCode,
    caseQty: num("caseQty"),
    barcode: get("barcode") || "",
    unitPrice: num("unitPrice"),
    sellPrice: num("sellPrice", num("unitPrice")),
  };
  if (itemName) patch.itemName = itemName;
  if (unit) patch.unit = unit;
  if (cabinetReserved !== undefined) patch.cabinetReserved = cabinetReserved;
  if (imageUrl) patch.imageUrl = imageUrl;
  return patch;
}

/** 识别新货柜预定表头列索引 */
function buildCabinetHeaderMap(headerRow) {
  const map = buildHeaderMap(headerRow, CABINET_EXCEL_COLUMNS);
  const normalized = headerRow.map((h) =>
    String(h ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "")
  );

  const alias = (key, tests) => {
    if (map[key] !== undefined) return;
    const idx = normalized.findIndex((h) => tests.some((t) => h === t || h.includes(t)));
    if (idx >= 0) map[key] = idx;
  };

  alias("itemCode", ["itemcode", "item", "商品代码", "商品编码", "代码", "编码"]);
  alias("itemName", ["itemname", "description", "商品名称", "名称", "品名"]);
  alias("unit", ["unit", "uom", "单位"]);
  alias("caseQty", ["ctn(pcs)", "ctn", "箱数", "caseqty"]);
  alias("unitPrice", ["costprice", "cost", "单价", "unitprice"]);
  alias("sellPrice", ["sellingprice", "selling", "卖价", "sellprice"]);
  alias("cabinetReserved", ["已预定", "reserved", "cabinetreserved", "预定"]);
  alias("imageUrl", ["photo", "imageurl", "图片", "图片url", "产品照片", "照片"]);
  alias("barcode", ["barcode", "条形码", "条码"]);

  return map;
}

/** 合并预定商品导入：Excel 全量同步，未出现在文件中的商品移除 */
function mergeCabinetProducts(existing, imported) {
  const existingMap = new Map(existing.map((p) => [p.itemCode, p]));
  const uploadedCodes = new Set(imported.map((p) => p.itemCode));
  let added = 0;
  let updated = 0;

  const products = imported.map((patch) => {
    const prev = existingMap.get(patch.itemCode);
    if (prev) {
      updated += 1;
      return finalizeCabinetProduct({ ...prev, ...patch });
    }
    added += 1;
    return finalizeCabinetProduct({
      itemCode: patch.itemCode,
      itemName: patch.itemName || patch.itemCode,
      spec: "",
      unit: patch.unit || "个",
      brand: "其他",
      category: "未分类",
      department: "通用",
      stockQty: 0,
      orderableQty: 0,
      safetyStock: 10,
      imageUrl: patch.imageUrl || productImage(patch.itemCode, patch.itemName || patch.itemCode),
      ...patch,
    });
  });

  const removed = existing.filter((p) => !uploadedCodes.has(p.itemCode)).length;

  return {
    products: sortProductsByClassification(products.map(finalizeCabinetProduct)),
    added,
    updated,
    removed,
    total: imported.length,
  };
}

/** 解析 Excel 行 → 商品对象 */
function rowToProduct(row, headerMap) {
  const get = (key) => {
    const idx = headerMap[key];
    if (idx === undefined) return undefined;
    const val = row[idx];
    return val === undefined || val === null ? "" : String(val).trim();
  };

  const itemCode = get("itemCode");
  if (!itemCode) return null;

  const num = (key, fallback = 0) => {
    const v = get(key);
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
  };

  const itemName = get("itemName") || itemCode;
  const product = {
    itemCode,
    itemName,
    spec: get("spec") || "",
    unit: get("unit") || "个",
    brand: get("brand") || "其他",
    category: get("category") || "未分类",
    department: get("department") || "通用",
    stockQty: num("stockQty"),
    orderableQty: num("orderableQty", num("stockQty")),
    caseQty: num("caseQty"),
    unitPrice: num("unitPrice"),
    sellPrice: num("sellPrice", num("unitPrice")),
    safetyStock: num("safetyStock", 10),
    imageUrl: get("imageUrl") || productImage(itemCode, itemName),
  };
  return normalizeProduct(product);
}

/** 识别表头列索引 */
function buildHeaderMap(headerRow, columns = EXCEL_COLUMNS) {
  const map = {};
  const normalized = headerRow.map((h) =>
    String(h ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "")
  );

  columns.forEach((col) => {
    const zhKey = col.zh.replace(/\s+/g, "").toLowerCase();
    const enKey = col.en.toLowerCase();
    let idx = normalized.findIndex((h) => h === zhKey || h === enKey);
    if (idx < 0) {
      idx = normalized.findIndex(
        (h) =>
          h.includes(zhKey) ||
          h.includes(enKey) ||
          (col.key === "itemCode" &&
            (h.includes("itemcode") ||
              h.includes("商品代码") ||
              h.includes("商品编码") ||
              h.includes("代码") ||
              h.includes("编码"))) ||
          (col.key === "quantity" &&
            (h.includes("订购数量") || h.includes("quantity") || h === "qty" || h.includes("数量")))
      );
    }
    if (idx >= 0) map[col.key] = idx;
  });

  return map;
}

/** 合并导入：同编码整行覆盖，新编码追加 */
function mergeProducts(existing, imported) {
  const map = new Map(existing.map((p) => [p.itemCode, p]));
  let added = 0;
  let updated = 0;

  imported.forEach((p) => {
    if (map.has(p.itemCode)) updated += 1;
    else added += 1;
    map.set(p.itemCode, normalizeProduct(p));
  });

  return {
    products: Array.from(map.values()),
    added,
    updated,
    total: imported.length,
  };
}

/** 解析库存 Excel 行（仅更新 Excel 中出现的字段） */
function rowToInventoryUpdate(row, headerMap) {
  const get = (key) => {
    const idx = headerMap[key];
    if (idx === undefined) return undefined;
    const val = row[idx];
    return val === undefined || val === null ? "" : String(val).trim();
  };

  const itemCode = get("itemCode");
  if (!itemCode) return null;

  const num = (key) => {
    const v = get(key);
    if (v === undefined || v === "") return undefined;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : undefined;
  };

  const patch = { itemCode };
  const itemName = sanitizeCatalogTextField(get("itemName"), "");
  if (itemName) patch.itemName = itemName;
  if (headerMap.category !== undefined) {
    patch.category = sanitizeCatalogTextField(get("category"), "未分类");
  }
  if (headerMap.department !== undefined) {
    patch.department = sanitizeCatalogTextField(get("department"), "通用");
  }
  const barcode = sanitizeCatalogTextField(get("barcode"), "");
  if (barcode) patch.barcode = barcode;
  const imageUrl = get("imageUrl");
  if (imageUrl) patch.imageUrl = imageUrl;
  const unit = sanitizeCatalogTextField(get("unit"), "");
  if (unit) patch.unit = unit;

  const caseQty = num("caseQty");
  if (caseQty !== undefined) patch.caseQty = caseQty;
  const unitPrice = num("unitPrice");
  if (unitPrice !== undefined) patch.unitPrice = unitPrice;
  const sellPrice = num("sellPrice");
  if (sellPrice !== undefined) patch.sellPrice = sellPrice;

  return patch;
}

/** 识别库存 Excel 表头 */
function buildInventoryHeaderMap(headerRow) {
  const map = buildHeaderMap(headerRow, INVENTORY_EXCEL_COLUMNS);
  const normalized = headerRow.map((h) =>
    String(h ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "")
  );

  const alias = (key, tests) => {
    if (map[key] !== undefined) return;
    const idx = normalized.findIndex((h) => tests.some((t) => h === t || h.includes(t)));
    if (idx >= 0) map[key] = idx;
  };

  alias("caseQty", ["箱数/ctn", "箱数", "ctn", "caseqty", "case/pcs"]);
  alias("category", ["itemgroup", "item group", "商品分类", "分类"]);
  alias("department", ["department", "dept", "部门分类", "部门", "itemdept"]);
  alias("itemCode", ["itemcode", "item", "商品代码", "商品编码", "代码", "编码"]);
  alias("barcode", ["barcode", "bar code", "条形码", "条码"]);
  alias("imageUrl", ["photo", "imageurl", "图片", "picture", "phpto"]);
  alias("itemName", ["description", "desc", "商品名称", "名称", "ebil"]);
  alias("unit", ["uom", "unit", "单位"]);
  alias("unitPrice", ["cost", "costprice", "单价", "unitprice"]);
  alias("sellPrice", ["price", "sellingprice", "卖价", "sellprice"]);

  if (map.imageUrl === undefined) {
    const codeIdx = map.itemCode;
    const nameIdx = map.itemName;
    if (codeIdx !== undefined && nameIdx !== undefined && nameIdx > codeIdx + 1) {
      for (let i = codeIdx + 1; i < nameIdx; i++) {
        if (!normalized[i]) {
          map.imageUrl = i;
          break;
        }
      }
    }
  }

  return map;
}

/** 商品分类列表（去重排序） */
function getProductCategories(products) {
  return [...new Set((products || []).map((p) => p.category).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "zh-CN")
  );
}

/** 部门分类：未选分类时返回全部；选中分类时仅返回该分类下商品的部门 */
function getDepartmentsForCategory(products, category) {
  const list = category
    ? (products || []).filter((p) => p.category === category)
    : products || [];
  return [...new Set(list.map((p) => p.department).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "zh-CN")
  );
}

/** 按商品分类 → 部门分类 → 编码排序 */
function sortProductsByClassification(list) {
  return [...list].sort((a, b) => {
    const c = (a.category || "").localeCompare(b.category || "", "zh-CN");
    if (c !== 0) return c;
    const d = (a.department || "").localeCompare(b.department || "", "zh-CN");
    if (d !== 0) return d;
    return a.itemCode.localeCompare(b.itemCode);
  });
}

function buildProductFromInventoryPatch(patch, prev) {
  const code = patch.itemCode;
  const stockQty =
    patch.stockQty !== undefined
      ? patch.stockQty
      : prev?.stockQty ?? CATALOG_DEFAULT_ORDER_QTY;
  const base = prev
    ? { ...prev, ...patch, itemCode: code }
    : {
        itemCode: code,
        itemName: patch.itemName || code,
        spec: patch.spec || "",
        unit: patch.unit || "个",
        brand: patch.brand || "其他",
        category: patch.category || "未分类",
        department: patch.department || "通用",
        stockQty,
        orderableQty: patch.orderableQty ?? stockQty,
        caseQty: patch.caseQty ?? 0,
        unitPrice: patch.unitPrice ?? 0,
        sellPrice: patch.sellPrice ?? patch.unitPrice ?? 0,
        safetyStock: patch.safetyStock ?? 10,
        imageUrl: patch.imageUrl || productImage(code, patch.itemName || code),
        barcode: patch.barcode || "",
      };

  if (patch.category !== undefined) base.category = patch.category || "未分类";
  if (patch.department !== undefined) base.department = patch.department || "通用";

  const merged = normalizeProduct(base);
  if (merged.orderableQty <= 0 && merged.stockQty > 0) {
    merged.orderableQty = merged.stockQty;
  } else if (!prev && merged.orderableQty <= 0) {
    merged.stockQty = CATALOG_DEFAULT_ORDER_QTY;
    merged.orderableQty = CATALOG_DEFAULT_ORDER_QTY;
  }
  if (merged.orderableQty > merged.stockQty) merged.orderableQty = merged.stockQty;
  return sanitizeInventoryProduct(merged);
}

/**
 * 库存 Excel 上传：仅更新现货目录（products），新货柜预定商品库（cabinetProducts）不受影响。
 * - 上传文件中的商品：按 Excel 覆盖/新增
 * - 未出现在 Excel 中的旧商品：从现货目录移除
 */
function mergeInventoryUpdate(existing, importedPatches) {
  const existingMap = new Map(existing.map((p) => [p.itemCode, p]));
  const uploadedCodes = new Set(importedPatches.map((p) => p.itemCode));
  let updated = 0;
  let added = 0;

  const products = importedPatches.map((patch) => {
    const code = patch.itemCode;
    const prev = existingMap.get(code);
    if (prev) updated += 1;
    else added += 1;
    return buildProductFromInventoryPatch(patch, prev);
  });

  const removed = existing.filter((p) => !uploadedCodes.has(p.itemCode)).length;

  return {
    products: sortProductsByClassification(products),
    updated,
    added,
    removed,
    total: importedPatches.length,
  };
}

function sheetRowsFromColumns(products, columns) {
  const header = columns.map((c) => c.zh);
  const numericKeys = new Set(["stockQty", "orderableQty", "caseQty", "safetyStock", "unitPrice", "sellPrice"]);
  const rows = products.map((p) =>
    columns.map((c) => {
      const val = p[c.key];
      if (c.key === "cabinetReserved") return p.cabinetReserved ? "是" : "否";
      if (numericKeys.has(c.key)) return Number(val) || 0;
      return val ?? "";
    })
  );
  return [header, ...rows];
}

function downloadInventoryExcel(filename, products, { templateOnly = false } = {}) {
  const rows = templateOnly
    ? [INVENTORY_EXCEL_COLUMNS.map((c) => c.zh)]
    : sheetRowsFromColumns(products, INVENTORY_EXCEL_COLUMNS);
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = INVENTORY_EXCEL_COLUMNS.map((c) => ({
    wch:
      c.key === "imageUrl" ? 22 : c.key === "itemName" ? 28 : c.key === "department" ? 18 : 14,
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, INVENTORY_EXCEL_SHEET_NAME);
  XLSX.writeFile(wb, filename);
}

function parseInventoryExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
        if (rows.length < 2) {
          reject(new Error("Excel 文件为空或缺少数据行"));
          return;
        }
        const headerMap = buildInventoryHeaderMap(rows[0]);
        if (headerMap.itemCode === undefined) {
          reject(new Error("未找到「Item Code」列，请使用现货目录 Excel 模板"));
          return;
        }
        const imported = rows
          .slice(1)
          .map((row) => rowToInventoryUpdate(row, headerMap))
          .filter(Boolean);
        if (!imported.length) {
          reject(new Error("没有有效的库存数据行"));
          return;
        }
        resolve(imported);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsArrayBuffer(file);
  });
}

function downloadExcel(filename, products) {
  const ws = XLSX.utils.aoa_to_sheet(productsToSheetRows(products));
  ws["!cols"] = EXCEL_COLUMNS.map(() => ({ wch: 16 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "商品库");
  XLSX.writeFile(wb, filename);
}

function downloadCabinetExcel(filename, products) {
  const ws = XLSX.utils.aoa_to_sheet(cabinetProductsToSheetRows(sortProductsByClassification(products)));
  ws["!cols"] = CABINET_EXCEL_COLUMNS.map((c) => ({
    wch: c.key === "itemName" ? 24 : c.key === "imageUrl" ? 22 : c.key === "cabinetReserved" ? 10 : 14,
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "预定商品");
  XLSX.writeFile(wb, filename);
}

function parseCabinetExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
        if (rows.length < 2) {
          reject(new Error("Excel 文件为空或缺少数据行"));
          return;
        }
        const headerMap = buildCabinetHeaderMap(rows[0]);
        if (headerMap.itemCode === undefined) {
          reject(new Error("未找到「ITEM CODE」列，请使用预定商品标准模板"));
          return;
        }
        const products = rows
          .slice(1)
          .map((row) => rowToCabinetProduct(row, headerMap))
          .filter(Boolean);
        if (!products.length) {
          reject(new Error("未解析到有效商品行"));
          return;
        }
        resolve(products);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsArrayBuffer(file);
  });
}

function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
        if (rows.length < 2) {
          reject(new Error("Excel 文件为空或缺少数据行"));
          return;
        }
        const headerMap = buildHeaderMap(rows[0]);
        if (headerMap.itemCode === undefined) {
          reject(new Error("未找到「商品代码」列，请使用标准模板"));
          return;
        }
        const imported = rows
          .slice(1)
          .map((row) => rowToProduct(row, headerMap))
          .filter(Boolean);
        if (!imported.length) {
          reject(new Error("没有有效的商品数据行"));
          return;
        }
        resolve(imported);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsArrayBuffer(file);
  });
}

function exportOrderCSV(order) {
  const header = [
    "订货单号",
    "分行名称",
    "订货人",
    "订货日期",
    "订货备注",
    "状态",
    "商品代码",
    "商品名称",
    "数量",
    "单位",
    "单价",
    "小计",
  ].join(",");

  const rows = order.lines.map((line, i) =>
    [
      i === 0 ? order.orderNo : "",
      i === 0 ? order.branchName : "",
      i === 0 ? order.orderer : "",
      i === 0 ? order.orderDate : "",
      i === 0 ? `"${(order.remark || "").replace(/"/g, '""')}"` : "",
      i === 0 ? STATUS_LABELS[order.status] || order.status : "",
      line.itemCode,
      `"${(line.itemName || "").replace(/"/g, '""')}"`,
      line.quantity,
      line.unit || "",
      line.unitPrice || 0,
      ((line.quantity || 0) * (line.unitPrice || 0)).toFixed(2),
    ].join(",")
  );

  return "\uFEFF" + [header, ...rows].join("\r\n");
}

function downloadCSV(filename, content) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function applyWorksheetA4Setup(ws) {
  ws["!pageSetup"] = {
    paperSize: 9,
    orientation: "portrait",
    scale: 100,
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
  };
  ws["!margins"] = {
    left: 0.7,
    right: 0.7,
    top: 0.75,
    bottom: 0.75,
    header: 0.3,
    footer: 0.3,
  };
}

function buildOrderSheetAoa(order, labels, statusText) {
  const showLineBranch = order.lines.some((l) => l.branchName);
  const rows = [
    [labels.docTitle],
    [],
    [labels.orderNo, order.orderNo, labels.status, statusText],
    [labels.branch, order.branchName, labels.date, order.orderDate || ""],
    [labels.orderer, order.orderer],
  ];
  if (order.remark) rows.push([labels.remark, order.remark]);
  if (order.mergedFrom?.length) rows.push([labels.mergedFrom || "Merged from", order.mergedFrom.join(", ")]);
  if (order.splitFrom) rows.push([labels.splitFrom || "Split from", order.splitFrom]);
  rows.push([]);
  const header = showLineBranch
    ? [labels.branch, labels.itemCode, labels.itemName, labels.qty, labels.unit, labels.price, labels.subtotal]
    : [labels.itemCode, labels.itemName, labels.qty, labels.unit, labels.price, labels.subtotal];
  rows.push(header);
  order.lines.forEach((line) => {
    const subtotal = (line.quantity || 0) * (line.unitPrice || 0);
    if (showLineBranch) {
      rows.push([
        line.branchName || order.branchName || "",
        line.itemCode,
        line.itemName,
        line.quantity,
        line.unit || "",
        line.unitPrice || 0,
        subtotal,
      ]);
    } else {
      rows.push([line.itemCode, line.itemName, line.quantity, line.unit || "", line.unitPrice || 0, subtotal]);
    }
  });
  rows.push([]);
  rows.push([labels.totalQty, order.totalQty]);
  rows.push([labels.totalAmount, order.totalAmount]);
  return { rows, colCount: header.length };
}

function createOrderWorksheet(order, labels, statusText) {
  const { rows, colCount } = buildOrderSheetAoa(order, labels, statusText);
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const widths = [14, 28, 10, 8, 12, 12, 14].slice(0, colCount);
  ws["!cols"] = widths.map((wch) => ({ wch }));
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } }];
  applyWorksheetA4Setup(ws);
  return ws;
}

function sanitizeSheetName(name) {
  return String(name || "Order")
    .replace(/[\\/*?:\[\]]/g, "")
    .slice(0, 31) || "Order";
}

function downloadOrderExcel(order, filename, labels, statusText) {
  const ws = createOrderWorksheet(order, labels, statusText);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sanitizeSheetName(labels.sheetName));
  XLSX.writeFile(wb, filename);
}

function downloadOrdersExcel(orders, filename, labels, getStatusText) {
  const wb = XLSX.utils.book_new();
  const usedNames = new Set();
  orders.forEach((order, index) => {
    const ws = createOrderWorksheet(order, labels, getStatusText(order.status));
    let sheetName = sanitizeSheetName(order.orderNo || `Order${index + 1}`);
    let suffix = 1;
    while (usedNames.has(sheetName)) {
      sheetName = sanitizeSheetName(`${order.orderNo || "Order"}_${suffix++}`);
    }
    usedNames.add(sheetName);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });
  XLSX.writeFile(wb, filename);
}

function normalizeBranchKey(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

function getOrderMatrixBranchColumns() {
  const seen = new Set();
  const columns = [];
  const pendingKey = "pending";
  seen.add(pendingKey);
  columns.push({ key: pendingKey, name: "PENDING", label: "pending" });
  ORDER_MATRIX_BRANCHES.forEach((name) => {
    const trimmed = String(name || "").trim();
    if (!trimmed) return;
    const key = normalizeBranchKey(trimmed);
    if (seen.has(key)) return;
    seen.add(key);
    columns.push({
      key,
      name: trimmed,
      label: trimmed.toLowerCase(),
    });
  });
  return columns;
}

function findMatrixBranchColumn(branchName, columns) {
  const key = normalizeBranchKey(branchName);
  return columns.find((c) => c.key === key || normalizeBranchKey(c.name) === key);
}

function calcMatrixCases(total, caseQty) {
  if (!caseQty || caseQty <= 0 || !total) return "";
  return Math.ceil(total / caseQty);
}

/** 采购汇总用：已发货整单不计入；已提交、已确认照常 */
function getOrdersForSummary(orders) {
  return orders.filter((o) => o.status !== "shipped");
}

function buildOrderMatrix(orders, products) {
  const branchColumns = getOrderMatrixBranchColumns();
  const rowMap = new Map();
  const summary = {
    branchTotals: Object.fromEntries(branchColumns.map((c) => [c.key, 0])),
    total: 0,
    cases: 0,
  };

  orders.forEach((order) => {
    order.lines.forEach((line) => {
      const code = String(line.itemCode || "").trim();
      if (!code) return;
      const codeKey = code.toLowerCase();
      const branchName = line.branchName || order.branchName;
      const col = findMatrixBranchColumn(branchName, branchColumns);
      if (!col) return;

      const qty = line.quantity || 0;
      if (!qty) return;

      if (!rowMap.has(codeKey)) {
        const product = findProductByCode(products, code);
        rowMap.set(codeKey, {
          itemCode: code,
          itemName: resolveItemName(code, line.itemName, products),
          branches: Object.fromEntries(branchColumns.map((c) => [c.key, 0])),
          caseQty: product?.caseQty || 0,
        });
      }
      const row = rowMap.get(codeKey);
      const product = findProductByCode(products, code);
      if (product?.caseQty) row.caseQty = product.caseQty;
      row.itemName = resolveItemName(code, row.itemName, products);

      row.branches[col.key] += qty;
      summary.branchTotals[col.key] += qty;
    });
  });

  const rows = Array.from(rowMap.values())
    .map((row) => {
      const total = branchColumns.reduce((s, c) => s + (row.branches[c.key] || 0), 0);
      const cases = calcMatrixCases(total, row.caseQty);
      if (cases) summary.cases += Number(cases) || 0;
      return { ...row, total, cases };
    })
    .sort((a, b) => a.itemCode.localeCompare(b.itemCode, undefined, { numeric: true }));

  summary.total = branchColumns.reduce((s, c) => s + (summary.branchTotals[c.key] || 0), 0);

  const grand = {
    branchTotals: Object.fromEntries(
      branchColumns.map((c) => [
        c.key,
        rows.filter((row) => (row.branches[c.key] || 0) > 0).length,
      ])
    ),
    total: 0,
  };
  grand.total = branchColumns.reduce((s, c) => s + (grand.branchTotals[c.key] || 0), 0);

  return { branchColumns, rows, summary, grand };
}

function formatMatrixQty(value) {
  return value ? value : "";
}

function buildOrderMatrixSheetRows(orders, products, labels) {
  const { branchColumns, rows, summary } = buildOrderMatrix(orders, products);
  const header = [
    labels.itemCode,
    labels.itemName,
    ...branchColumns.map((c) => c.label),
    labels.total,
    labels.cases,
  ];
  const body = rows.map((row) => [
    row.itemCode,
    row.itemName,
    ...branchColumns.map((c) => formatMatrixQty(row.branches[c.key])),
    row.total,
    formatMatrixQty(row.cases),
  ]);
  const summaryRow = [
    labels.summaryTotal || "合计",
    "",
    ...branchColumns.map((c) => formatMatrixQty(summary.branchTotals[c.key])),
    summary.total,
    formatMatrixQty(summary.cases),
  ];
  return { header, rows: body, summaryRow, branchColumns, matrixRows: rows, summary };
}

function buildOrdersDetailSheetRows(orders, labels, getStatusText, products) {
  const header = [
    labels.orderNo,
    labels.branch,
    labels.orderer,
    labels.date,
    labels.status,
    labels.itemCode,
    labels.itemName,
    labels.qty,
    labels.unit,
    labels.price,
    labels.subtotal,
  ];
  const rows = [];
  orders.forEach((order) => {
    const statusText = getStatusText(order.status);
    order.lines.forEach((line) => {
      const subtotal = (line.quantity || 0) * (line.unitPrice || 0);
      rows.push([
        order.orderNo,
        line.branchName || order.branchName || "",
        order.orderer,
        order.orderDate || "",
        statusText,
        line.itemCode,
        resolveItemName(line.itemCode, line.itemName, products),
        line.quantity,
        line.unit || "",
        line.unitPrice || 0,
        subtotal,
      ]);
    });
  });
  return { header, rows };
}

function downloadOrdersFileExcel(filename, orders, products, matrixLabels, detailLabels, getStatusText) {
  const wb = XLSX.utils.book_new();

  const { header, rows, summaryRow } = buildOrderMatrixSheetRows(
    getOrdersForSummary(orders),
    products,
    matrixLabels
  );
  const wsSummary = XLSX.utils.aoa_to_sheet([header, ...rows, summaryRow]);
  wsSummary["!cols"] = header.map((_, i) => ({ wch: i < 2 ? 18 : 12 }));
  applyWorksheetA4Setup(wsSummary);
  wsSummary["!pageSetup"].orientation = "landscape";
  XLSX.utils.book_append_sheet(
    wb,
    wsSummary,
    sanitizeSheetName(matrixLabels.summarySheet || matrixLabels.sheetName || "Summary")
  );

  const detail = buildOrdersDetailSheetRows(orders, detailLabels, getStatusText, products);
  const wsDetail = XLSX.utils.aoa_to_sheet([detail.header, ...detail.rows]);
  wsDetail["!cols"] = [14, 14, 12, 12, 10, 12, 22, 8, 8, 10, 12];
  applyWorksheetA4Setup(wsDetail);
  XLSX.utils.book_append_sheet(
    wb,
    wsDetail,
    sanitizeSheetName(detailLabels.detailSheet || "Details")
  );

  XLSX.writeFile(wb, filename);
}

function downloadOrderMatrixExcel(filename, orders, products, labels) {
  downloadOrdersFileExcel(
    filename,
    orders,
    products,
    labels,
    {
      orderNo: "order no",
      branch: "branch",
      orderer: "orderer",
      date: "date",
      status: "status",
      itemCode: labels.itemCode,
      itemName: labels.itemName,
      qty: "qty",
      unit: "unit",
      price: "price",
      subtotal: "subtotal",
      detailSheet: "Details",
    },
    (status) => STATUS_LABELS[status] || status
  );
}
