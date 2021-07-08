const Commando = require('discord.js-commando');

module.exports = class TwitchListEventSubMessage extends Commando.Command{
	constructor(client) {
		super(client, {
			name: 'twitch_list_eventsub',
			//aliases: ['chan'],
			group: 'twitch',
			memberName: 'list_eventsub',
			description: 'List event sub.',
			examples: ['list_eventsub'],
			guildOnly: false,
      userPermissions: ['ADMINISTRATOR'],

			args: [
			]
		});
	}

	async run(msg, args) {
    const data = await msg.client.twitch_api.eventsub.list();
    let msg_res = "Event Sub : \n"+JSON.stringify(data, null, " ");
	   return msg.reply(msg_res);
	}
};
