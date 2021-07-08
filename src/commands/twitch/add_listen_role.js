const Commando = require('discord.js-commando');

module.exports = class TwitchAddListenRoleMessage extends Commando.Command{
	constructor(client) {
		super(client, {
			name: 'twitch_add_listen_role',
			//aliases: ['chan'],
			group: 'twitch',
			memberName: 'add_listen_role',
			description: 'Add a role to identify user to show stream start.',
			examples: ['twitch_add_listen_role role'],
			guildOnly: true,
      userPermissions: ['ADMINISTRATOR'],

			args: [
      {
        key: 'role',
        label: 'Server role to listen',
        prompt: 'Server role to listen',
        type: 'role'
      },
			]
		});
	}

	async run(msg, args) {
    let twitch_role = msg.guild.settings.get("twitch_role", []);
    if(!twitch_role.includes(args.role.id))
      twitch_role.push(args.role.id);
    msg.guild.settings.set("twitch_role", twitch_role);
		return msg.reply("Added Role "+args.role.name);
	}
};
