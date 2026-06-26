(function () {

  const LOCALHOST_ORIGIN = "http://localhost:8090";

  const STORAGE_SYNC_KEY = "orderPlatform_storageSyncVersion";

  const PRODUCTS_KEY = "orderPlatform_products";

  const isFile = location.protocol === "file:";

  const isLocalhost =

    location.protocol === "http:" &&

    location.hostname === "localhost" &&

    location.port === "8090";



  function collectStorage(store) {

    const data = {};

    for (let i = 0; i < store.length; i++) {

      const key = store.key(i);

      if (key) data[key] = store.getItem(key);

    }

    return data;

  }



  function applyStorage(store, data) {

    if (!data) return;

    Object.entries(data).forEach(([key, value]) => {

      if (value != null) store.setItem(key, value);

    });

  }



  function readLocalSyncVersion() {

    return String(

      localStorage.getItem(STORAGE_SYNC_KEY) ||

        localStorage.getItem("orderPlatform_productsVersion") ||

        "0"

    );

  }



  function readSnapshotSyncVersion(snapshot) {

    const ls = snapshot?.localStorage || {};

    return String(

      ls[STORAGE_SYNC_KEY] ||

        ls.orderPlatform_productsVersion ||

        "0"

    );

  }



  function compareSyncVersion(a, b) {

    const na = Number(a);

    const nb = Number(b);

    if (Number.isFinite(na) && Number.isFinite(nb)) {

      if (na !== nb) return na > nb ? 1 : -1;

    }

    return String(a).localeCompare(String(b));

  }



  let lastServerPayload = "";



  function persistToServerNow() {

    if (typeof fetch === "undefined") return;

    const payload = JSON.stringify({

      localStorage: collectStorage(localStorage),

      sessionStorage: collectStorage(sessionStorage),

    });

    if (payload === lastServerPayload) return;

    lastServerPayload = payload;

    fetch("/api/storage", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: payload,

    }).catch(function () {});

  }



  function readProductCountFromRaw(raw) {
    if (!raw) return 0;
    try {
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.length : 0;
    } catch {
      return 0;
    }
  }

  function readSnapshotProductCount(snapshot) {
    const ls = snapshot?.localStorage || {};
    return readProductCountFromRaw(ls[PRODUCTS_KEY] || ls.orderPlatform_products);
  }

  if (isFile) {

    const page = location.pathname.split("/").pop() || "index.html";

    const target =

      LOCALHOST_ORIGIN + "/" + page + location.search + location.hash;

    const payload = {

      localStorage: collectStorage(localStorage),

      sessionStorage: collectStorage(sessionStorage),

    };

    function showFileProtocolHelp() {

      document.documentElement.innerHTML =

        '<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +

        "<title>请通过本地服务打开</title></head>" +

        '<body style="font-family:Microsoft YaHei UI,Microsoft YaHei,PingFang SC,sans-serif;max-width:520px;margin:48px auto;padding:0 20px;line-height:1.7;color:#1a2332">' +

        "<h2 style=\"margin:0 0 12px;font-size:20px\">不能直接打开 HTML 文件</h2>" +

        "<p style=\"margin:0 0 12px;color:#475569\">现货目录数据保存在本地服务器中。直接双击 <code>login.html</code> / <code>index.html</code> 时，商品列表通常会为空。</p>" +

        "<p style=\"margin:0 0 12px\"><strong>请关闭此页，改为双击文件夹里的：</strong></p>" +

        "<p style=\"margin:0 0 16px;font-size:18px;font-weight:700;color:#2563eb\">打开平台.bat</p>" +

        "<p style=\"margin:0 0 8px\">启动后会自动打开：</p>" +

        "<p style=\"margin:0 0 16px\"><a href=\"http://localhost:8090/login.html\">http://localhost:8090/login.html</a></p>" +

        "<p style=\"margin:0;color:#64748b;font-size:14px\">账号 admin · 密码 123456</p>" +

        "</body>";

    }

    let serverOk = false;

    try {

      const xhr = new XMLHttpRequest();

      xhr.open("GET", LOCALHOST_ORIGIN + "/api/storage", false);

      xhr.send();

      serverOk = xhr.status === 200;

    } catch (_) {

      serverOk = false;

    }

    if (!serverOk) {

      showFileProtocolHelp();

      return;

    }

    document.documentElement.innerHTML =

      '<head><meta charset="UTF-8"><title>跳转中</title></head>' +

      '<body style="font-family:Microsoft YaHei UI,Microsoft YaHei,PingFang SC,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">' +

      "<p>正在同步数据并跳转到 localhost…</p></body>";

    fetch(LOCALHOST_ORIGIN + "/api/storage/migrate", {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: JSON.stringify(payload),

      mode: "cors",

      keepalive: true,

    })

      .catch(function () {})

      .finally(function () {

        location.replace(target);

      });

    return;

  }



  if (!isLocalhost) {
    const localProductCount = readProductCountFromRaw(localStorage.getItem(PRODUCTS_KEY));

    if (!localStorage.getItem(PRODUCTS_KEY) || localProductCount === 0) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "storage/seed.json", false);
        xhr.send();
        if (xhr.status === 200) {
          const snapshot = JSON.parse(xhr.responseText || "{}");
          applyStorage(localStorage, snapshot.localStorage);
          applyStorage(sessionStorage, snapshot.sessionStorage);
        }
      } catch (_) {
        /* use defaults */
      }
    }

    return;
  }



  let serverSnapshot = null;

  try {

    const xhr = new XMLHttpRequest();

    xhr.open("GET", "/api/storage", false);

    xhr.send();

    if (xhr.status === 200) {

      serverSnapshot = JSON.parse(xhr.responseText || "{}");

    }

  } catch (_) {

    /* keep in-memory defaults */

  }



  const hasLocalProducts = Boolean(localStorage.getItem(PRODUCTS_KEY));
  const localProductCount = readProductCountFromRaw(localStorage.getItem(PRODUCTS_KEY));
  const serverProductCount = serverSnapshot ? readSnapshotProductCount(serverSnapshot) : 0;
  const localSync = readLocalSyncVersion();
  const serverSync = serverSnapshot ? readSnapshotSyncVersion(serverSnapshot) : "0";

  // 服务器有现货目录、本地为空或明显更少时：优先恢复服务器，避免旧浏览器覆盖已上传的 Excel 数据。
  const shouldRestoreServerCatalog =
    serverSnapshot &&
    serverProductCount > 0 &&
    (localProductCount === 0 || (serverProductCount >= 100 && localProductCount < serverProductCount));

  if (shouldRestoreServerCatalog) {
    applyStorage(localStorage, serverSnapshot.localStorage);
    applyStorage(sessionStorage, serverSnapshot.sessionStorage);
  } else if (
    serverSnapshot &&
    (!hasLocalProducts || compareSyncVersion(serverSync, localSync) > 0)
  ) {
    applyStorage(localStorage, serverSnapshot.localStorage);
    applyStorage(sessionStorage, serverSnapshot.sessionStorage);
  } else if (localProductCount > 0 && compareSyncVersion(localSync, serverSync) >= 0) {
    persistToServerNow();
  }



  const originalSetItem = localStorage.setItem.bind(localStorage);

  let saveTimer = null;



  function persistToServer() {

    persistToServerNow();

  }



  localStorage.setItem = function (key, value) {

    if (localStorage.getItem(key) === String(value)) return;

    originalSetItem(key, value);

    clearTimeout(saveTimer);

    saveTimer = setTimeout(persistToServer, 800);

  };



  const originalSessionSetItem = sessionStorage.setItem.bind(sessionStorage);

  sessionStorage.setItem = function (key, value) {

    if (sessionStorage.getItem(key) === String(value)) return;

    originalSessionSetItem(key, value);

    clearTimeout(saveTimer);

    saveTimer = setTimeout(persistToServer, 800);

  };

})();

