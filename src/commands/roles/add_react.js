const Commando = require('discord.js-commando');
const isEmoji = require('is-standard-emoji');

module.exports = class AddReactRoleMessage extends Commando.Command{
	constructor(client) {
		super(client, {
			name: 'role_add_react',
			//aliases: ['chan'],
			group: 'roles',
			memberName: 'add_react',
			description: 'Add a react to listen to on a message to give/remove a role.',
			examples: ['role_add_react test :thumbsup: role false'],
			guildOnly: true,
      userPermissions: ['ADMINISTRATOR'],

			args: [
				{
					key: 'msg_id',
					label: 'Message Id',
					prompt: 'Enter message id where to add react',
					type: 'string',
          validate: (val, msg) => { return msg.guild.settings.get("role_msg", {})[val] !== undefined ? true : "Message id not existing"; }
				},
				{
					key: 'react',
					label: 'React to respond to',
					prompt: 'React to respond to',
					type: 'string',
          validate: (val,msg) => { return msg.client.emojis.cache.get(val) || isEmoji(val); }
				},
				{
					key: 'role',
					label: 'Server role to add/remove',
					prompt: 'Server role to add/remove',
					type: 'role'
				},
				{
					key: 'is_add',
					label: 'Set to add or remove the role',
					prompt: 'Is the role added ?',
					type: 'boolean',
          default: true
				}
			]
		});
	}

	async run(msg, args) {
    let role_msg = msg.guild.settings.get("role_msg", {});
    let cur_msg = role_msg[args.msg_id];
    if(cur_msg.react === undefined)
      cur_msg.react = {}
    if(args.react in cur_msg.react)
    {
      return msg.reply("This react is already defined for this message");
    }
    cur_msg.react[args.react] = {"is_add":args.is_add, "role":args.role.id};

    // Update all posted messages
    for(let key in cur_msg.post_ids)
    {
      try {
        let message = await msg.guild.channels.cache.get(key).messages.fetch(cur_msg.post_ids[key]);
        message.react(args.react);
      } catch (e) {
        console.error(e);
      }
    }

    msg.guild.settings.set("role_msg", role_msg);
		return msg.reply("Added react "+args.react+" to message "+args.msg_id+" for "+(args.is_add?"adding":"removing")+" role "+args.role.name);
	}
};
