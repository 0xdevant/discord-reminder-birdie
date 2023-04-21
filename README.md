# discord-reminder-birdie

Discord bot that sends reminder message automatically by specifying in daily/weekly/monthly intervals (limit of reminders can be set)

### `/remind(message: string, interval: string, time: integer, period: string)`

Set up a reminder by specifying its:

- interval **(daily/weekly/monthly)**
- hour **(1-12)**
- period **(AM/PM)**

### `/remove(id: string)`

Remove a specific reminder and stop its cron job by providing its uuid

### `/clear`

Clear all reminders from the list and stop their cron jobs

### `/list`

View all messages from the list including their ID, message and schedule
