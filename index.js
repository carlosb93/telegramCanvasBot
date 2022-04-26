import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs';
// import axios from 'axios';
import request from 'request';
import { generateMainImage } from './canvas.js';
import { resolve } from 'path';
import { rejects } from 'assert';
// replace the value below with the Telegram token you receive from @BotFather
const token = '5302521021:AAFhvdWx-J5VbjFC_iszGl-5uU1_GeZLONw';
const bearer = 'AAAAAAAAAAAAAAAAAAAAAKCvbwEAAAAAWAXqdQe8tB6Z5NZNNRvE7PoQLek%3DmZOym4b8qIggKLoO0NXN9XXSG4V92dipeoqfS9g3itQnj3cNB7';
//curl "https://api.twitter.com/2/tweets/{id}?expansions=author_id,referenced_tweets.id,in_reply_to_user_id,geo.place_id,attachments.media_keys,attachments.poll_ids,entities.mentions.username,referenced_tweets.id.author_id&tweet.fields=id,created_at,text,author_id,in_reply_to_user_id,referenced_tweets,attachments,withheld,geo,entities,public_metrics,possibly_sensitive,source,lang,context_annotations,conversation_id,reply_settings&user.fields=id,created_at,name,username,protected,verified,withheld,profile_image_url,location,url,description,entities,pinned_tweet_id,public_metrics&media.fields=media_key,duration_ms,height,preview_image_url,type,url,width,public_metrics,alt_text&place.fields=id,name,country_code,place_type,full_name,country,contained_within,geo&poll.fields=id,options,voting_status,end_datetime,duration_minutes" -H "Authorization: Bearer $BEARER_TOKEN"
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

bot.on("polling_error", console.log);

bot.onText(/\/start/, (msg) => {

  bot.sendMessage(msg.chat.id, "Welcome");

});

// Matches "/sendpic [whatever]"
bot.onText(/\/sendpic (.+)/, async (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message
  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"
  console.log(resp);
  if (fs.existsSync('./img/' + msg.from.username + '.jpg')) {

    let canva = await generateMainImage(msg, resp, msg.from.first_name, '😎');
    if (canva) {
      // send back the matched "whatever" to the chat
      // bot.sendMessage(chatId, 'Received your message: '+msg.from.first_name );
      const fileOptions = {
        // Explicitly specify the file name.
        filename: "telegrampic" + chatId + ".png",
        // Explicitly specify the MIME type.
        contentType: 'application/octet-stream',
      };
      bot.sendPhoto(chatId, "telegrampic" + chatId + ".png", { caption: 'Aqui esta tu captura!!!' }, fileOptions);
    }
  } else {

    var user_profile = bot.getUserProfilePhotos(msg.from.id);
    user_profile.then(async function (res) {
      var file_id = res.photos[0][0].file_id;
      var file = bot.getFile(file_id);
      file.then(async function (result) {
        var file_path = result.file_path;
        const photo_url = `https://api.telegram.org/file/bot${token}/${file_path}`

        await download(photo_url, './img/' + msg.from.username + '.jpg', async function () {
          console.log('done');
        });
        console.log('done');
        if (photo_url != '') {

          let canva = await generateMainImage(msg, resp, msg.from.first_name, '😎');
          if (canva) {
            // send back the matched "whatever" to the chat
            // bot.sendMessage(chatId, 'Received your message: '+msg.from.first_name );
            const fileOptions = {
              // Explicitly specify the file name.
              filename: "telegrampic" + chatId + ".png",
              // Explicitly specify the MIME type.
              contentType: 'application/octet-stream',
            };
            bot.sendPhoto(chatId, "telegrampic" + chatId + ".png", { caption: 'Aqui esta tu captura!!!' }, fileOptions);
          }
        } else {
          bot.sendMessage(chatId, 'error');
        }
      });
    });
  }

});





bot.onText(/http(?:s)?:\/\/(?:www\.)?twitter\.com\/([a-zA-Z0-9_]+)\/([a-zA-Z0-9_]+)\/([a-zA-Z0-9_]+)/, async (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  

  const chatId = msg.chat.id;
  const resp = match[3]; // the captured "whatever"

  let {includes,data} = await axioma64(resp);
  
  console.log(data.text);
  console.log(data.created_at.split('T')[0]);
  console.log(includes.users[0].username);
  console.log(includes.users[0].name);
  console.log(includes.users[0].profile_image_url);

  
  if (fs.existsSync('./img/' + includes.users[0].username + '.jpg')) {

    let canva = await generateMainImage(msg, includes.users[0].username,includes.users[0].name,data.text, data.created_at.split('T')[0], '😎');
    if (canva) {
      // send back the matched "whatever" to the chat
      // bot.sendMessage(chatId, 'Received your message: '+msg.from.first_name );
      const fileOptions = {
        // Explicitly specify the file name.
        filename: "telegrampic" + chatId + ".png",
        // Explicitly specify the MIME type.
        contentType: 'application/octet-stream',
      };
      bot.sendPhoto(chatId, "telegrampic" + chatId + ".png", { caption: 'Aqui esta tu captura!!!' }, fileOptions);
    }
  } else {

        const photo_url = includes.users[0].profile_image_url

        await download(photo_url, './img/' + includes.users[0].username + '.jpg', async function () {
          console.log('done');
          if (photo_url != '') {

            let canva = await generateMainImage(msg, includes.users[0].username,includes.users[0].name,data.text,data.created_at.split('T')[0], '😎');
            if (canva) {
              // send back the matched "whatever" to the chat
              // bot.sendMessage(chatId, 'Received your message: '+msg.from.first_name );
              const fileOptions = {
                // Explicitly specify the file name.
                filename: "telegrampic" + chatId + ".png",
                // Explicitly specify the MIME type.
                contentType: 'application/octet-stream',
              };
              bot.sendPhoto(chatId, "telegrampic" + chatId + ".png", { caption: 'Aqui esta tu captura!!!' }, fileOptions);
            }
          } else {
            bot.sendMessage(chatId, 'error');
          }
        });
        
  
   
  }

});

var download = async function (uri, filename, callback) {
  request.head(uri, async function (err, res, body) {
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);

    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};




function axioma64(id) {

  var options = {
    url: `https://api.twitter.com/2/tweets/${id}?expansions=author_id,referenced_tweets.id,in_reply_to_user_id,geo.place_id,attachments.media_keys,attachments.poll_ids,entities.mentions.username,referenced_tweets.id.author_id&tweet.fields=id,created_at,text,author_id,in_reply_to_user_id,referenced_tweets,attachments,withheld,geo,entities,public_metrics,possibly_sensitive,source,lang,context_annotations,conversation_id,reply_settings&user.fields=id,created_at,name,username,protected,verified,withheld,profile_image_url,location,url,description,entities,pinned_tweet_id,public_metrics&media.fields=media_key,duration_ms,height,preview_image_url,type,url,width,public_metrics,alt_text&place.fields=id,name,country_code,place_type,full_name,country,contained_within,geo&poll.fields=id,options,voting_status,end_datetime,duration_minutes`,
    headers: {'Authorization': `Bearer ${bearer}`}
  };

  return new Promise((resolve, reject) =>{
    request(options, function (err, res, body) {
      let json = JSON.parse(body);
      console.log(json);
      resolve(json);
    });
  }); 

}