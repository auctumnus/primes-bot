import 'dotenv/config'
import { REST, Routes, SlashCommandBuilder } from 'discord.js'

const commands = [
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('List commands for the primes bot'),
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check that the bot is up'),
  new SlashCommandBuilder()
    .setName('list')
    .setDescription('List all registered users'),
  new SlashCommandBuilder()
    .setName('group')
    .setDescription('Create a composite represenatation of a group of users')
    .addStringOption((option) =>
      option
        .setName('users')
        .setDescription('Comma-separated list of users.')
        .setRequired(true)
    ),
].map((command) => command.toJSON())

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN!)

rest
  .put(Routes.applicationCommands(process.env.APPLICATION_ID!), {
    body: commands,
  })
  .then(() => console.log('Registered slash commands!'))
  .catch(console.error)
