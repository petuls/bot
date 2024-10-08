const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'ban',
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a user from the server.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user to ban')
                .setRequired(true)),
    description: "Bans a user from the server.",
    category: "Moderation",
    async execute(interaction) {
        if (interaction.user.bot) {
            return;
        }

        const target = interaction.options.getUser('target');
        const member = interaction.guild.members.cache.get(target.id);
        const botMember = interaction.guild.members.cache.get(interaction.client.user.id);

        if (!interaction.member.permissions.has('BAN_MEMBERS')) {
            return interaction.reply('You do not have permission to ban members.');
        }

        if (!botMember.permissions.has('BAN_MEMBERS')) {
            return interaction.reply('I do not have permission to ban members.');
        }

        if (member) {
            await member.ban();
            await interaction.reply(`${target.tag} has been banned.`);
        } else {
            await interaction.reply('That user is not in the server.');
        }
    },
    info: {
        name: 'ban',
        description: 'Bans a user from the server.',
        usage: '/ban <user>'
    }
};
