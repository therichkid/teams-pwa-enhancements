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

  const notificationsHandler = coreServices.notificationsHandler;

  const originalTryShowBrowserNotification = notificationsHandler.tryShowBrowserNotification;
  coreServices.notificationsHandler.tryShowBrowserNotification = (...args: unknown[]) => {
    console.log('tryShowBrowserNotification:', args);
    return originalTryShowBrowserNotification(...args);
  };

  const originalActivateNotification = notificationsHandler.activateNotification;
  coreServices.notificationsHandler.activateNotification = (...args: unknown[]) => {
    console.log('activateNotification:', args);
    return originalActivateNotification(...args);
  };

  const originalCreateNotificationsWindow = notificationsHandler.createNotificationsWindow;
  coreServices.notificationsHandler.createNotificationsWindow = (...args: unknown[]) => {
    console.log('createNotificationsWindow:', args);
    return originalCreateNotificationsWindow(...args);
  };

  const originalEventHandler = coreServices.eventHandler;
  coreServices.eventHandler = (...args: unknown[]) => {
    console.log('eventHandler:', args);
    return originalEventHandler(...args);
  };

  console.log('Injected notification listener');
  (window as TeamsWindow)._teamsNotificationManagerInitialized = true;
};
