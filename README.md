# YouTrack Personal Time Tracking

[![JetBrains team project](http://jb.gg/badges/team.svg)](https://confluence.jetbrains.com/display/ALL/JetBrains+on+GitHub)

[YouTrack](https://www.jetbrains.com/youtrack/) dashboard widget, which displays daily and cumulative totals for spent time that you have added to issues in YouTrack.

Widget's [page](https://plugins.jetbrains.com/plugin/10978-personal-time-tracking) on JetBrains Marketplace

[Code of Conduct](https://github.com/JetBrains?#code-of-conduct)


## Developing a Hub widget
The following commands are available:

  - `npm test` to launch karma tests
  - `npm start` to run a local development server
  - `npm run lint` to lint your code (JS and CSS)
  - `npm run stylelint` to lint CSS only
  - `npm run build` to generate a production bundle (will be available under `dist`)
  - `npm run ci-test` to launch karma tests and report the results to TeamCity

To check your widget, go to the widget playground page located at `<your_hub_server>/dashboard/widgets-playground`.

You may encounter the following problem when using a local development server together with Hub running over HTTPS: all major browsers block insecure scripts. 
In Chrome you can add a security exception: click the security notification in the address bar (the one saying "The page is trying to load scripts from unauthenticated sources") and 
press the "Load unsafe scripts" button. Similar workarounds are available in other browsers as well.

## Introduction into widget development
Template for this widget was generated by [hub widget generator](https://github.com/JetBrains/ring-ui/tree/master/packages/generator/hub-widget).
