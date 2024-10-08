const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays a list of all commands and their descriptions.'),
    name: 'help',
    description: 'Displays a list of all commands and their descriptions.',
    execute(message) {
        const commandsDir = path.join(__dirname);
        const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

        const embed = new EmbedBuilder()
            .setTitle('Help Command')
            .setDescription('List of all commands and their descriptions:')
            .setColor('#00FF00');

        commandFiles.forEach(file => {
            const command = require(path.join(commandsDir, file));
            embed.addFields({ name: command.name, value: command.description || 'No description available.' });
        });

        message.channel.send({ embeds: [embed] }).catch(console.error);
    },
    info: {
        name: 'help',
        description: 'Displays a list of all commands and their descriptions.',
        usage: '/help'
    }
};