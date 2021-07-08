const Commando = require('discord.js-commando');

module.exports = class TwitchStatusMessage extends Commando.Command{
	constructor(client) {
		super(client, {
			name: 'twitch_status',
			//aliases: ['chan'],
			group: 'twitch',
			memberName: 'twitch_status',
			description: 'Status of the bot',
			examples: ['twitch_status'],
			guildOnly: false,
      userPermissions: ['ADMINISTRATOR'],

			args: [
			]
		});
	}

	async run(msg, args) {

    let msg_res = "Guild setup : \n";
    for (var [gid, guild] of msg.client.guilds.cache) {
      msg_res += guild.name+"\n";
      const twitch_channel = guild.settings.get("twitch_channels", []);
      msg_res += "  Channels : ";
      for (var channel of twitch_channel) {
        let chan = guild.channels.resolve(channel);
        msg_res += (chan ? chan.name : channel)+", ";
      }
      msg_res += "\n  Roles : ";
      const twitch_role = guild.settings.get("twitch_role", []);
      for (var role of twitch_role) {
        let r = guild.roles.resolve(role);
        msg_res += (r ? r.name : role)+", ";
      }
    }
    await msg.reply(msg_res);
    msg_res = "";
    let twitch_account_by_user = msg.client.settings.get("twitch_account_by_user", {})
    let twitch_account_by_account = msg.client.settings.get("twitch_account_by_account", {})

    let twitch_account = []

    for (var [u,v] of Object.entries(twitch_account_by_user)) {
      if(v["manual"] !== undefined && !twitch_account.includes(v["manual"]))
        twitch_account.push(v["manual"]);
      if(v["auto"] !== undefined && !twitch_account.includes(v["auto"]))
        twitch_account.push(v["auto"]);
    }
    for (var [t,v] of Object.entries(twitch_account_by_account)) {
      if(!twitch_account.includes(t))
        twitch_account.push(t);
    }

    const users = await msg.client.twitch_api.getUsers(twitch_account);

    let twitch_account_dict = {}
    if(users["data"] !== undefined)
    {
      for (var tu of users.data) {
        twitch_account_dict[tu.id] = tu.login
      }
    }

    let new_user_list = {}
    for (var [u,v] of Object.entries(twitch_account_by_user)) {
      let new_l = {}
      if(twitch_account_dict[v["manual"]] !== "undefined")
        new_l["manual"] = twitch_account_dict[v["manual"]];
      if(twitch_account_dict[v["auto"]] !== "undefined")
        new_l["auto"] = twitch_account_dict[v["auto"]];
      let u_ = msg.client.users.resolve(u)
      if(u_)
        new_user_list[u_.username+"#"+u_.discriminator+"("+u+")"] = new_l
      else
        new_user_list[u] = new_l
    }
    let new_account_list = {}
    for (var [t,v] of Object.entries(twitch_account_by_account)) {
      let new_t = {}
      for (var [g, v2] of Object.entries(v)) {
        let new_list = []
        for (var u of v2) {
          let u_ = msg.client.users.resolve(u)
          if(u_)
            new_list.push(u_.username+"#"+u_.discriminator+"("+u+")")
          else
            new_list.push(u)
        }
        let g_ = msg.client.guilds.resolve(g)
        if(g_)
        {
          new_t[g_.name+"("+g+")"] = new_list;
        }
        else {
          new_t[g] = new_list;
        }
      }
      if(twitch_account_dict[t] !== undefined)
      {
        new_account_list[twitch_account_dict[t]+"("+t+")"] = new_t;
      }
      else {
        new_account_list[t] = new_t;
      }
    }

    msg_res = JSON.stringify(new_user_list, null, " ");
    await msg.reply(msg_res);
    msg_res = JSON.stringify(new_account_list, null, " ");
	  return msg.reply(msg_res);
	}
};
