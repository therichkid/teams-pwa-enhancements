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
      setupNotificationCloseOverride(tab);
    }
  });
};

const setupNotificationCloseOverride = (tab: chrome.tabs.Tab): void => {
  if (!tab.id) return;

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: overrideNotificationClose,
    world: 'MAIN',
  });
};

const overrideNotificationClose = (): void => {
  const isOverridden = () => {
    const descriptor = Object.getOwnPropertyDescriptor(Notification.prototype, 'close');
    return descriptor && !descriptor.writable && !descriptor.configurable;
  };

  if (isOverridden()) return;

  Object.defineProperty(Notification.prototype, 'close', {
    value: function () {
      return undefined;
    },
    writable: false,
    configurable: false,
  });

  console.log('Notification close method overridden');
};
