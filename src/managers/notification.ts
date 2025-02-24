import { isTeamsTab } from '../helpers/tab';

export const initializeTeamsNotificationManager = async () => {
  try {
    setupTabListeners();
  } catch (error) {
    console.error('Failed to initialize Teams notification manager:', error);
  }
};

const setupTabListeners = () => {
  chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
    if (isTeamsTab(tab) && changeInfo.status === 'complete') {
      setupNotificationOverrides(tab);
    }
  });
};

const setupNotificationOverrides = (tab: chrome.tabs.Tab): void => {
  if (!tab.id) return;

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: overrideNotificationBehavior,
    world: 'MAIN',
  });
};

const overrideNotificationBehavior = (): void => {
  const isOverridden = () => {
    // Check if Notification constructor is proxied
    const constructorDescriptor = Object.getOwnPropertyDescriptor(window, 'Notification');
    const isConstructorOverridden = constructorDescriptor && constructorDescriptor.value !== Notification;

    // Check if close method is overridden
    const closeDescriptor = Object.getOwnPropertyDescriptor(Notification.prototype, 'close');
    const isCloseOverridden = closeDescriptor && !closeDescriptor.writable && !closeDescriptor.configurable;

    return isCloseOverridden && isConstructorOverridden;
  };

  if (isOverridden()) return;

  // Create proxy to intercept notification creation
  const NotificationProxy = new Proxy(window.Notification, {
    construct(target, args: [string, NotificationOptions?]) {
      const [title, options = {}] = args;
      options.requireInteraction = false;
      return new target(title, options);
    },
  });

  Object.defineProperty(window, 'Notification', {
    value: NotificationProxy,
    writable: false,
    configurable: false,
  });

  // Override the close method
  Object.defineProperty(Notification.prototype, 'close', {
    value: function () {
      return undefined;
    },
    writable: false,
    configurable: false,
  });

  console.log('Notification behavior overridden: forced non-interaction and disabled close method');
};
