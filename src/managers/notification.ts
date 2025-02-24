import { isTeamsTab } from '../helpers/tab';

interface TeamsWindow extends Window {
  _teamsNotificationManagerInitialized?: boolean;
}

interface TeamsAppElement extends HTMLElement {
  _reactRootContainer?: any;
}

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
      setupNotificationListener(tab);
    }
  });
};

const setupNotificationListener = (tab: chrome.tabs.Tab): void => {
  if (!tab.id) return;

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: injectNotificationListener,
    world: 'MAIN',
  });
};

const injectNotificationListener = (): void => {
  if ((window as TeamsWindow)._teamsNotificationManagerInitialized) return;

  const teamsApp = document.getElementById('app') as TeamsAppElement;

  if (!teamsApp || !teamsApp._reactRootContainer) {
    console.log('React root container not found, skipping injection of notification listener');
    return;
  }

  const coreServices = teamsApp._reactRootContainer.current.updateQueue.baseState.element.props.coreServices;

  const originalTryShowBrowserNotification = coreServices.notificationsHandler.showBrowserNotification;
  coreServices.notificationsHandler.tryShowBrowserNotification = function (event: any) {
    try {
      const webToastOptions = event.getWebToastOptions();
      const { notificationTitle, notificationOptions } = event.getNotificationOptionsPayload();
      const persistentOptions = { ...notificationOptions, requireInteraction: true, silent: false };
      console.log({ notificationTitle, notificationOptions, persistentOptions });

      const getNotification = () => {
        const notification = new Notification(notificationTitle, persistentOptions);

        notification.addEventListener('click', async () => {
          console.log('Injected notification clicked');
          await this.activateBrowserToast(webToastOptions);
        });

        return notification;
      };

      event.registerGetNotificationCallback(getNotification);

      return Promise.resolve('queued');
    } catch (error) {
      console.error('Failed to show injected browser notification:', error);
      return originalTryShowBrowserNotification.call(this, event);
    }
  };

  console.log('Injected notification listener');
  (window as TeamsWindow)._teamsNotificationManagerInitialized = true;
};
