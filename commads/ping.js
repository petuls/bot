const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong! and measures the response time.'),
    async execute(interaction) {
        const sent = await interaction.reply({ content: 'Pong!', fetchReply: true });
        const timeTaken = sent.createdTimestamp - interaction.createdTimestamp;
        await interaction.editReply(`Pong! This message had a latency of ${timeTaken}ms.`);
    },
};
