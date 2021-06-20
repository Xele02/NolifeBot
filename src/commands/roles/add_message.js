const Commando = require('discord.js-commando');

module.exports = class RegisterRoleMessage extends Commando.Command{
	constructor(client) {
		super(client, {
			name: 'role_add_message',
			//aliases: ['chan'],
			group: 'roles',
			memberName: 'add_message',
			description: 'Register a message for user to add role.',
			examples: ['role_add_message test "React to this for the role"'],
			guildOnly: true,

			args: [
				{
					key: 'msg_id',
					label: 'Message Id',
					prompt: 'Enter unique message id',
					type: 'string',
          validate: (val, msg) => { return msg.guild.settings.get("role_msg", {})[val] === undefined ? true : "Message id already existing"; }
				},
				{
					key: 'content',
					label: 'Text to post for user to react to',
					prompt: 'Enter message to post for user to react to',
					type: 'string'
				}
			]
		});
	}

	async run(msg, args) {
    let role_msg = msg.guild.settings.get("role_msg", {});
    role_msg[args.msg_id] = {"content":args.content, react:{}, post_ids:{}};
    msg.guild.settings.set("role_msg", role_msg);
		return msg.reply("Added role message "+args.msg_id);
	}
};
