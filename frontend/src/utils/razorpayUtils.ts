/**
 * razorpayUtils.ts
 *
 * Shared Razorpay lifecycle utilities used by CheckoutScreen,
 * PaymentFailureScreen, and CourseDetailsScreen.
 *
 * WHY THIS EXISTS
 * ───────────────
 * Razorpay's checkout.js is a stateful singleton injected into the browser window.
 * When destroyed (DOM purged) and re-initialized in the same SPA session, the old
 * SDK state can leave the new Razorpay instance with a null contentWindow on its
 * internal iframe. Razorpay's own SDK then calls:
 *
 *   window.alert("This browser is not supported.\nPlease try payment in another browser.")
 *
 * This is NOT a real browser-support issue — it is Razorpay detecting that its own
 * iframe failed to render because we purged the DOM while the SDK was still running.
 *
 * The solution is:
 *  1. Always re-fetch and re-execute the script on each payment attempt (force-reload).
 *  2. Delete window.Razorpay before re-loading so no stale constructor is reused.
 *  3. Purge all Razorpay DOM nodes AND the window.Razorpay reference in destroyRazorpay().
 *  4. Wrap rzp.open() in try/catch — if Razorpay's iframe still fails, redirect to our
 *     custom failure page instead of showing the alert().
 */

// ─── Script Loader ────────────────────────────────────────────────────────────

/**
 * Loads (or force-reloads) the Razorpay checkout.js script.
 *
 * We intentionally do NOT short-circuit on `window.Razorpay` being present.
 * After a destroyRazorpay() call the SDK state is corrupt; we must reload.
 * destroyRazorpay() sets window.Razorpay = undefined before this is called.
 */
export async function loadRazorpayScript(): Promise<boolean> {
  // Remove any existing Razorpay script tags so the browser re-executes fresh
  document.querySelectorAll<HTMLScriptElement>("script[src*='razorpay']").forEach((s) => s.remove());

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(!!(window as any).Razorpay);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── DOM + SDK Cleanup ────────────────────────────────────────────────────────

/**
 * Forcibly removes ALL Razorpay-injected DOM nodes AND clears the global
 * window.Razorpay reference so the next loadRazorpayScript() gets a clean slate.
 *
 * Call this BEFORE navigate() — not after — because React Router's navigate()
 * only swaps React components; Razorpay's iframe and backdrop divs are inserted
 * directly into document.body outside the React tree and are never touched by
 * React reconciliation.
 */
export function destroyRazorpay(instance?: any): void {
  // 1. Ask the SDK to close gracefully
  try { instance?.close(); } catch (_) { /* ignore if already gone */ }

  // 2. Remove backdrop + iframe wrapper the SDK injects into document.body
  document
    .querySelectorAll(".razorpay-container, .razorpay-backdrop, [data-razorpay], #razorpay-container")
    .forEach((el) => el.remove());

  // 3. Remove any Razorpay iframes that survived step 2
  document.querySelectorAll<HTMLIFrameElement>("iframe").forEach((iframe) => {
    if (iframe.src?.includes("razorpay") || iframe.className?.includes("razorpay")) {
      iframe.remove();
    }
  });

  // 4. Restore scroll-lock the SDK sets on <body>
  document.body.classList.remove("razorpay-container-open");
  document.body.style.overflow = "";

  // 5. CRITICAL: Delete the global window.Razorpay constructor.
  //    This prevents the next loadRazorpayScript() from reusing a stale
  //    SDK instance whose internal iframe reference is now null/invalid.
  //    Without this step, new Razorpay(options) succeeds but rzp.open()
  //    finds el.contentWindow === null and calls window.alert(
  //      "This browser is not supported.\nPlease try payment in another browser."
  //    ) — which is actually Razorpay's broken-iframe detection, not a real
  //    browser-support check.
  try { delete (window as any).Razorpay; } catch (_) { (window as any).Razorpay = undefined; }
}

// ─── Safe Open ────────────────────────────────────────────────────────────────

/**
 * Safely opens the Razorpay modal.
 *
 * Returns true if the modal opened successfully.
 * Returns false if Razorpay's iframe failed to render (the condition that
 * normally causes Razorpay to show the browser-support alert).
 *
 * Callers should redirect to the failure page when false is returned.
 */
export function safeOpen(rzp: any): boolean {
  try {
    rzp.open();
    return true;
  } catch (err) {
    // rzp.open() can throw if the SDK is in a corrupted state
    return false;
  }
}
