import canvas, { GlobalFonts, createCanvas, Image} from '@napi-rs/canvas' // For canvas.
import fs from 'fs' // For creating files for our images.
import cwebp from 'cwebp' // For converting our images to webp.
import request from 'request';
// Load in the fonts we need
GlobalFonts.registerFromPath('./fonts/Inter-ExtraBold.ttf', 'InterBold');
GlobalFonts.registerFromPath('./fonts/Inter-Medium.ttf','InterMedium');
GlobalFonts.registerFromPath('./fonts/AppleColorEmoji.ttf', 'AppleColorEmoji');




// This function accepts 6 arguments:
// - ctx: the context for the canvas
// - text: the text we wish to wrap
// - x: the starting x position of the text
// - y: the starting y position of the text
// - maxWidth: the maximum width, i.e., the width of the container
// - lineHeight: the height of one line (as defined by us)
const wrapText = async function(ctx, text, x, y, maxWidth, lineHeight) {
    // First, split the words by spaces
    let words = text.split(' ');
    // Then we'll make a few variables to store info about our line
    let line = '';
    let testLine = '';
    // wordArray is what we'l' return, which will hold info on 
    // the line text, along with its x and y starting position
    let wordArray = [];
    // totalLineHeight will hold info on the line height
    let totalLineHeight = 0;

    // Next we iterate over each word
    for(var n = 0; n < words.length; n++) {
        // And test out its length
        testLine += `${words[n]} `;
        var metrics = ctx.measureText(testLine);
        var testWidth = metrics.width;
        // If it's too long, then we start a new line
        if (testWidth > maxWidth && n > 0) {
            wordArray.push([line, x, y]);
            y += lineHeight;
            totalLineHeight += lineHeight;
            line = `${words[n]} `;
            testLine = `${words[n]} `;
        }
        else {
            // Otherwise we only have one line!
            line += `${words[n]} `;
        }
        // Whenever all the words are done, we push whatever is left
        if(n === words.length - 1) {
            wordArray.push([line, x, y]);
        }
    }

    // And return the words in array, along with the total line height
    // which will be (totalLines - 1) * lineHeight
    return [ wordArray, totalLineHeight ];
}






