const express = require('express');
const path = require('path');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use('/', (req, res) =>{
  res.render('index.html');
});

let messages = [];

io.on('connection', (socket) =>{
	socket.emit('previousMessages', messages);
  socket.on('sendAudio', audio =>{
	  //Implementar a tradução do audio em string
    //Tenho o audio aqui falta fazer o calculo... é so chamar os métodos e normalizar o 'audio'
	  messages.push(audio);
	  socket.broadcast.emit("receivedMessage", audio)
   });
});

server.listen(3000);
