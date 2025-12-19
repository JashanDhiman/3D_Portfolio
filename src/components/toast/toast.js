let showToastFn;

export function registerToast(fn) {
  showToastFn = fn;
}

export const toast = {
  success: (msg, duration) => showToastFn(msg, "success", duration),
  error: (msg, duration) => showToastFn(msg, "error", duration),
  info: (msg, duration) => showToastFn(msg, "info", duration),
};
