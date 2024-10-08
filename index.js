const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const config = require('./config.json');
const fs = require('fs');
const path = require('path');

let client;

try {
    client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });
} catch (error) {
    if (error.message.includes('Invalid bitfield flag')) {
        console.error('Invalid bitfield flag provided:', error);
    } else {
        console.error('Error initializing client:', error);
    }
    process.exit(1);
}

client.commands = new Map();
const commands = [];

// Load commands from the commands folder
const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(path.join(__dirname, 'commands', file));
    if (command.name && command.data && typeof command.data.toJSON === 'function') {
        client.commands.set(command.name, command);
        commands.push(command.data.toJSON());
        console.log(`Loaded command: ${command.name}`);
    } else {
        console.warn(`Command at ${file} is missing required properties.`);
    }
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

// Load logging functions from the logging folder
const loggingFiles = fs.readdirSync(path.join(__dirname, 'logging')).filter(file => file.endsWith('.js'));

for (const file of loggingFiles) {
    const loggingFunction = require(path.join(__dirname, 'logging', file));
    if (typeof loggingFunction === 'function') {
        client.on('messageCreate', loggingFunction);
        console.log(`Loaded logging function from: ${file}`);
    }
}

client.on('error', error => {
    console.error('The WebSocket encountered an error:', error);
    restartClient();
});
client.on('shardError', error => {
    console.error('A websocket connection encountered an error:', error);
    restartClient();
});

process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
    restartClient();
});

client.on('rateLimit', info => {
    console.warn('Rate limit hit:', info);
});

client.on('warn', info => {
    console.warn('Warning:', info);
});

client.on('invalidRequestWarning', (info) => {
    console.warn('Invalid request warning:', info);
    restartClient();
});

client.on('missingPermissions', (message, command, missingPermissions) => {
    message.reply(`You are missing the following permissions to execute the ${command} command: ${missingPermissions.join(', ')}`);
    restartClient();
});

process.on('uncaughtException', error => {
    console.error('Uncaught exception:', error);
    restartClient();
    // Optionally restart the bot or take other actions to maintain uptime
});

function restartClient() {
    console.log('Restarting client...');
    client.destroy();
    client.login(config.token);
    console.log("Client restarted.");
}

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
