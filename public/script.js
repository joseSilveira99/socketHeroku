var client;
window.addEventListener('DOMContentLoaded', function(){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", 'https://api.ipify.org?format=json');
    xmlhttp.send();
    xmlhttp.onload = function(e) {
    client = JSON.parse(xmlhttp.response);

    console.log(client);
    }
    var btnGravar = document.querySelector('#gravar');
    var resultadoVoice;
    
    var audio = '';
    var esta_gravando = false;

    if(window.SpeechRecognition || window.webkitSpeechRecognition){
      
        var speech_api = window.SpeechRecognition || window.webkitSpeechRecognition;
        var recebe_audio = new speech_api();

        recebe_audio.continuous = true;
        recebe_audio.interimResults = true;
        recebe_audio.lang = "pt-BR";

        recebe_audio.onstart = function(){
            esta_gravando = true;
            btnGravar.innerHTML = 'Parar Gravação';
        };
        recebe_audio.onend = function(){
            esta_gravando = false;
            btnGravar.innerHTML = 'Iniciar Gravação';
            $('input[name=message]').val(resultadoVoice);
            console.log('Broadcast call');
            broadcast(client);
        };
        recebe_audio.onresult = function(event){
            var interim_transcript = '';

            for(var i = event.resultIndex; i < event.results.length; i++){
                if(event.results[i].isFinal){
                    audio += event.results[i][0].transcript;
                }else{
                    interim_transcript += event.results[i][0].transcript;
                }
                resultadoVoice = audio || interim_transcript;    
                //console.log(resultadoVoice);
            }
        };

        btnGravar.addEventListener('click', function(e){
            if (esta_gravando) {
                recebe_audio.stop();
                return;
            }
                recebe_audio.start();
        }, false);

    }else{
        alert('nao suporta a API SpeechRecognition');
    }

}, false);

function normalizeOperador(operador){
    if (operador == 'dividir' || operador == '/') {
       return '/'; 

     } else if(operador == 'somar' || operador == 'mais' || operador == '+'){
      return '+';

     } else if(operador == 'subtrair' || operador == 'diminuir' || operador == 'menos' || operador == '-'){
      return '-';

     } else if(operador == 'subtrair' || operador == 'vezes' || operador == '*'){
      return '*';
     }
  }

function calcular(exp) {
      var expressaoArray = exp.split(' ');
      var primeiroValor = parseInt(expressaoArray[0]);
      var operador = normalizeOperador(expressaoArray[1]);//Fazer método para normalizar o operador
      var segundoValor = parseInt(expressaoArray[2]);

      if(!isNaN(primeiroValor) && !isNaN(segundoValor)){//Garante que foram informados números
          if(operador == '+'){
            return primeiroValor + segundoValor;
          } else if(operador == '-'){
            return primeiroValor - segundoValor;
          } else if(operador == '*'){
            return primeiroValor * segundoValor;
          } else if(operador == '/'){
            return primeiroValor / segundoValor;
          } else {            
            return 'Erro matemático';
          }
      }else {
        return 'Não foi informado números';
      }
}

var socket = io(window.location.host);

      function renderMessage(message){
          if(message.author.ip == client){
            $('.messages').append('<div class="message"><strong style="color: rgb(30, 79, 177)">'+ message.author +'</strong>: '+ message.message +'</div>');
          }else {
            $('.messages').append('<div class="message"><strong style="color: green">'+ message.author +'</strong>: '+ message.message +'</div>');
          }
      }
      socket.on('previousMessages', function(messages){//Mensagens que foram emitidas para todos no socket
        for(message of messages){
          renderMessage(message);
        }
      });
      socket.on('receivedMessage', function(message){//Adicionar uma nova mensagem ao socket
        renderMessage(message);
      });

      function broadcast(client) {
        var author = client.ip;
        var message = $('input[name=message]').val();//Trocar aqui para enviar o audio
        //var message = '50 * 3';

        if(calcular(message) != 'Não foi informado números' && calcular(message)){
          var messageObject = {
            author: author,
            message: message+' = <span style="color: rgb(30, 79, 177)">'+calcular(message)+'</span>',
          };
          renderMessage(messageObject);
        socket.emit('sendAudio', messageObject);//Método responsável por propagar messageObject no socket
        }
      }

      