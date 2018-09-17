const WORK_ITEM_FIELDS = 'workItems(id,duration(minutes,period),description,date,issue(id,project(id),summary,idReadable,resolved),type(name),text)';
const WORK_TIME_SETTINGS_FIELDS = 'minutesADay,daysAWeek,workDays';

export async function myWorkItems(fetchYouTrack, from, to) {
  return await fetchYouTrack(`api/admin/users/me/activity/timetracking?fields=${WORK_ITEM_FIELDS}&$start=${from}&$end=${to}`);
}

export async function workTimeSettings(fetchYouTrack) {
  return await fetchYouTrack(`api/admin/timeTrackingSettings/workTimeSettings?fields=${WORK_TIME_SETTINGS_FIELDS}`);
}
