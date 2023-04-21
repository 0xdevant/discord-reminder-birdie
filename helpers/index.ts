import * as cron from "node-cron";

export function formatExpression(
  interval: string,
  time: number,
  period: string
): string {
  if (period === "am" && time === 12) {
    time = 0;
  }
  if (period === "pm") {
    if (time === 12) {
      time = 12;
    } else {
      time += 12;
    }
  }

  let res = "0 ";

  if (interval === "daily") {
    res += `${time.toString()} * * *`;
  }
  if (interval === "weekly") {
    res += `${time.toString()} * * ${new Date().getDay()}`;
  }
  if (interval === "monthly") {
    res += `${time.toString()} ${new Date().getDate()} * *`;
  }
  // for testing immediately
  if (interval === "test") {
    res = "* * * * *";
  }

  return cron.validate(res) ? res : null;
}

export function formatInterval(interval: string, time: number, period: string) {
  return `${interval} at ${time}${period}`;
}
