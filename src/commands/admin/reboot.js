const Commando = require('discord.js-commando');

module.exports = class RebootCommand extends Commando.Command{
	constructor(client) {
		super(client, {
			name: 'reboot',
			//aliases: ['chan'],
			group: 'admin',
			memberName: 'reboot',
			description: 'Reboot.',
			examples: ['reboot'],
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
    await msg.reply("Rebooting");
		msg.client.destroy();
    process.kill(process.pid, 'SIGTERM')
    return null;
	}
};
