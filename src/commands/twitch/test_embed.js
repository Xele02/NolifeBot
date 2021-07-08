const Commando = require('discord.js-commando');

module.exports = class TwitchTestEmbedMessage extends Commando.Command{
	constructor(client) {
		super(client, {
			name: 'twitch_test_embed',
			//aliases: ['chan'],
			group: 'twitch',
			memberName: 'test_embed',
			description: 'Test embed.',
			examples: ['test_embed xele'],
			guildOnly: true,
      userPermissions: ['ADMINISTRATOR'],

			args: [
        {
					key: 'stream_name',
					label: 'Twitch name',
					prompt: 'Enter the Twitch name',
					type: 'string'
				}
			]
		});
	}

	async run(msg, args) {
    const embed = await msg.client.twitch_api.eventsub.streamonline.getembed(args.stream_name);
		return msg.reply(embed);
	}
};
