const axios = require("axios");
const cheerio = require("cheerio");
const { setIntervalAsync, clearIntervalAsync } = require('set-interval-async');
const Slimbot = require('slimbot');
if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}

// URL of the web page you want to scrape
//const url = "https://t.me/s/kpszsu"; // Replace with the actual URL
const url = "https://t.me/s/a1temtestchannel";
const wordToSearch = 'Львів';
const slimbot = new Slimbot('6620812176:AAEUYAsdxI5lTblmxPlCSO-i4Jam2T37uIo');

// Function to fetch and scrape data
async function scrapeData() {
  let results = [];
  try {

    // Fetch the HTML content of the web page
    const response = await axios.get(url);

    // Load the HTML content into cheerio
    const $ = cheerio.load(response.data);

    // Replace '.your-special-class' with the actual class name you want to target
    const specialDivs = $(".tgme_widget_message_wrap");

    // Iterate over the selected div elements and extract data
    specialDivs.each((index, element) => {
      const message = $(element); // Extract text content from the div
      const postId = message.find(".tgme_widget_message").attr("data-post");
      const text = $(message.find(".tgme_widget_message_text")[0]).text();
      const date = $(message.find(".time")[0]).attr("datetime");

      // Convert the date to a JavaScript Date object
      const messageDate = new Date(date);

      results.push({
        text,
        date: messageDate,
        postId
      });

    });

    const message = results.reverse().find(element => element.text.toLowerCase().includes(wordToSearch.toLowerCase()));

    if (message && message.postId != localStorage.getItem("postId")) {
        console.log('New message sent');
        console.log(message.text);
        try {
            slimbot.sendMessage('-1001667070239', `[${message.date.toLocaleTimeString('uk-UA')}] ${message.text}`);

            localStorage.setItem(
                "postId",
                    message.postId
                );
        } catch (error) {
            console.error("Error:", error);
        }
    } {
        console.log('No new messages');
    }

  } catch (error) {
    console.error("Error:", error);
  }
}

setIntervalAsync(scrapeData, 5000);