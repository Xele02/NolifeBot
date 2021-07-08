const Commando = require('discord.js-commando');

module.exports = class TwitchRemoveListenRoleMessage extends Commando.Command{
	constructor(client) {
		super(client, {
			name: 'twitch_remove_listen_role',
			//aliases: ['chan'],
			group: 'twitch',
			memberName: 'remove_listen_role',
			description: 'Remove a role to identify user to show stream start.',
			examples: ['twitch_remove_listen_role role'],
			guildOnly: true,
      userPermissions: ['ADMINISTRATOR'],

			args: [
      {
        key: 'role',
        label: 'Server role to remove',
        prompt: 'Server role to remove',
        type: 'role'
      },
			]
		});
	}

	async run(msg, args) {
    let twitch_role = msg.guild.settings.get("twitch_role", []);
    twitch_role = twitch_role.filter(function(value) { return value != args.role.id; });
    msg.guild.settings.set("twitch_role", twitch_role);
		return msg.reply("Removed Role "+args.role.name);
	}
};
