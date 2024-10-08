const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const config = require('./config.json');
const fs = require('fs');
const path = require('path');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

client.commands = new Map();
const commands = [];

// Load commands from the commands folder
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(__dirname, 'commands', file));
    client.commands.set(command.name, command);
    commands.push(command.data.toJSON());
    console.log(`Loaded command: ${command.name}`);
}

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const rest = new REST({ version: '10' }).setToken(config.token);

    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Error executing command ${interaction.commandName}:`, error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.on('messageCreate', async message => {
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (commandName === 'help') {
        const helpMessage = client.commands.map(cmd => `\`${cmd.name}\`: ${cmd.description}`).join('\n');
        return message.reply(`Here are the available commands:\n${helpMessage}`);
    }

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
        await command.execute(message, args);
    } catch (error) {
        console.error(`Error executing command ${commandName}:`, error);
        message.reply('There was an error trying to execute that command!');
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

client.login(config.token);
