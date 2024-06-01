const { Client, GatewayIntentBits, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionsBitField, ChannelType, EmbedBuilder, REST, Routes } = require('discord.js');
const { token, clientId, guildId, channelId, categoryId, roleIds } = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Chargement des commandes slashs...');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: [{ name: 'panel', description: 'Envoie le panel du bot.' }] },
        );

        console.log('Les commandes slashs on bien été charger !');
    } catch (error) {
        console.error(error);
    }
})();

client.once('ready', () => {
    console.log('----------------------------')
    console.log('BOT MADE BY B2B TEAM')
    console.log(`${client.user.tag} est connecter.`);
    console.log('----------------------------')
  });

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand() && !interaction.isButton()) return;

    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'panel') {
            const button = new ButtonBuilder()
                .setCustomId('open_channel')
                .setLabel('Ouvre un ticket.')
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder().addComponents(button);

            const panelembed = new EmbedBuilder()
            .setTitle('Ticket')
            .setDescription('Si vous souhaitez nous contacter merci d\'ouvrir un ticket avec le bouton ci-dessous.')

            await interaction.reply({ embeds: [panelembed], components: [row] });
        }
    } else if (interaction.isButton()) {
        if (interaction.customId === 'open_channel') {
            const newChannel = await interaction.guild.channels.create({
                name: `${interaction.user.username}`,
                type: ChannelType.GuildText,
                parent: categoryId,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                    },
                    ...roleIds.map(roleId => ({
                        id: roleId,
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                    })),
                ],
            });

            const deleteButton = new ButtonBuilder()
                .setCustomId('close_ticket')
                .setLabel('Ferme le ticket.')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder().addComponents(deleteButton);

            const embed = new EmbedBuilder()
                .setColor(0x000000)
                .setTitle('Ticket Ouvert !')
                .setDescription('Cliquez sur le bouton ci dessous pour fermer le ticket.');

            await newChannel.send({ embeds: [embed], components: [row] });

            await interaction.reply({ content: `Ticket créer: ${newChannel}`, ephemeral: true });
        } else if (interaction.customId === 'close_ticket') {
            await interaction.channel.delete();
        }
    }
});

client.login(token);