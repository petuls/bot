const fs = require('fs');
const path = require('path');
const { MessageEmbed, client} = require('discord.js');

module.exports = (client) => {
    const configPath = path.join(__dirname, 'config.json');

    client.once('ready', () => {
        client.on('messageDelete', async (message) => {
            if (message.partial) {
                try {
                    await message.fetch();
                } catch (error) {
                    console.error('Something went wrong when fetching the message:', error);
                    return;
                }
            }

            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            const logChannelId = config.logChannelId;

            if (!logChannelId) {
                console.error('Log channel ID is not set in the config file.');
                return;
            }

            const logChannel = client.channels.cache.get(logChannelId);
            if (!logChannel) {
                console.error('Log channel not found.');
                return;
            }

            const embed = new MessageEmbed()
                .setTitle('Message Deleted')
                .addField('Author', `${message.author.tag} (ID: ${message.author.id})`)
                .addField('Content', message.content || 'No content')
                .setTimestamp();

            const urls = message.content.match(/https?:\/\/[^\s]+/g);
            if (urls) {
                embed.addField('URLs', urls.join('\n'));
            }

            logChannel.send({ embeds: [embed] });
        });
    });
};
