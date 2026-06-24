(function () {
  const LOCALHOST_ORIGIN = "http://localhost:8080";
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
      '<body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">' +
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
    if (!localStorage.getItem("orderPlatform_products")) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "storage/local-data.json", false);
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

  try {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/storage", false);
    xhr.send();
    if (xhr.status === 200) {
      const snapshot = JSON.parse(xhr.responseText || "{}");
      applyStorage(localStorage, snapshot.localStorage);
      applyStorage(sessionStorage, snapshot.sessionStorage);
    }
  } catch (_) {
    /* keep in-memory defaults */
  }

  const originalSetItem = localStorage.setItem.bind(localStorage);
  let saveTimer = null;

  function persistToServer() {
    fetch("/api/storage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        localStorage: collectStorage(localStorage),
        sessionStorage: collectStorage(sessionStorage),
      }),
    }).catch(function () {});
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
