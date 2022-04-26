import TelegramBot  from 'node-telegram-bot-api';
import fs from 'fs';
import request from 'request';
import { generateMainImage } from './canvas.js';
// replace the value below with the Telegram token you receive from @BotFather
const token = '1223786680:AAGATKydiyH71733u4PtqtpXZYW6UUA6INU';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

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
 if(fs.existsSync('./img/'+msg.from.username+'.jpg')) {

  let canva = await generateMainImage(msg, resp, msg.from.first_name, '😎');
  if(canva){
        // send back the matched "whatever" to the chat
    // bot.sendMessage(chatId, 'Received your message: '+msg.from.first_name );
    const fileOptions = {
      // Explicitly specify the file name.
      filename: "telegrampic"+chatId+".png",
      // Explicitly specify the MIME type.
      contentType: 'application/octet-stream',
    };
    bot.sendPhoto(chatId, "telegrampic"+chatId+".png", {caption:'Aqui esta tu captura!!!'}, fileOptions);
  }
    }else{

  var user_profile = bot.getUserProfilePhotos(msg.from.id);
        user_profile.then(async function (res) {
            var file_id = res.photos[0][0].file_id;
            var file = bot.getFile(file_id);
            file.then(async function (result) {
                var file_path = result.file_path;
                const photo_url = `https://api.telegram.org/file/bot${token}/${file_path}`
                
                await download(photo_url, './img/'+msg.from.username+'.jpg', async function(){
                  console.log('done');
                });
                console.log('done');
                if(photo_url != ''){

                  let canva = await generateMainImage(msg, resp, msg.from.first_name, '😎');
                  if(canva){
                        // send back the matched "whatever" to the chat
                    // bot.sendMessage(chatId, 'Received your message: '+msg.from.first_name );
                    const fileOptions = {
                      // Explicitly specify the file name.
                      filename: "telegrampic"+chatId+".png",
                      // Explicitly specify the MIME type.
                      contentType: 'application/octet-stream',
                    };
                    bot.sendPhoto(chatId, "telegrampic"+chatId+".png", {caption:'Aqui esta tu captura!!!'}, fileOptions);
                  }
                }else{
                  bot.sendMessage(chatId, 'error');
                }
             });
         });
        }
     
        });
        
        var download = async function(uri, filename, callback){
         request.head(uri, async function(err, res, body){
           console.log('content-type:', res.headers['content-type']);
           console.log('content-length:', res.headers['content-length']);
       
           request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
         });
       };
