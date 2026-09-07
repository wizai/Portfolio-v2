declare global {
  interface Window {
    umami?: {
      track: (eventNameOrProps?: string | Record<string, unknown> | ((props: Record<string, unknown>) => Record<string, unknown>), data?: Record<string, unknown>) => void;
    };
  }
}

const sendPageview = (): void => {
  window.umami?.track();
};

export const trackEvent = (name: string, data?: Record<string, unknown>): void => {
  window.umami?.track(name, data);
};

document.addEventListener('page-transition:ready', sendPageview);