const Discord = require('./discord.js/');
const CronJob = require('cron').CronJob;
const Config = require('./config');
const fs = require('fs');
const sharp = require('sharp');

async function updateDog(message) {
  const embed = new Discord.MessageEmbed();
  const image = Config.images[Math.floor(Math.random() * 1E6 ) % Config.images.length];
  embed.setImage(Config.basePath + image);

  const inset = await sharp(image).resize({width: 960, height: 540, fit: 'inside'}).toBuffer();

  const newBannerBuffer = await sharp(image)
    .resize({width: 960, height: 540, fit: 'cover'})
    .blur(10)
    .composite([{input: inset}])
    .png()
    .toBuffer();

  const ret = await message.guild.setBanner(newBannerBuffer);

  return message.edit('Welcome to our server! Here is our code of conduct we expect all people to follow. Please check back occasionally for new and updated rules:', embed);
}

async function loop() {
  const client = new Discord.Client();

  client.on('ready', async () => {
    const id = client.user.id;
    const channels = Config.channels.map(channel => client.channels.get(channel));
  
    for (const channel of channels) {
      const messages = await channel.messages.fetch();
      const myMessages = messages.filter(message => message.author.id === id);
      if (myMessages.size === 0) {
        const sentMessage = await channel.send('Waiting for server rules...');
        await updateDog(sentMessage);
      } else {
        await updateDog(myMessages.last());
      }
    }

    client.destroy();
  });

  client.login(Config.token);
}

new CronJob({
  cronTime: '0 */2 * * *',
  //cronTime: '* * * * *',
  onTick: loop,
  start: true,
  runOnInit: true
});
