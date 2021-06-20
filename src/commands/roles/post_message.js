const Commando = require('discord.js-commando');

module.exports = class PostRoleMessage extends Commando.Command{
	constructor(client) {
		super(client, {
			name: 'role_post_message',
			//aliases: ['chan'],
			group: 'roles',
			memberName: 'post_message',
			description: 'Post the message on a channel',
			examples: ['role_post_message test my_channel'],
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

    if(args.channel_name.id in cur_msg.post_ids)
    {
      return msg.reply("Messge already posted in this channel.");
    }

    const message = await args.channel_name.send(cur_msg.content);
    cur_msg.post_ids[args.channel_name.id] = message.id;
    for(let [key, values] in cur_msg.react)
    {
      await message.react(key);
    }

    msg.guild.settings.set("role_msg", role_msg);
		return msg.reply("Message posted");
	}
};
