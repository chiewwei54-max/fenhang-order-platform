const APP_VERSION = "1.1.1";
const APP_VERSION_STORAGE_KEY = "orderPlatform_lastSeenVersion";

function initAppVersionBadge(root) {
  const scope = root || document;
  const badges = scope.querySelectorAll("[data-app-version]");
  if (!badges.length) return;

  const label = `v${APP_VERSION}`;
  const prev = localStorage.getItem(APP_VERSION_STORAGE_KEY);

  badges.forEach((el) => {
    el.textContent = label;
    el.setAttribute("aria-label", `平台版本 ${label}`);
    if (prev && prev !== APP_VERSION) {
      el.classList.add("app-version-bump");
      el.addEventListener(
        "animationend",
        () => el.classList.remove("app-version-bump"),
        { once: true }
      );
    }
  });

  localStorage.setItem(APP_VERSION_STORAGE_KEY, APP_VERSION);
}

(function () {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initAppVersionBadge());
  } else {
    initAppVersionBadge();
  }
})();
