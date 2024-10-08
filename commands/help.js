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
    category: 'Misc',
    execute(message) {
        const commandsDir = path.join(__dirname);
        const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

        const categories = {};

        commandFiles.forEach(file => {
            const command = require(path.join(commandsDir, file));
            const category = command.category || 'Uncategorized';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(command);
        });

        const embed = new EmbedBuilder()
            .setTitle('Help Command')
            .setDescription('This is a list of the available commands and their descriptions. This is in testing and is subject to change.')
            .setColor('#000000');

        for (const category in categories) {
            const commands = categories[category].map(cmd => `**${cmd.name}**: ${cmd.description || 'No description available.'}`).join('\n');
            embed.addFields({ name: category, value: commands });
        }

        message.channel.send({ embeds: [embed] }).catch(console.error);
    },
    info: {
        name: 'help',
        description: 'Displays a list of all commands and their descriptions.',
        usage: '/help'
    }
};