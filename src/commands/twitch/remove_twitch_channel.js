const Commando = require('discord.js-commando');

module.exports = class TwitchRemoveTwitchChannelMessage extends Commando.Command{
	constructor(client) {
		super(client, {
			name: 'twitch_remove_twitch_channel',
			//aliases: ['chan'],
			group: 'twitch',
			memberName: 'remove_twitch_channel',
			description: 'Remove a channel to listen',
			examples: ['twitch_remove_twitch_channel xele'],
			guildOnly: true,
      userPermissions: ['ADMINISTRATOR'],

			args: [
				{
					key: 'twitch_account',
					label: 'Twitch Account',
					prompt: 'Enter twitch account name',
					type: 'string'
				},
				{
					key: 'discord_user',
					label: 'Discord User',
					prompt: 'Enter discord user name',
					type: 'user',
          default:''
				},
			]
		});
	}

	async run(msg, args) {
    //const streams = await msg.client.twitch_api.getStreams({ channel: args.twitch_account });
    const users = await msg.client.twitch_api.getUsers(args.twitch_account);
    const user = users.data[0];
    if(user === undefined)
      return msg.reply("Invalid twitch account");
    const userId = user.id;

    let discord_id = (args.discord_user !== undefined && args.discord_user != '') ? args.discord_user.id : -1;

    if(discord_id == -1)
    {
  		const result = await msg.client.twitch_api.remove_channel_listen_indep(msg.guild.id, userId);
  		if(result != true)
  		{
  			return msg.reply(result);
  		}
    }
    else {
  		const result = await msg.client.twitch_api.remove_channel_listen(msg.guild.id, discord_id, true);
  		if(result != true)
  		{
  			return msg.reply(result);
  		}

    }

		return msg.reply("Manual twitch account removed");
	}
};
