import { Message } from "discord.js";
import Command from "structures/Command";
import Bot from "structures/Bot";
import { time } from "@discordjs/builders";

export default class WeeklyCommand extends Command {
  constructor(bot: Bot) {
    super(bot, {
      name: "weekly",
      description: "Collect your weekly price",
      category: "economy",
    });
  }

  async execute(message: Message) {
    const lang = await this.bot.utils.getGuildLang(message.guild?.id);

    try {
      const user = await this.bot.utils.getUserById(message.author.id, message.guild?.id);

      if (!user) {
        return message.channel.send({ content: lang.GLOBAL.ERROR });
      }

      const timeout = 60 * 60 * 1000 * 24 * 7; /* 1 week timeout */
      const amount = 1000;
      const weekly = user.weekly;

      if (weekly !== null && timeout - (Date.now() - weekly) > 0) {
        const dateTime = new Date(Date.now() + timeout - (Date.now() - weekly));

        message.channel.send({
          content: `${lang.ECONOMY.WEEKLY_ERROR}. Check back ${time(dateTime, "R")}`,
        });
      } else {
        await this.bot.utils.updateUserById(message.author.id, message.guild?.id, {
          money: user.money + amount,
          weekly: Date.now(),
        });

        message.channel.send({
          content: lang.ECONOMY.WEEKLY_SUCCESS.replace("{amount}", `${amount}`),
        });
      }
    } catch (err) {
      this.bot.utils.sendErrorLog(err, "error");
      return message.channel.send({ content: lang.GLOBAL.ERROR });
    }
  }
}
