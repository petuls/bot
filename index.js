const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config.json');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', message => {
    try {
        if (message.content === '!ping') {
            message.reply('!ping');
        }
    } catch (error) {
        console.error('Error handling messageCreate event:', error);
    }
});

client.on('error', error => {
    console.error('The WebSocket encountered an error:', error);
});
client.on('shardError', error => {
    console.error('A websocket connection encountered an error:', error);
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

client.on('rateLimit', info => {
    console.warn('Rate limit hit:', info);
});

client.on('warn', info => {
    console.warn('Warning:', info);
});

client.on('missingPermissions', (message, command, missingPermissions) => {
    message.reply(`You are missing the following permissions to execute the ${command} command: ${missingPermissions.join(', ')}`);
});

process.on('uncaughtException', error => {
    console.error('Uncaught exception:', error);
    // Optionally restart the bot or take other actions to maintain uptime
});

process.on('SIGTERM', () => {
    console.log('Received SIGTERM, shutting down gracefully.');
    client.destroy();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('Received SIGINT, shutting down gracefully.');
    client.destroy();
    process.exit(0);
});

client.on('messageCreate', async message => {
    try {
        if (message.content.startsWith('!ban')) {
            if (!message.member || !message.member.permissions.has('BAN_MEMBERS') || !message.guild.me || !message.guild.me.permissions.has('BAN_MEMBERS')) {
                return message.reply('You do not have permission to use this command.');
            }

            const user = message.mentions.users.first();
            if (!user) {
                return message.reply('Please mention a user to ban.');
            }

            const member = message.guild.members.resolve(user);
            if (!member) {
                return message.reply('User not found.');
            }

            await member.ban();
            message.reply(`${user.tag} has been banned.`);
        }
    } catch (error) {
        console.error('Error handling messageCreate event:', error);
    }
});

client.login(config.token);
