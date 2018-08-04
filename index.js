const Discord = require('discord.js');
const CronJob = require('cron').CronJob;
const Config = require('./config');
const fs = require('fs');

async function updateDog(message) {
  const embed = new Discord.RichEmbed();
  const image = Config.images[Math.floor(Math.random() * 1E6 ) % Config.images.length];
  embed.setImage(image);
  return message.edit('Welcome to our server! Here is our code of conduct we expect all people to follow. Please check back occasionally for new and updated rules:', embed);
}

async function loop() {
  const client = new Discord.Client();

  client.on('ready', async () => {
    const id = client.user.id;
    console.log(`Logged in as ${client.user.tag}!`);
  
    const channels = Config.channels.map(channel => client.channels.get(channel));
  
    for (const channel of channels) {
      const messages = await channel.fetchMessages();
      const myMessages = messages.filter(message => message.author.id === id);
      if (myMessages.size === 0) {
        const sentMessage = await channel.send('Waiting for server rules...');
        await updateDog(sentMessage);
      } else {
        await updateDog(myMessages.last());
      }
    }

    console.log("update done, destroying client");
    client.destroy();
  });

  client.login(Config.token);
}

new CronJob({
  cronTime: '0 */4 * * *',
  //cronTime: '* * * * *',
  onTick: loop,
  start: true,
  runOnInit: true
});