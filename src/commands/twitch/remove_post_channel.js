const Commando = require('discord.js-commando');

module.exports = class TwitchRemovePostChannelMessage extends Commando.Command{
	constructor(client) {
		super(client, {
			name: 'twitch_remove_post_channel',
			//aliases: ['chan'],
			group: 'twitch',
			memberName: 'remove_post_channel',
			description: 'Remove a channel for auto promo.',
			examples: ['remove_post_channel channel'],
			guildOnly: true,
      userPermissions: ['ADMINISTRATOR'],

			args: [
        {
					key: 'channel_name',
					label: 'Channel to remove',
					prompt: 'Enter the channel',
					type: 'channel'
				}
			]
		});
	}

	async run(msg, args) {
    let twitch_channels = msg.guild.settings.get("twitch_channels", []);
    twitch_channels = twitch_channels.filter(function(value) { return value != args.channel_name.id; });
    msg.guild.settings.set("twitch_channels", twitch_channels);
		return msg.reply("Removed channel "+args.channel_name.name);
	}
};
