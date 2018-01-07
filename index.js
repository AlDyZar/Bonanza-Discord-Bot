/**
SETUP
**/
const Discord = require('discord.js');
const client = new Discord.Client();
const GoogleImages = require('google-images');
//Google search API Key and auth
const gclient = new GoogleImages(process.env.GoogleImages1, process.env.GoogleImages2);
const ytdl = require('ytdl-core');
//To make youtube player function for different servers
var servers = {};

/**
PLAY YOUTUBE VIDEO
**/
function play(connection, message){
	var server = servers[message.guild.id];

	//play stream
	server.dispatcher = connection.playStream(ytdl(server.queue[0], {quality: 'lowest', filter: 'audioonly'}), {volume: 0.25});

	//remove music from queue
	server.queue.shift();

	//if no more music queue, leave channel
	server.dispatcher.on("end", () => {
		if(server.queue[0]){ 
			play(connection, message);
		}else{
			connection.disconnect();
		}
	});
}

/**
	PAUSE STREAM
**/
function pause(message){
	var server = servers[message.guild.id];

	server.dispatcher.pause();
}

/**
CHECK EXTENSION WITH REGEX
**/
function checkURL(url) {
    return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}


client.on('ready', () => {
  console.log('I am ready!');
});


/**
COMMAND LIST
**/
client.on('message', message => {
  
  if (message.content === 'ping') {

    message.reply('pong');

  }else if(message.content.slice(0, 3) === '#s '){

  	/**
		Search image
  	**/
  	var searchStr = message.content.slice(3);
  	console.log("Search: " + searchStr);
  	gclient.search(searchStr)//, {page: 2})
    .then(images => {
    		console.log("length: " + images.length);
    		console.log();
    		var i = Math.floor(Math.random() * images.length);
    		console.log("index: " + i);
    		console.log(images[i].url);
    		if(checkURL(images[i].url)){
    			message.channel.send('', {file:images[i].url});
    		}
    		
    	});

  }else if(message.content.slice(0, 5) === '#s10 '){

  	/**
		Search image
  	**/
  	var searchStr = message.content.slice(5);
  	console.log("Search: " + searchStr);
  	gclient.search(searchStr)//, {page: 2})
    .then(images => {
    		console.log("length: " + images.length);
    		console.log();
    		for(var i = 0; i < images.length; i++){
    			console.log(images[i].url[images[i].url.length-6]);
    			if(images[i].url[images[i].url.length-6] === '.'){
    				message.channel.send('', {file:images[i].url});
    			}
    		}
    	});

  }else if(message.content === 'Play'){
  		
  		/**
			Play Local music file
  		**/
  		if (message.member.voiceChannel) {
  			var voiceChannel = message.member.voiceChannel;
      		message.member.voiceChannel.join()
        	.then(connection => { // Connection is an instance of VoiceConnection
          		const dispatcher = connection.playFile('ILoveLeague.mp3', {volume:0.25});
          		dispatcher.on("end", end => {
          			voiceChannel.leave();
          		});
        	}).catch(console.log);
    	} else {
      		message.reply('You need to join a voice channel first!');
    	}

  }else if(message.content === 'Leave'){
  		
  		/**
			Make bot leave channel
  		**/
  		if (message.member.voiceChannel) {
      		message.member.voiceChannel.leave();
    	} else {
      		message.reply('You need to join a voice channel first!');
    	}

  }else if(message.content.slice(0, 7) === 'PlayYt '){

  		/**
			Play youtube video in channel
  		**/
  		if(!message.member.voiceChannel) {
  			message.reply('You need to join a voice channel first!')
  		}else{

  			if(!servers[message.guild.id]){
  				servers[message.guild.id] = { queue: [] };
  			}
  			var server = servers[message.guild.id];
  			server.queue.push(message.content.slice(7));
  			var voiceChannel = message.member.voiceChannel;
      		message.member.voiceChannel.join()
        	.then(connection => {
        		play(connection, message);
        	});
  		}

  }else if(message.content === "skip"){
  		
  		var server = servers[message.guild.id];
  		if(server.dispatcher)server.dispatcher.end();

  }else if(message.content === "stop"){

  		var server = servers[message.guild.id];
  		if(message.guild.voiceConnection){
  			message.guild.voiceConnection.disconnect();
  		}

  }else if(message.content === "!lenny"){

  		message.channel.send('( ͡° ͜ʖ ͡°)');

  }else if(message.content === "pauseyt"){

  		pause(message);

  }

});

//Discord API Key Auth
client.login(process.env.DiscordBot);