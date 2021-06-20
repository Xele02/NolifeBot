const fs = require('fs');
const Discord = require("discord.js");
const Commando = require('discord.js-commando');
const config = require("../data/config.json");
const path = require('path');
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const oneLine = require('common-tags').oneLine;

const client = new Commando.Client({
    owner: config.allowed_control_users,
    partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

client.handler = new Discord.Collection();

client
  .on("error", console.error)
  .on("warn", console.warn)
  //.on("debug", console.info)
  .on('ready', () => {
		console.log(`Client ready; logged in as ${client.user.username}#${client.user.discriminator} (${client.user.id})`);
	})
  .on('disconnect', () => { console.warn('Disconnected!'); })
	.on('reconnecting', () => { console.warn('Reconnecting...'); })
	.on('commandError', (cmd, err) => {
		if(err instanceof Commando.FriendlyError) return;
		console.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err);
	})
	.on('commandBlocked', (msg, reason) => {
		console.log(oneLine`
			Command ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ''}
			blocked; ${reason}
		`);
	})
	.on('commandPrefixChange', (guild, prefix) => {
		console.log(oneLine`
			Prefix ${prefix === '' ? 'removed' : `changed to ${prefix || 'the default'}`}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
	})
	.on('commandStatusChange', (guild, command, enabled) => {
		console.log(oneLine`
			Command ${command.groupID}:${command.memberName}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
	})
	.on('groupStatusChange', (guild, group, enabled) => {
		console.log(oneLine`
			Group ${group.id}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
		`);
	})
  .on('messageReactionAdd', async (reaction, user) => {
    if (reaction.partial) {
  		// If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
  		try {
  			await reaction.fetch();
  		} catch (error) {
  			console.error('Something went wrong when fetching the message: ', error);
  			// Return as `reaction.message.author` may be undefined/null
  			return;
  		}
  	}
    for(let [key, value] of client.handler)
    {
      try {

        if(value.onMessageReactionAdd !== undefined)
        {
          await value.onMessageReactionAdd(reaction, user);
        }
      } catch (e) {
        console.error(e);
      }
    }
  })
  ;

client.setProvider(
	sqlite.open({ filename: path.join(__dirname, '../data/database.sqlite3'), driver: sqlite3.Database }).then(db => new Commando.SQLiteProvider(db))
).catch(console.error);

client.registry
  .registerGroup('admin','Admin')
  .registerGroup('roles','Roles')
  .registerGroup('twitch','Twitch')
	.registerDefaults()
	.registerTypesIn(path.join(__dirname, 'types'))
	.registerCommandsIn(path.join(__dirname, 'commands'));

client.login(config.token);
