import { signal, effect, computed } from "@preact/signals";

// Helper to get hash without the #
const getHash = () => {
  const hash = window.location.hash;
  if (!hash) return "";
  return hash.startsWith("#") ? hash.substring(1) : hash;
};

// The raw hash string
export const routeHash = signal(getHash());

// Parts of the route (e.g., "character/edit" -> ["character", "edit"])
export const routeParts = computed(() => {
  const h = routeHash.value;
  if (!h || h === "/" || h === "home") return [];
  return h.split("/").filter(Boolean);
});

// Primary route (e.g., "character")
export const mainRoute = computed(() => routeParts.value[0] || "dashboard");

// Sub route (e.g., "edit")
export const subRoute = computed(() => routeParts.value[1]);

// Sync with window.location.hash
if (typeof window !== "undefined") {
  window.addEventListener("hashchange", () => {
    routeHash.value = getHash();
  });

  // Handle redirects and initial route logic
  effect(() => {
    const main = mainRoute.value;
    const sub = subRoute.value;
    const hash = routeHash.value;

    // Default to dashboard if empty
    if (!hash || hash === "/") {
      window.location.hash = "#dashboard";
      return;
    }

    // Redirect /#character to /#character/edit
    if (main === "character" && !sub) {
      window.location.hash = "#character/edit";
    }
  });
}

export const navigate = (path: string) => {
  window.location.hash = path.startsWith("#") ? path : `#${path}`;
};
