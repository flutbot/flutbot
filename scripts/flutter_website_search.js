// Description:
//   Flutter.io search
//
// Configuration:
//   HUBOT_GOOGLE_API_KEY - Obtained from https://console.developers.google.com
//   HUBOT_FLUTTER_CX - flutter.io custom search engine identifier
//
// Commands:
//   hubot docs <query> - Searches flutter.io for the query and returns the results.

googleApiKey = process.env.HUBOT_GOOGLE_API_KEY;
if (!googleApiKey) {
  console.log("Missing HUBOT_GOOGLE_API_KEY in environment: please set and try again.");
  process.exit(1);
}

flutterCx = process.env.HUBOT_FLUTTER_CX;
if (!flutterCx) {
    console.log('Missing HUBOT_FLUTTER_CX in environment: please set and try again.');
    process.exit(1);
}

module.exports = function(robot) {
    let resType = "respond";
    let trigger = /(?:docs) (.*)/i;
    
    return robot[resType](trigger, function(msg) {
      const query = msg.match[1];
    
      robot.logger.debug(`Query: ${query}\n`);
      robot.logger.debug(`key: ${googleApiKey}\ncx: ${flutterCx}\n`);
      
      return robot.http(`https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${flutterCx}`)
        .query({
          q: query,
        })
        .get()(function(err, res, body) {
          let error, results;
          robot.logger.debug(body);
          if (err) {
            robot.logger.error(err);
            return robot.emit('error', err, msg);
          }
          try {
            if (res.statusCode === 200) {
              results = JSON.parse(body);
              robot.logger.debug(`results: ${JSON.stringify(results)}`);
            } else {
              return robot.emit('error', `${res.statusCode}: ${body}`, msg);
            }
          } catch (error1) {
            error = error1;
            robot.logger.error(error);
            return msg.reply(`Error! ${body}`);
          }
          if (results.error) {
            robot.logger.error(results.error);
            return msg.reply(`Error! ${JSON.stringify(results.error)}`);
          }
          results = results.items;
          if ((results == null) || !(results.length > 0)) {
            return msg.reply(`No results for \"${query}\"`);
          }
          const reply = [];
          for (item of results) {
              robot.logger.debug(JSON.stringify(item));
              reply.push(`[${item.title}](${item.link})`);
          }
          return msg.reply(reply.join('\n'));
      });
    });
  };
  