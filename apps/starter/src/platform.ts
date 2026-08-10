/** True for macOS desktop (system traffic lights / Overlay title bar). */
export function isMacOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform) || /Mac OS X/.test(navigator.userAgent);
}

/** Windows / Linux need decorations:false + app-drawn window buttons. */
export function needsCustomWindowControls(): boolean {
  return !isMacOS();
}

export function applyTitleBarInsets(): void {
  if (needsCustomWindowControls()) {
    document.documentElement.style.setProperty('--vscode-titlebar-traffic-width', '0px');
  }
}
