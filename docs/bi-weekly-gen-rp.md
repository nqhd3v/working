# Generate Bi-Weekly report

Currently, for Bi-Weekly, I just report the meeting I joined in that bi-weekly. So, we need to create a script project to get all activities by following these steps:

- Go to [this page](), select your Google Profile and select `New` to start a new project.
- Go to settings and check the timezone, make sure that timezone is the tz for your country (for me, it's `+7`).
- Paste the code below and click `Save` and `Run` button on the nav bar.

```js
function getCalendarEvents() {
  // EDIT INPUT
  const START_DATE = "2024-07-12";
  const END_DATE = "2024-07-19";

  const calendar = CalendarApp.getDefaultCalendar();
  const eventsCalendar = calendar.getEvents(
    new Date(START_DATE),
    new Date(END_DATE)
  );

  const events = eventsCalendar
    .map((e) => {
      const titleLower = e.getTitle().toLowerCase();
      if (
        titleLower.includes("home") ||
        titleLower.includes("office") ||
        titleLower.includes("only remind")
      ) {
        return null;
      }

      return {
        title: e.getTitle(),
        startTime: e.getStartTime(),
        endTime: e.getEndTime(),
      };
    })
    .filter((e) => e);

  console.log(JSON.stringify(events));
}
```
