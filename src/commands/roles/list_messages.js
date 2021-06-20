const Commando = require('discord.js-commando');

module.exports = class ListRoleMessages extends Commando.Command{
	constructor(client) {
		super(client, {
			name: 'role_list_messages',
			//aliases: ['chan'],
			group: 'roles',
			memberName: 'list_messages',
			description: 'List all messages configured.',
			examples: ['role_list_messages'],
			guildOnly: true,
      userPermissions: ['ADMINISTRATOR'],

			args: []
		});
    client.handler.set("role_handler", this);
	}

	async run(msg, args) {
    let role_msg = msg.guild.settings.get("role_msg", {});
		return msg.reply("Current role message registred : \n"+Object.keys(role_msg).join(" "));
	}

  async onMessageReactionAdd(reaction, user)
  {
    if(reaction.message.author.id != this.client.user.id)
      return;

    if(user.id == this.client.user.id)
      return;

    let role_msg = reaction.message.guild.settings.get("role_msg", {});
    for(let msg_key in role_msg)
    {
      let channel_id = reaction.message.channel.id;
      let message_id = reaction.message.id;
      if(channel_id in role_msg[msg_key].post_ids && reaction.message.id == role_msg[msg_key].post_ids[channel_id])
      {
        let emoji_id = reaction.emoji.name;
        if(emoji_id in role_msg[msg_key].react)
        {
          let role_id = role_msg[msg_key].react[emoji_id].role;
          let role = reaction.message.guild.roles.cache.get(role_id);

          // Let's pretend you mentioned the user you want to add a role to (!addrole @user Role Name):
          let member = reaction.message.guild.member(user);

          if(role_msg[msg_key].react[emoji_id].is_add)
          {
            // Add the role!
            await member.roles.add(role).catch(console.error);
          }
          else {
            // Remove a role!
            await member.roles.remove(role).catch(console.error);
          }
          reaction.users.remove(user.id);
        }
        else
        {
          // Remove unwanted reaction
          reaction.users.remove(user.id);
        }
      }
    }
  }
};
