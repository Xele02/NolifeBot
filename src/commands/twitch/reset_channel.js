const Commando = require('discord.js-commando');

module.exports = class TwitchResetChannelMessage extends Commando.Command{
	constructor(client) {
		super(client, {
			name: 'twitch_reset_channel',
			//aliases: ['chan'],
			group: 'twitch',
			memberName: 'reset_channel',
			description: 'Reset your twitch channel from the bot.',
			examples: ['twitch_reset_channel'],
			guildOnly: false,

			args: []
		});
	}

	async run(msg, args) {
		const result = await msg.client.twitch_api.remove_channel_listen(msg.guild.id, msg.author.id, true);
		if(result != true)
		{
			return msg.reply(result);
		}

		return msg.reply("Manual twitch account removed");
	}
};
