const Commando = require('discord.js-commando');

module.exports = class RemovePostedRoleMessage extends Commando.Command{
	constructor(client) {
		super(client, {
			name: 'role_remove_message',
			//aliases: ['chan'],
			group: 'roles',
			memberName: 'remove_message',
			description: 'Remove a message posted on a channel',
			examples: ['role_remove_message test my_channel'],
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
					key: 'channel_name',
					label: 'Channel where to post',
					prompt: 'Enter the channel',
					type: 'channel'
				}
			]
		});
	}

	async run(msg, args) {
    let role_msg = msg.guild.settings.get("role_msg", {});
    let cur_msg = role_msg[args.msg_id];

    if(cur_msg.post_ids === undefined)
    {
      cur_msg.post_ids = {}
    }

    if(cur_msg.post_ids[args.channel_name.id] === undefined)
    {
      return msg.reply("Messge not in this channel.");
    }

    //const message = async args.channel.send(cur_msg.content);
    let message = await msg.guild.channels.cache.get(args.channel_name.id).messages.fetch(cur_msg.post_ids[args.channel_name.id]);
    await message.delete();
    delete cur_msg.post_ids[args.channel_name.id];

    msg.guild.settings.set("role_msg", role_msg);
		return msg.reply("Message removed");
	}
};
