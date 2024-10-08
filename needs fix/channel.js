const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'setLogChannel',
    description: 'Sets the log channel for deleted messages',
    async execute(message, args) {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('You do not have permission to use this command.');
        }

        const channelId = args[0];
        const channel = await message.client.channels.fetch(channelId);
        if (!channel) {
            return message.reply('Invalid channel ID.');
        }

        const configPath = path.join(__dirname, 'config.json');
        let config = { logChannelId: null };

        if (fs.existsSync(configPath)) {
            config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        }

        config.logChannelId = channelId;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        message.reply(`Log channel set to ${channel.name}`);
    },
};
