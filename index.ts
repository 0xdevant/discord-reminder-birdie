// Require the necessary discord.js classes
import { Client, Events, GatewayIntentBits } from "discord.js";
import * as dotenv from "dotenv";
import * as cron from "node-cron";
import { formatExpression, formatInterval } from "./helpers";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

type Reminder = {
  id: string;
  message: string;
  interval: string;
  time: number;
  period: string;
};

const PRIVATE_TOKEN = process.env.PRIVATE_TOKEN;
let birdie: Birdie;
let client: Client<boolean>;

class Birdie {
  reminders: Reminder[] = [];
  reminderLimit: number;

  constructor(reminderLimit?: number) {
    if (!reminderLimit) {
      reminderLimit = null;
    }
    this.reminderLimit = reminderLimit;
  }

  addReminder(reminder: Reminder): Reminder {
    if (this.reminderLimit && this.reminders.length >= this.reminderLimit)
      return;
    this.reminders.push(reminder);

    return this.reminders[this.reminders.length - 1];
  }

  removeReminder(id: string): void {
    if (this.reminders.length === 0) return;

    this.reminders.splice(
      this.reminders.findIndex((reminder) => reminder.id === id),
      1
    );
  }

  // findReminder(id: number): Reminder {
  //   if (this.reminders.length === 0) return;

  //   this.reminders.find((reminder) => {
  //     return reminder.id === id;
  //   });
  // }

  getReminders() {
    return this.reminders;
  }

  clearReminders() {
    this.reminders = [];
  }
}

function init(): void {
  // Create a new birdie instance
  birdie = new Birdie();

  // Create a new client instance
  client = new Client({ intents: [GatewayIntentBits.Guilds] });

  // When the client is ready, run this code (only once)
  client.once(Events.ClientReady, (c) => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
  });

  // Login to Discord with your client's token
  client.login(PRIVATE_TOKEN);
}

async function main(): Promise<void> {
  init();

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === "remind") {
      console.info("Setting up new reminder...");

      const message = interaction.options.getString("message");
      const interval = interaction.options.getString("interval");
      const time = interaction.options.getInteger("time");
      const period = interaction.options.getString("period");
      if (message && interval && time && period) {
        const newReminder = birdie.addReminder({
          id: uuidv4(),
          message: message,
          interval: interval,
          time: time,
          period: period,
        });
        await interaction.reply(`Reminder "${message}" is added😆`);

        const cronExpression = formatExpression(interval, time, period);

        if (!cronExpression) return;

        cron.schedule(
          cronExpression,
          async () => {
            await interaction.followUp(`${message}`);
          },
          {
            timezone: "Asia/Hong_Kong",
            name: newReminder.id.toString(),
          }
        );
      }

      console.info("New reminder is set!");
    }

    if (commandName === "remove") {
      console.info("Removing old reminder...");

      const reminderId = interaction.options.getString("id");
      const tasks = cron.getTasks();
      let hasInvalidId = true;

      birdie.removeReminder(reminderId);
      for (const key of tasks.keys()) {
        if (key === reminderId.toString()) {
          tasks.get(key).stop();
          hasInvalidId = false;
        }
      }

      if (hasInvalidId) {
        await interaction.reply(`The reminder doesn't exist wo😈`);
        return;
      }

      await interaction.reply(`Reminder ${reminderId} is removed😛`);
      console.info(`Reminder ${reminderId} is removed!`);
    }

    if (commandName === "list") {
      console.info("Showing all reminders...");

      const reminders = birdie.getReminders();

      let allReminders = "";
      reminders.map((reminder) => {
        allReminders += `ID: ${reminder.id} | Reminder: ${
          reminder.message
        } | Schedule: ${formatInterval(
          reminder.interval,
          reminder.time,
          reminder.period
        )} \n`;
      });
      reminders.length > 0
        ? await interaction.reply(allReminders)
        : await interaction.reply("No reminder being set wo");

      console.info("Reminders shown or no reminders!");
    }

    if (commandName === "clear") {
      console.info("Clearing all reminders...");

      const tasks = cron.getTasks();
      for (const key of tasks.keys()) {
        tasks.get(key).stop();
      }
      birdie.clearReminders();
      await interaction.reply(`Clean now😎`);

      console.info("All reminders cleared!");
    }
  });
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
