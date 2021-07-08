const Commando = require('discord.js-commando');
const fetch = require('node-fetch');
const config = require("../../../data/config.json");
const crypto = require('crypto')
const Discord = require("discord.js");

module.exports = class TwitchSetChannelMessage extends Commando.Command{
	constructor(client) {
		super(client, {
			name: 'twitch_set_channel',
			//aliases: ['chan'],
			group: 'twitch',
			memberName: 'set_channel',
			description: 'Set your twitch channel for autopromo.',
			examples: ['twitch_set_channel xele'],
			guildOnly: true,

			args: [
				{
					key: 'twitch_account',
					label: 'Twitch Account',
					prompt: 'Enter twitch account name',
					type: 'string'
				},
			]
		});

		client.twitch_api.eventsub = {
			"verifySignature": function(messageSignature, messageID, messageTimestamp, body)
			{
			    let message = messageID + messageTimestamp + body
			    let signature = crypto.createHmac('sha256', config.webhook_secret).update(message) // Remember to use the same secret set at creation
			    let expectedSignatureHeader = "sha256=" + signature.digest("hex")

			    return expectedSignatureHeader === messageSignature
			},
			"list": async function()
			{
				let result = await client.twitch_api._get("/eventsub/subscriptions");
				console.log(result);
				return result.data;
			},
			"streamonline": {
				"add": async function(userId)
				{
					const data = {
				    "type": "stream.online",
				    "version": "1",
				    "condition": {
				        "broadcaster_user_id": userId
				    },
				    "transport": {
				        "method": "webhook",
				        "callback": config.webhook_endpoint_base_url+"/twitch_event",
				        "secret": config.webhook_secret
				    }
					};

					console.log("Adding twitch hook to "+userId);
					let result = await client.twitch_api._update("/eventsub/subscriptions",data,"post");
					//console.log(result);

					if(result["data"] === undefined
					|| result.data[0]["status"] === undefined
					|| result.data[0].status != "webhook_callback_verification_pending")
					{
						console.error(result);
						return "There was an error registering to twitch API for user "+userId;
					}
					console.log("Registred event for user "+userId);
					return true;
				},
				"get": async function(userId)
				{
					let result = await client.twitch_api._get("/eventsub/subscriptions");
					//console.log(result);
					for(let k in result.data)
					{
						const data = result.data[k]
						if(data.type == "stream.online" && data.condition.broadcaster_user_id == userId)
						{
							return data;
						}
					}
					return false;
				},
				"remove": async function(userId)
				{
					let existing = await client.twitch_api.eventsub.streamonline.get(userId)
					if(existing != false)
					{
						console.log("Remove twitch hook to "+userId);
						let result = await client.twitch_api._update("/eventsub/subscriptions?id="+existing.id,{},"delete");
						if(result["error"] !== undefined)
							return "Erreur Twitch API"
					}
					return true;
				},
				"getembed": async function(userId)
				{
					let streaminfo = await client.twitch_api.getStreams({channels:[userId]});
					if(streaminfo.data.length == 0)
						return "No stream info";

					let userinfo = await client.twitch_api.getUsers(userId);
					let useravatar = ""
					if(userinfo.data.length > 0)
						useravatar = userinfo.data[0].profile_image_url

					const embedMessage = new Discord.MessageEmbed()
						.setAuthor(streaminfo.data[0].user_name+" is now live on twitch",useravatar,"http://www.twitch.tv/"+streaminfo.data[0].user_name)
						.setTitle(streaminfo.data[0].title)
						.setDescription("Playing "+streaminfo.data[0].game_name)
						.setImage(streaminfo.data[0].getThumbnailUrl())
						.setURL("http://www.twitch.tv/"+streaminfo.data[0].user_name)
					return embedMessage;
				}
			}

		}

		client.twitch_api.add_channel_listen = async function(guild_id, user_id, twitch_id, is_manual_set)
		{
			let twitch_account_by_user = client.settings.get("twitch_account_by_user", {})
			let twitch_account_by_account = client.settings.get("twitch_account_by_account", {})

			if(twitch_account_by_account[twitch_id] === undefined)
			{
				console.log("twitch_account_by_account add "+twitch_id);
				twitch_account_by_account[twitch_id] = {}
			}
			if(twitch_account_by_account[twitch_id][guild_id] === undefined)
			{
				console.log("twitch_account_by_account["+twitch_id+"] add "+guild_id);
				twitch_account_by_account[twitch_id][guild_id] = []
			}

			if(!twitch_account_by_account[twitch_id][guild_id].includes(user_id))
			{
				console.log("twitch_account_by_account["+twitch_id+"]["+guild_id+"] add "+user_id);
				twitch_account_by_account[twitch_id][guild_id].push(user_id);
			}

			if(user_id != -1)
			{
				if(twitch_account_by_user[user_id] === undefined)
				{
					console.log("twitch_account_by_user add "+user_id);
					twitch_account_by_user[user_id] = {}
				}
				if(is_manual_set)
				{
					console.log("twitch_account_by_user["+user_id+"] add manual "+twitch_id);
					twitch_account_by_user[user_id]["manual"] = twitch_id;
				}
				else
				{
					console.log("twitch_account_by_user["+user_id+"] add auto "+twitch_id);
					twitch_account_by_user[user_id]["auto"] = twitch_id;
				}
			}

			const existing = await client.twitch_api.eventsub.streamonline.get(twitch_id);
			if(existing == false)
			{

				const result = await client.twitch_api.eventsub.streamonline.add(twitch_id);
				if(result != true)
				{
					return result;
				}
			}

			client.settings.set("twitch_account_by_user", twitch_account_by_user);
			client.settings.set("twitch_account_by_account", twitch_account_by_account);

			return true;

		}
		client.twitch_api.remove_channel_listen_indep = async function(guild_id, twitch_id)
		{
			let twitch_account_by_account = client.settings.get("twitch_account_by_account", {})
			let user_id = -1;

			if(twitch_account_by_account[twitch_id] !== undefined)
			{
				if(twitch_account_by_account[twitch_id][guild_id] !== undefined)
				{
					console.log("twitch_account_by_account["+twitch_id+"]["+guild_id+"] del "+user_id);
					twitch_account_by_account[twitch_id][guild_id] = twitch_account_by_account[twitch_id][guild_id].filter(function(value) { return value != user_id; });
				}
				if(twitch_account_by_account[twitch_id][guild_id].length == 0)
				{
					console.log("twitch_account_by_account["+twitch_id+"] del "+guild_id);
					delete twitch_account_by_account[twitch_id][guild_id];
				}
				if(Object.keys(twitch_account_by_account[twitch_id]).length == 0)
				{
					console.log("twitch_account_by_account del"+twitch_id);
					delete twitch_account_by_account[twitch_id];
					await client.twitch_api.eventsub.streamonline.remove(twitch_id);
				}
			}

			client.settings.set("twitch_account_by_account", twitch_account_by_account);

			return true
		}
		client.twitch_api.remove_channel_listen = async function(guild_id, user_id, is_manual_set)
		{
			let twitch_account_by_user = client.settings.get("twitch_account_by_user", {})
			let twitch_account_by_account = client.settings.get("twitch_account_by_account", {})

			let twitch_id = ""

			if(twitch_account_by_user[user_id] !== undefined)
			{
				if(twitch_account_by_user[user_id]["manual"] !== undefined)
				{
					console.log("twitch_account_by_user["+user_id+"] del manual ");
					twitch_id = twitch_account_by_user[user_id]["manual"];
					delete twitch_account_by_user[user_id]["manual"];
				}
				if(!is_manual_set && twitch_account_by_user[user_id]["auto"] !== undefined)
				{
					console.log("twitch_account_by_user["+user_id+"] del auto ");
					twitch_id = twitch_account_by_user[user_id]["auto"];
					delete twitch_account_by_user[user_id]["auto"];
				}
				if(twitch_account_by_user[user_id]["auto"] == twitch_id || twitch_account_by_user[user_id]["manual"] == twitch_id)
				{
					twitch_id = "";
				}
				if(Object.keys(twitch_account_by_user[user_id]).length == 0)
				{
					console.log("twitch_account_by_user del "+user_id);
					delete twitch_account_by_user[user_id];
				}
			}

			if(twitch_account_by_account[twitch_id] !== undefined)
			{
				if(twitch_account_by_account[twitch_id][guild_id] !== undefined)
				{
					console.log("twitch_account_by_account["+twitch_id+"]["+guild_id+"] del "+user_id);
					twitch_account_by_account[twitch_id][guild_id] = twitch_account_by_account[twitch_id][guild_id].filter(function(value) { return value != user_id; });
				}
				if(twitch_account_by_account[twitch_id][guild_id].length == 0)
				{
					console.log("twitch_account_by_account["+twitch_id+"] del "+guild_id);
					delete twitch_account_by_account[twitch_id][guild_id];
				}
				if(Object.keys(twitch_account_by_account[twitch_id]).length == 0)
				{
					console.log("twitch_account_by_account del"+twitch_id);
					delete twitch_account_by_account[twitch_id];
					await client.twitch_api.eventsub.streamonline.remove(twitch_id);
				}
			}

			client.settings.set("twitch_account_by_user", twitch_account_by_user);
			client.settings.set("twitch_account_by_account", twitch_account_by_account);

			return true
		}
		client.twitch_api.replace_or_add_channel_listen = async function(guild_id, user_id, twitch_id, is_manual_set)
		{
			let twitch_account_by_user = client.settings.get("twitch_account_by_user", {})
			if(user_id != -1)
			{
				if(twitch_account_by_user[user_id] !== undefined)
				{
					if(is_manual_set)
					{
						if(twitch_account_by_user[user_id]["manual"] !== undefined)
						{
							if(twitch_account_by_user[user_id]["manual"] == twitch_id)
							{
								console.log("replace_or_add_channel_listen user already has manual");
							}
							else
							{
								await client.twitch_api.remove_channel_listen(guild_id, user_id, is_manual_set);
							}
						}
					}
					else {
						if(twitch_account_by_user[user_id]["auto"] !== undefined)
						{
							if(twitch_account_by_user[user_id]["auto"] == twitch_id)
							{
								console.log("replace_or_add_channel_listen user already has auto");
							}
							else
							{
								await client.twitch_api.remove_channel_listen(guild_id, user_id, is_manual_set);
							}
						}
					}
				}
			}
			else
			{
				await client.twitch_api.remove_channel_listen(guild_id, user_id, true);
			}

			return await client.twitch_api.add_channel_listen(guild_id, user_id, twitch_id, is_manual_set);
		}
		client.twitch_api.post = async function(twitch_id)
		{
			const twitch_account_by_account = client.settings.get("twitch_account_by_account", {});
			if(twitch_account_by_account[twitch_id] !== undefined)
			{
				const embedMessage = await client.twitch_api.eventsub.streamonline.getembed(twitch_id);

				for(let [g, us] of Object.entries(twitch_account_by_account[twitch_id]))
				{
					let guild = client.guilds.resolve(g);
					if(guild)
					{
						const twitch_role = guild.settings.get("twitch_role", []);
						let valid = false;
						for (var u of us) {
							if(u == -1)
								valid = true;
							else
							{
								let u_ = guild.members.resolve(u);
								if(u_)
								{
									for(var r of twitch_role)
									{
										valid |= u_.roles.cache.has(r);
									}
								}
							}
						}
						if(valid)
						{
							const twitch_channels = guild.settings.get("twitch_channels", []);
							const twitch_timeouts = guild.settings.get("twitch_timeouts", {});
							const now = Date.now();
							const timestamps = twitch_timeouts[twitch_id] || 0;
							const cooldownAmount = 60 * 1000;
							const expirationTime = timestamps + cooldownAmount;
							twitch_timeouts[twitch_id] = now;
							guild.settings.set("twitch_timeouts", twitch_timeouts);
							if (now > expirationTime)
							{
								for(let c in twitch_channels)
								{
								 guild.channels.resolve(twitch_channels[c]).send(embedMessage);
								}
							}
							else {
								console.log("twitch "+twitch_id+" in wait");
							}
						}
					}
				}
			}
		}

		client.twitch_webhookfunc = async (req, res) => {
			if (!client.twitch_api.eventsub.verifySignature(req.header("Twitch-Eventsub-Message-Signature"),
	            req.header("Twitch-Eventsub-Message-Id"),
	            req.header("Twitch-Eventsub-Message-Timestamp"),
	            req.rawBody))
			{
				console.error("Signature don't match : "+req.body);
	      res.status(403).send("Forbidden") // Reject requests with invalid signatures
				return;
	    }
			else
			{
	        if (req.header("Twitch-Eventsub-Message-Type") === "webhook_callback_verification") {
	            console.log(req.body)
	            res.send(req.body.challenge) // Returning a 200 status with the received challenge to complete webhook creation flow
							return;
	        } else if (req.header("Twitch-Eventsub-Message-Type") === "notification") {
	            console.log(req.body) // Implement your own use case with the event data at this block
	            res.send("") // Default .send is a 200 status
							if(req.header("Twitch-Eventsub-Subscription-Type") === "stream.online")
							{

								if(req.body.event.type == "live")
								{
									try {

										client.twitch_api.post(req.body.event.broadcaster_user_id)
									} catch (e) {
										console.error(e)
									} finally {

									}
								}
							}

							return;
	        }
	    }
			console.log(req.body);
			res.status(403).send("Forbidden")
    }

    client.webhookListener.all("/twitch_event*", async (req, res) => {
			try {
				return await client.twitch_webhookfunc(req,res);
			} catch (e) {
				console.log(e);
			} finally {

			}
		})

    client.handler.set("twitch_handler", this);
	}

	async onGuildMemberUpdate(oldMember, newMember)
	{
		const twitch_role = oldMember.guild.settings.get("twitch_role", []);
		for(var r of twitch_role)
		{
			if(!oldMember.roles.cache.has(r) && newMember.roles.cache.has(r))
			{
				console.log("Detected twitch user for "+newMember.user.username);
				//if(newMember.user.)
				return;
			}
			else if(oldMember.roles.cache.has(r) && !newMember.roles.cache.has(r))
			{
				console.log("Auto Remove twitch info for "+newMember.user.username);
				await newMember.client.twitch_api.remove_channel_listen(newMember.guild.id, newMember.user.id, false)
				return;
			}
		}
	}

	async onPresenceUpdate(oldPresence, newPresence)
	{
    if (!newPresence.activities) return false;
    for (var activity of newPresence.activities) {
      if (activity.type == "STREAMING") {
        console.log(`${newPresence.user.tag} is streaming at ${activity.url}.`);
				const twitch_role = newPresence.guild.settings.get("twitch_role", []);
				for(var r of twitch_role)
				{
					if(newPresence.member.roles.cache.has(r))
					{
						let url = activity.url.replace("https://www.twitch.tv/","");
						console.log("Presence Adding twitch info for "+newPresence.member.user.username+" on channel "+url);

						const users = await newPresence.client.twitch_api.getUsers(url);
				    const user = users.data[0];
				    if(user === undefined)
				      return "Invalid twitch account";
				    const userId = user.id;

						let isNew = false;
						const twitch_account_by_account = newPresence.client.settings.get("twitch_account_by_account", {});
						if(twitch_account_by_account[userId] === undefined)
						{
							isNew = true;
						}

						await newPresence.client.twitch_api.replace_or_add_channel_listen (newPresence.member.guild.id, newPresence.member.user.id, userId, false)
						if(isNew)
							await newPresence.client.twitch_api.post(userId);
						return;
					}
				}
      }
    }
	}

	async run(msg, args) {
    //const streams = await msg.client.twitch_api.getStreams({ channel: args.twitch_account });
    const users = await msg.client.twitch_api.getUsers(args.twitch_account);
    const user = users.data[0];
    if(user === undefined)
      return msg.reply("Invalid twitch account");
    const userId = user.id;

		const result = await msg.client.twitch_api.replace_or_add_channel_listen(msg.guild.id, msg.author.id, userId, true);
		if(result != true)
		{
			return msg.reply(result);
		}

		return msg.reply("Manual twitch account enabled");
	}
};
