const Commando = require('discord.js-commando');

module.exports = class ListServerCommand extends Commando.Command{
	constructor(client) {
		super(client, {
			name: 'list_servers',
			//aliases: ['chan'],
			group: 'admin',
			memberName: 'list_servers',
			description: 'Get list of joined servers.',
			examples: ['list_servers'],
			guildOnly: false,
			ownerOnly: true,

			args: [
				/*{
					key: 'channel',
					label: 'textchannel',
					prompt: 'What channel would you like to snoop on?',
					type: 'channel'
				}*/
			]
		});
	}

	async run(msg, args) {
		const result_msg = "Server list : \n"+msg.client.guilds.cache.map(g => g.id+" "+g.name).join("\n");
		return msg.reply(result_msg);
	}
};
