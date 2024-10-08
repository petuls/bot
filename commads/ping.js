const { SlashCommandBuilder } = require('@discordjs/builders');
const { description } = require('./kick');

module.exports = {
    name: 'ping',
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong! and measures the response time.'),
    description: "Replies with Pong! and measures the response time.",
    async execute(interaction) {
        const sent = await interaction.reply({ content: 'Pong!', fetchReply: true });
        const timeTaken = sent.createdTimestamp - interaction.createdTimestamp;
        await interaction.editReply(`Pong! ${timeTaken}ms`);
    },
    info: {
        name: 'ping',
        description: 'Replies with Pong! and measures the response time.',
        usage: '/ping'
    }
};
