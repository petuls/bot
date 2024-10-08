const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'unban',
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unbans a user from the server.')
        .addStringOption(option => 
            option.setName('userid')
                .setDescription('The ID of the user to unban')
                .setRequired(true)),
    description: "Unbans a user from the server.",
    category: "Moderation",
    async execute(interaction) {
        if (interaction.user.bot) {
            return;
        }

        const userId = interaction.options.getString('userid');
        const botMember = interaction.guild.members.cache.get(interaction.client.user.id);

        if (!interaction.member.permissions.has('BAN_MEMBERS')) {
            return interaction.reply('You do not have permission to unban members.');
        }

        if (!botMember.permissions.has('BAN_MEMBERS')) {
            return interaction.reply('I do not have permission to unban members.');
        }

        try {
            await interaction.guild.members.unban(userId);
            await interaction.reply(`User with ID ${userId} has been unbanned.`);
        } catch (error) {
            await interaction.reply('That user is not banned or an error occurred.');
        }
    },
    info: {
        name: 'unban',
        description: 'Unbans a user from the server.',
        usage: '/unban <userid>'
    }
};
