const Commando = require('discord.js-commando');

module.exports = class TwitchAddPostChannelMessage extends Commando.Command{
	constructor(client) {
		super(client, {
			name: 'twitch_add_post_channel',
			//aliases: ['chan'],
			group: 'twitch',
			memberName: 'add_post_channel',
			description: 'Add a channel for auto promo.',
			examples: ['add_post_channel channel'],
			guildOnly: true,
      userPermissions: ['ADMINISTRATOR'],

			args: [
        {
					key: 'channel_name',
					label: 'Channel where to post',
					prompt: 'Enter the channel',
					type: 'channel'
				}
			]
		});
	}

	async run(msg, args) {
    let twitch_channels = msg.guild.settings.get("twitch_channels", []);
    if(!twitch_channels.includes(args.channel_name.id))
      twitch_channels.push(args.channel_name.id);
    msg.guild.settings.set("twitch_channels", twitch_channels);
		return msg.reply("Added channel "+args.channel_name.name);
	}
};
