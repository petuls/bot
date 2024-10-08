const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Displays the user\'s profile information.'),
    name: 'profile',
    description: 'Displays the user\'s profile information.',
    category: 'Misc',
    async execute(interaction) {
        const user = interaction.user;
        const member = await interaction.guild.members.fetch(user.id);

        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'s Profile`)
            .setDescription('Here is your profile information.')
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setColor(member.displayHexColor);

        if (user.banner) {
            embed.setImage(user.bannerURL({ dynamic: true, size: 1024 }));
        }

        embed.addFields(
            { name: 'Username', value: user.username, inline: true },
            { name: 'ID', value: user.id, inline: true },
            { name: 'Joined Server', value: new Date(member.joinedTimestamp).toLocaleDateString(), inline: true },
            { name: 'Account Created', value: new Date(user.createdTimestamp).toLocaleDateString(), inline: true }
        );

        interaction.reply({ embeds: [embed], ephemeral: true }).catch(console.error);
    },
    info: {
        name: 'profile',
        description: 'Displays the user\'s profile information.',
        usage: '/profile'
    }
};
