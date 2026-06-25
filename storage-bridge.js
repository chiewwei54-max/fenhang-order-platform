(function () {
  const LOCALHOST_ORIGIN = "http://localhost:8080";
  const STORAGE_SYNC_KEY = "orderPlatform_storageSyncVersion";
  const PRODUCTS_KEY = "orderPlatform_products";
  const isFile = location.protocol === "file:";
  const isLocalhost =
    location.protocol === "http:" &&
    location.hostname === "localhost" &&
    location.port === "8080";

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

  function persistToServerNow() {
    if (typeof fetch === "undefined") return;
    fetch("/api/storage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        localStorage: collectStorage(localStorage),
        sessionStorage: collectStorage(sessionStorage),
      }),
    }).catch(function () {});
  }

  if (isFile) {
    const page = location.pathname.split("/").pop() || "index.html";
    const target =
      LOCALHOST_ORIGIN + "/" + page + location.search + location.hash;
    const payload = {
      localStorage: collectStorage(localStorage),
      sessionStorage: collectStorage(sessionStorage),
    };

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
    if (!localStorage.getItem(PRODUCTS_KEY)) {
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
  const localSync = readLocalSyncVersion();
  const serverSync = serverSnapshot ? readSnapshotSyncVersion(serverSnapshot) : "0";

  if (
    serverSnapshot &&
    (!hasLocalProducts || compareSyncVersion(serverSync, localSync) > 0)
  ) {
    applyStorage(localStorage, serverSnapshot.localStorage);
    applyStorage(sessionStorage, serverSnapshot.sessionStorage);
  } else if (hasLocalProducts && compareSyncVersion(localSync, serverSync) >= 0) {
    persistToServerNow();
  }

  const originalSetItem = localStorage.setItem.bind(localStorage);
  let saveTimer = null;

  function persistToServer() {
    persistToServerNow();
  }

  localStorage.setItem = function (key, value) {
    originalSetItem(key, value);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(persistToServer, 250);
  };

  const originalSessionSetItem = sessionStorage.setItem.bind(sessionStorage);
  sessionStorage.setItem = function (key, value) {
    originalSessionSetItem(key, value);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(persistToServer, 250);
  };
})();
