import {
  ChatInputCommandInteraction,
  Client,
  GatewayIntentBits,
} from 'discord.js'
import { TOKEN } from './env'
import { db } from './db'

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

client.once('ready', () => {
  console.log(
    `logged in as ${client.user?.username}#${client.user?.discriminator}`
  )
})

const cmds: Record<
  string,
  (interaction: ChatInputCommandInteraction) => Promise<any>
> = {
  help: async (interaction) => {
    await interaction.reply(
      `Known commands:\n` +
        ' - `help`: Lists the commands that this bot accepts.\n' +
        ' - `ping`: Replies with "hello!" if the bot is up.\n' +
        ' - `list`: List known users.\n'
    )
  },
  ping: async (interaction) => {
    await interaction.reply(`hello!`)
  },
  list: async (interaction) => {
    await interaction.reply(
      'Known users:\n' +
        Object.entries(db)
          .map(([name, user]) => {
            return ` - \`${name}\` (prime **${user.prime}**, placement **${user.placement}**)`
          })
          .join('\n')
    )
  },
  group: async (interaction) => {
    const list = interaction.options.getString('users')
    if (!list || typeof list !== 'string') {
      await interaction.reply('Invalid list of users!')
      return
    }
    const userNames =
      list.split(',').map((s) => s.trim())
      .reduce((a, v) => {
        if(!a.includes(v)) {
          a.push(v)
        }
        return a
      }, [] as string[])
    const notFound = userNames.filter((s) => !db.hasOwnProperty(s))
    const users = userNames.map((s) => db[s]).filter((v) => v)

    if (!(notFound.length || users.length)) {
      await interaction.reply('No users specified!')
      return
    }

    const groupNames = userNames.map((s) => `\`${s}\``).join(', ')

    if (users.length === 1) {
      const user = users[0]
      await interaction.reply(
        `User \`${user.name}\` has the prime **${user.prime}** and the placement **${user.placement}**.`
      )
      return
    }

    if (!users.length) {
      if (notFound.length > 1) {
        await interaction.reply(
          `I don't know any of those users (${groupNames}).`
        )
      } else {
        await interaction.reply(`I don't know the user \`${notFound[0]}\`.`)
      }
      return
    }

    const couldntFind =
      `I couldn't find the following user` +
      (notFound.length > 1 ? 's: ' : ': ') +
      notFound.map((s) => `\`${s}\``).join(', ')
    const groupComposite = users.reduce((a, v) => a * v.prime, 1)
    const groupBinary = users.reduce((a, v) => a + 2 ** v.placement, 0)

    const groupText =
      ` - Product of primes: **${groupComposite}**\n` +
      ` - Binary: **${groupBinary.toString(2)}**\n` +
      ` - Hex: **${groupBinary.toString(16)}**`
    const response = notFound.length
      ? couldntFind +
        `, but the representation of the group ${groupNames} is:\n` +
        groupText
      : `The representation of the group ${groupNames} is:\n` + groupText
    await interaction.reply(response)
  },
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return

  const { commandName } = interaction
  await cmds[commandName](interaction)
})

client.login(TOKEN)

const goInvisible = () => {
  client.user?.setStatus('invisible')
}

process.on('exit', () => {
  goInvisible()
  process.exit()
})
process.on('SIGINT', () => {
  goInvisible()
  process.exit()
})
