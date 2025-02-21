const TEAMS_URL_PATTERN = 'https://*.teams.microsoft.com/*';
const TEAMS_URL_REGEX = /^https:\/\/[^\/]*\.teams\.microsoft\.com\/.*/;

export const getTeamsTabs = () => {
  return chrome.tabs.query({ url: TEAMS_URL_PATTERN });
};

export const isTeamsTab = (tab: chrome.tabs.Tab) => {
  if (!tab.id || !tab.url) {
    return false;
  }

  return TEAMS_URL_REGEX.test(tab.url);
};
