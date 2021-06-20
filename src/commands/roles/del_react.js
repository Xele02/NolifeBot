const Commando = require('discord.js-commando');
const isEmoji = require('is-standard-emoji');

module.exports = class DelReactRoleMessage extends Commando.Command{
	constructor(client) {
		super(client, {
			name: 'role_delete_react',
			//aliases: ['chan'],
			group: 'roles',
			memberName: 'del_react',
			description: 'Remove a react from a message.',
			examples: ['role_delete_react msg_id react'],
			guildOnly: true,
      userPermissions: ['ADMINISTRATOR'],

			args: [
				{
					key: 'msg_id',
					label: 'Message Id',
					prompt: 'Enter unique message id',
					type: 'string',
          validate: (val, msg) => { return msg.guild.settings.get("role_msg", {})[val] !== undefined ? true : "Message id not existing"; }
				},
				{
					key: 'react',
					label: 'React to remove',
					prompt: 'React to remove',
					type: 'string',
          validate: (val,msg) => { return msg.client.emojis.cache.get(val) || isEmoji(val); }
				},
			]
		});
	}

	async run(msg, args) {
    let role_msg = msg.guild.settings.get("role_msg", {});
    let cur_msg = role_msg[args.msg_id];
    if(cur_msg.react === undefined)
      cur_msg.react = {}
    if(cur_msg.react[args.react] === undefined)
    {
      return msg.reply("This react is not defined for this message");
    }
    // Update all posted messages
    for(let key in cur_msg.post_ids)
    {
      try {
        let message = await msg.guild.channels.cache.get(key).messages.fetch(cur_msg.post_ids[key]);
        message.reactions.cache.get(args.react).remove();
      } catch (e) {
        console.error(e);
      }
    }

    delete cur_msg.react[args.react];
    msg.guild.settings.set("role_msg", role_msg);
		return msg.reply("Removed react "+args.react+" from message "+args.msg_id);
	}
};