// This functiona accepts 5 arguments:
// canonicalName: this is the name we'll use to save our image
// gradientColors: an array of two colors, i.e. [ '#ffffff', '#000000' ], used for our gradient
// userName: the title of the article or site you want to appear in the image
// userArroba: the category which that article sits in - or the subtext of the article
// emoji: the emoji you want to appear in the image.
//msg, includes.users[0].username,includes.users[0].name,data.text, '😎'
const generateMainImage = async function(msg, userArroba, userName, text, fecha,emoji) {

    

    const canonicalName = 'telegrampic'+msg.chat.id;
    userArroba = userArroba;
    // gradientColors is an array [ c1, c2 ]
    
    // const gradientColors = [ "#8005fc", "#073bae"]; // Backup values
    

    // Create canvas
    // const canvas = createCanvas(1342, 853);

    const canvas = createCanvas(1000, 1000);
    const ctx = canvas.getContext('2d')

    // // Add gradient - we use createLinearGradient to do this
    // let grd = ctx.createLinearGradient(0, 1000, 1000, 0);
    // grd.addColorStop(0, gradientColors[0]);
    // grd.addColorStop(1, gradientColors[1]);
    // ctx.fillStyle = grd;
    // // Fill our gradient
    // ctx.fillRect(0, 0, 1000, 1000);

   
    //Create a new Image object.
    let path = './img/'+userArroba+'.jpg';
    var img = new Image(); // Create a new Image
    let data = fs.readFileSync(path);
    img.src = data;
    await blur(img, ctx, 4);
    // ctx.save();
    // var img = new Image();
    // img.onload = function() {
    //     ctx.drawImage(img, 0, 0);
    // };
    // img.src = photo_url;
    // ctx.restore();
    // ctx.drawImage(img, 0, 0, 1000, 1000 );

    //blur image
    // ctx.fillStyle = 'white';
    // ctx.globalAlpha = 0.3;
    // ctx.fillRect(0, 0, 1000, 1000);
    // ctx.globalAlpha = 1;
    //blur rounded box
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'black';
    ctx.globalAlpha = 0.7;
    
    // ctx.fillRect(40, 250, 920, 500);
    await roundRect(ctx, 40, 250, 920, 500, 20, true);
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.beginPath();
    ctx.arc(130, 340, 65, 0, Math.PI * 2, false);
    ctx.stroke();
    ctx.clip();
    ctx.imageSmoothingEnabled = false;
    // Draw the image at imageX, imageY.
    ctx.drawImage(img, 55, 275, 150, 150 );
    ctx.restore();
    
    //Create a new Image object.
    let uri = './img/twitter.png';
    var img = new Image(); // Create a new Image
    let logo = fs.readFileSync(uri);
    img.src = logo;
    ctx.imageSmoothingEnabled = false;
    // Draw the image at imageX, imageY.
    ctx.drawImage(img, 795, 285, 124, 74 );
  
    ctx.fillStyle = 'white';
    ctx.globalAlpha = 0.5;
    
    ctx.fillRect(60, 420, 870, 2);
    ctx.globalAlpha = 1;
 

    // Add our title text
    ctx.font = '40px InterBold';
    ctx.fillStyle = 'white';
    let wrappedText = await wrapText(ctx, text, 85, 785, 910, 50);
    wrappedText[0].forEach(function(item) {
        // We will fill our text which is item[0] of our array, at coordinates [x, y]
        // x will be item[1] of our array
        // y will be item[2] of our array, minus the line height (wrappedText[1]), minus the height of the emoji (200px)
        ctx.fillText(item[0], item[1], item[2] - wrappedText[1] - 200); // 200 is height of an emoji
    })

    // Add our category text to the canvas 
    ctx.font = '40px InterMedium';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText(userName, 215, 350 ); // 853 - 200 for emoji, -100 for line height of 1
    // Add our category text to the canvas 
    ctx.font = '20px InterMedium';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText('@'+userArroba, 215,375); // 853 - 200 for emoji, -100 for line height of 1
    
    ctx.font = '20px InterMedium';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText('@serendipiaBot', 790, 735); // 853 - 200 for emoji, -100 for line height of 1
    ctx.font = '20px InterMedium';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText(fecha, 75, 735); // 853 - 200 for emoji, -100 for line height of 1

        // Set canvas as to png
        try {
            const canvasData = await canvas.encode('png');
            // Save file
            fs.writeFileSync(`${canonicalName}.png`, canvasData);
            
            return true;
        }
        catch(e) {
            console.log(e);
            return 'Could not create png image this time.'
        }
        try {
            const encoder = new cwebp.CWebp(path.join(__dirname, '../', `${canonicalName}.png`));
            encoder.quality(30);
            await encoder.write(`${canonicalName}.webp`, function(err) {
                if(err) console.log(err);
            });
        }
        catch(e) {
            console.log(e);
            return 'Could not create webp image this time.'
        }
    
        return 'Images have been successfully created!';
    
}
/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} [radius = 5] The corner radius; It can also be an object 
 *                 to specify different radii for corners
 * @param {Number} [radius.tl = 0] Top left
 * @param {Number} [radius.tr = 0] Top right
 * @param {Number} [radius.br = 0] Bottom right
 * @param {Number} [radius.bl = 0] Bottom left
 * @param {Boolean} [fill = false] Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
 */
 const roundRect = async function(ctx, x, y, width, height, radius, fill, stroke) {

    if (typeof stroke === 'undefined') {
      stroke = true;
    }
    if (typeof radius === 'undefined') {
      radius = 5;
    }
    if (typeof radius === 'number') {
      radius = {tl: radius, tr: radius, br: radius, bl: radius};
    } else {
      var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
      for (var side in defaultRadius) {
        radius[side] = radius[side] || defaultRadius[side];
      }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
      ctx.fill();
    }
    if (stroke) {
      ctx.stroke();
    }
  
  }


  const blur = async function(imageObj, context, passes) {
    var i, x, y;
    passes = passes || 4;
    context.globalAlpha = 0.08;
    // Loop for each blur pass.
    for (i = 1; i <= passes; i++) {
      for (y = -10; y < 10; y++) {
        for (x = -10; x < 10; x++) {
            context.imageSmoothingEnabled = false;
            context.drawImage(imageObj, x, y, 1000, 1000);
        }
      }
    }
    context.globalAlpha = 1.0;
  }
export { generateMainImage }