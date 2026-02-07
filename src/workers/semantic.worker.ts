// Basic echo worker for Step 1 verification
self.addEventListener("message", (event) => {
  const { type, payload } = event.data;
  console.log("[SemanticWorker] Received:", type, payload);

  if (type === "PING") {
    self.postMessage({ type: "PONG", payload: "Worker is alive" });
  }
});
