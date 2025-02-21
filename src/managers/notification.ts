import { getTeamsTabs, isTeamsTab } from '../helpers/tab';

type NotificationMessage = {
  type: string;
  payload: NotificationPayload;
};

type NotificationPayload = {
  title: string;
  options: NotificationOptions;
};

export const initializeNotificationManager = async () => {
  const tabs = await getTeamsTabs();
  tabs.forEach(injectNotificationInterceptor);

  setupTabListeners();
  setupNotificationListeners();
};

const injectNotificationInterceptor = (tab: chrome.tabs.Tab): void => {
  if (!tab.id) return;

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: setupNotificationOverride,
  });
};

const setupTabListeners = () => {
  chrome.tabs.onCreated.addListener((tab) => {
    if (isTeamsTab(tab)) {
      injectNotificationInterceptor(tab);
    }
  });

  chrome.tabs.onUpdated.addListener((_tabId, _changeInfo, tab) => {
    if (isTeamsTab(tab)) {
      injectNotificationInterceptor(tab);
    }
  });
};

const setupNotificationListeners = (): void => {
  chrome.runtime.onMessage.addListener(handleMessage);
  chrome.notifications.onClicked.addListener(handleNotificationClick);
};

const setupNotificationOverride = (): void => {
  if (window.hasOwnProperty('_teamsNotificationOverrideInstalled')) {
    return;
  }

  const originalNotification = window.Notification;

  // @ts-ignore
  window.Notification = function (title: string, options: NotificationOptions) {
    console.log('Intercepting Teams notification:', title, options);

    chrome.runtime.sendMessage({
      type: 'TEAMS_NOTIFICATION',
      payload: { title, options },
    });

    return new originalNotification(title, { ...options, silent: true });
  };

  // @ts-ignore
  window.Notification.permission = originalNotification.permission;
  window.Notification.requestPermission = originalNotification.requestPermission;

  Object.defineProperty(window, '_teamsNotificationOverrideInstalled', {
    value: true,
    configurable: false,
    writable: false,
  });
};

const handleNotificationClick = async (): Promise<void> => {
  const tabs = await getTeamsTabs();
  const firstTab = tabs[0];

  if (firstTab && firstTab.id) {
    await Promise.all([chrome.tabs.update(firstTab.id, { active: true }), chrome.windows.update(firstTab.windowId, { focused: true })]);
  }
};

const handleMessage = (message: NotificationMessage): void => {
  if (message.type === 'TEAMS_NOTIFICATION') {
    chrome.notifications.create(`teams-notification-${Date.now()}`, {
      type: 'basic',
      title: message.payload.title,
      message: message.payload.options.body ?? '',
      iconUrl: message.payload.options.icon ?? 'assets/teams.png',
    });
  }
};
