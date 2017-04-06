'use strict';

const amqplib = require('amqplib/callback_api');
const config = require('./config');
const SMTPServer = require('smtp-server').SMTPServer;
var toString = require('stream-to-string');
var messaggio = "";
var bufferConcat = require('buffer-concat');
var Iconv  = require('iconv').Iconv;
//devo creare anche qui il server SMTP come server.js

const server = new SMTPServer({

    // log to console
    logger: false,
	
    // not required but nice-to-have
    banner: 'Benvenuto nel magico mondo BUSNET SUPERMAGIC MAILING SOFTWARE PER FUORI',

    // disable STARTTLS to allow authentication in clear text mode
    disabledCommands: ['STARTTLS'],
	
    // Accept messages up to 50 MB. This is a soft limit
    size: config.publisher.messagesize * 1024 * 1024,

    // Setup authentication
    // Allow all usernames and passwords, no account checking
    onAuth(auth, session, callback) {
        return callback(null, {
            user: {
                username: auth.username
            }
        });
    },

    // Handle message stream
    onData(stream, session, callback) {
        console.log('Streaming message from user %s', session.user.username);
        console.log('------------------');
        //stream.pipe(process.stdout);
        
        
        var chunks =[];
		  stream.on('data', (chunk) => {
		     //chunks.push(chunk.toString());
		     chunks.push(chunk);
		     console.log(chunk);
		  });
		  
        		                
		        
        
        stream.on('end', () => {
            
            var iconv = new Iconv('latin1', 'UTF-8');
            
            console.log(''); // ensure linebreak after the message
            
            console.log(bufferConcat(chunks).toString());
            
            var str = iconv.convert(Buffer.concat(chunks)).toString();
            console.log(str);
            messaggio=str;
            
	        // Create connection to AMQP server
	        
	        //inizio infilamento in coda del messaggio
			amqplib.connect(config.amqp, (err, connection) => {
			    if (err) {
			        console.error(err.stack);
			        return process.exit(1);
			    }
			
			    // Create channel
			    connection.createChannel((err, channel) => {
			        if (err) {
			            console.error(err.stack);
			            return process.exit(1);
			        }
			
			        // Ensure queue for messages
			        channel.assertQueue(config.queue, {
			            // Ensure that the queue is not deleted when server restarts
			            durable: true
			        }, err => {
			            if (err) {
			                console.error(err.stack);
			                return process.exit(1);
			            }
			
			            // Create a function to send objects to the queue
			            // Javascript opbject is converted to JSON and the into a Buffer
			            let sender = (content, next) => {
			                let sent = channel.sendToQueue(config.queue, Buffer.from(JSON.stringify(content)), {
			                    // Store queued elements on disk
			                    persistent: true,
			                    contentType: 'application/json'
			                });
			                if (sent) {
			                    return next();
			                } else {
			                    channel.once('drain', () => next());
			                }
			            };
			
			            // push 100 messages to queue
			            let sent = 0;
			            let sendNext = () => {
			                if (sent >= 1) {
			                    console.log('All messages sent!');
			                    // Close connection to AMQP server
			                    // We need to call channel.close first, otherwise pending
			                    // messages are not written to the queue
			                    return channel.close(() => connection.close());
			                }
			                sent++;
			                
			               
			                
			                sender({
			                    payload: messaggio,
			                }, sendNext);
			            };
			
			            sendNext();
			
			        });
			    });
			});

        //fine infilamento in coda del messaggio

            
            
            
            callback(null, 'Message queued as ' + Date.now()); // accept the message once the stream is ended
        });
    }
});

server.on('error', err => {
    console.log('Error occurred');
    console.log(err);
});

// start listening
server.listen(config.publisher.port, config.publisher.host);






