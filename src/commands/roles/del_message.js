const Commando = require('discord.js-commando');

module.exports = class DeleteRoleMessage extends Commando.Command{
	constructor(client) {
		super(client, {
			name: 'role_delete_message',
			//aliases: ['chan'],
			group: 'roles',
			memberName: 'del_message',
			description: 'Delete a message for user to add role.',
			examples: ['role_delete_message test true'],
			guildOnly: true,

			args: [
				{
					key: 'msg_id',
					label: 'Message Id',
					prompt: 'Enter message id to delete',
					type: 'string',
          validate: (val, msg) => { return msg.guild.settings.get("role_msg", {})[val] !== undefined ? true : "Message id not existing"; }
				},
				{
					key: 'delete_posted_message',
					label: 'Delete posted message at the same time',
					prompt: 'Delete posted message ?',
					type: 'boolean',
          default: true
				}
			]
		});
	}

	async run(msg, args) {
    let role_msg = msg.guild.settings.get("role_msg", {});

    if(args.delete_posted_message)
    {
      for(let key in role_msg[args.msg_id].post_ids)
      {
        try {
          let message = await msg.guild.channels.cache.get(key).messages.fetch(role_msg[args.msg_id].post_ids[key]);
          await message.delete();
        } catch (e) {
          console.error(e);
        }
      }
    }

    delete role_msg[args.msg_id];
    msg.guild.settings.set("role_msg", role_msg);
		return msg.reply("Removed role message "+args.msg_id);
	}
};
