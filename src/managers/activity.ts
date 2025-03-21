import { getTeamsTabs } from '../helpers/tab';

const ACTIVITY_CHECK_INTERVAL_MINUTES = 1;
const IDLE_THRESHOLD_MINUTES = 2;
const ALARM_NAME = 'TEAMS_ACTIVITY_CHECK';

export const initializeTeamsActivity = () => {
  try {
    setupActivityCheck();
  } catch (error) {
    console.error('Failed to initialize Teams activity manager:', error);
  }
};

const setupActivityCheck = () => {
  chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.create(ALARM_NAME, {
      periodInMinutes: ACTIVITY_CHECK_INTERVAL_MINUTES,
    });
  });

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM_NAME) {
      checkAndUpdateActivity();
    }
  });
};

const checkAndUpdateActivity = () => {
  chrome.idle.queryState(IDLE_THRESHOLD_MINUTES * 60, (state) => {
    if (state !== 'locked') {
      updateTeamsActivity();
    }
  });
};

const updateTeamsActivity = async () => {
  const tabs = await getTeamsTabs();

  tabs.forEach((tab) => {
    if (tab.id) {
      chrome.scripting
        .executeScript({
          target: { tabId: tab.id },
          func: simulateMouseMovement,
        })
        .catch((error) => {
          console.error('Failed to execute script:', error);
        });
    }
  });
};

const simulateMouseMovement = () => {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const randomOffset = 50;

  const newX = centerX + Math.floor(Math.random() * randomOffset * 2) - randomOffset;
  const newY = centerY + Math.floor(Math.random() * randomOffset * 2) - randomOffset;

  const mouseEvent = new MouseEvent('mousemove', {
    view: window,
    bubbles: true,
    cancelable: true,
    clientX: newX,
    clientY: newY,
  });

  document.dispatchEvent(mouseEvent);
  console.log(`Mouse position updated: (${newX}, ${newY})`);
};
