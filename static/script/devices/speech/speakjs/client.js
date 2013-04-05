require.def(
    'antie/devices/speech/speakjs/client',
    [
         'antie/class',
         'antie/devices/device',
         'antie/devices/media/html5'
    ],
    function(Class, Device, HTML5Player) {
        var Speaker = Class.extend({
            /**
             * Initialise speech, passing in the device handle. 
             */
            init: function(device) {
                this._player = device.createPlayer('speechPlayer', 'audio');
                this._logger = device.getLogger();
                if(!(this._player instanceof HTML5Player)) {
                    this._player.destroy();
                    throw new Error("Only the HTML5 media player is supported by this speech module.");
                }
                
                try {
                    this._speakWorker = new Worker('/static/catal/img/speak/speakWorker.js');
                  this._logger.debug('speak.js worker loaded successfully');
                } catch(e) {
                  this._logger.log('speak.js warning: no worker support');
                  try {
                      device.loadScript('/static/catal/img/speak/speakGenerator.js');
                      this._logger.log('loaded speakGenerator.js directly');
                  }
                  catch(e) {
                      this._logger.log("oh god, loading speakGenerator.js directly didn't work either");
                  }
                }
            },
            
            /**
             * Speak the requested text.
             * text {String} Text to speak.
             * onComplete {Function} Optional callback on completion.
             */
            speak: function(text, onComplete) {
                // TODO: Make more cleverer to split up into multiple sections.
                var options = { amplitude: 100, wordgap: 0, pitch: 50, speed: 175 };
                
                speakInternal(text, options, this._speakWorker, this._logger, this._player._mediaElement);
                if(typeof onComplete === "function") {
                   onComplete(); 
                }
            },
            
            /**
             * Stop speaking.
             */
            stop: function() {
                throw new Error("Not implemented.");
            },
            
            destroy: function() {
                this._player.destroy();
            }
        });
        
        function speakInternal(text, args, speakWorker, logger, audioElement) {
          var PROFILE = 1;
        
          function parseWav(wav) {
            function readInt(i, bytes) {
              var ret = 0;
              var shft = 0;
              while (bytes) {
                ret += wav[i] << shft;
                shft += 8;
                i++;
                bytes--;
              }
              return ret;
            }
            if (readInt(20, 2) != 1) throw 'Invalid compression code, not PCM';
            if (readInt(22, 2) != 1) throw 'Invalid number of channels, not 1';
            return {
              sampleRate: readInt(24, 4),
              bitsPerSample: readInt(34, 2),
              samples: wav.subarray(44)
            };
          }
        
          function playHTMLAudioElement(wav) {
            function encode64(data) {
              var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
              var PAD = '=';
              var ret = '';
              var leftchar = 0;
              var leftbits = 0;
              for (var i = 0; i < data.length; i++) {
                leftchar = (leftchar << 8) | data[i];
                leftbits += 8;
                while (leftbits >= 6) {
                  var curr = (leftchar >> (leftbits-6)) & 0x3f;
                  leftbits -= 6;
                  ret += BASE[curr];
                }
              }
              if (leftbits == 2) {
                ret += BASE[(leftchar&3) << 4];
                ret += PAD + PAD;
              } else if (leftbits == 4) {
                ret += BASE[(leftchar&0xf) << 2];
                ret += PAD;
              }
              return ret;
            }
        
            audioElement.src = "data:audio/x-wav;base64,"+encode64(wav);
            audioElement.play();
            //audioElement.innerHTML=("<audio id=\"speechPlayer\" src=\"data:audio/x-wav;base64,"+encode64(wav)+"\">");
            //document.getElementById("speechPlayer").play();
          }
        
          function playAudioDataAPI(data) {
            try {
              var output = new Audio();
              output.mozSetup(1, data.sampleRate);
              var num = data.samples.length;
              var buffer = data.samples;
              var f32Buffer = new Float32Array(num);
              for (var i = 0; i < num; i++) {
                var value = buffer[i<<1] + (buffer[(i<<1)+1]<<8);
                if (value >= 0x8000) value |= ~0x7FFF;
                f32Buffer[i] = value / 0x8000;
              }
              output.mozWriteAudio(f32Buffer);
              return true;
            } catch(e) {
              return false;
            }
          }
        
          function handleWav(wav) {
            var startTime = Date.now();
            var data = parseWav(wav); // validate the data and parse it
            // TODO: try playAudioDataAPI(data), and fallback if failed
            playHTMLAudioElement(wav);
            logger.debug('speak.js: wav processing took ' + (Date.now()-startTime).toFixed(2) + ' ms');
          }
        
          if (!speakWorker || (args && args.noWorker)) {
            if (window.generateSpeech) {
                // Do everything right now. speakGenerator.js must have been loaded.
                //setTimeout(function() {
                var startTime = Date.now();
                var wav = window.generateSpeech(text, args);
                logger.debug('speak.js: processing took ' + (Date.now()-startTime).toFixed(2) + ' ms');
                handleWav(wav);
                //}, 10);
            }
          } else {
            // Call the worker, which will return a wav that we then play
            var startTime = Date.now();
            speakWorker.onmessage = function(event) {
                logger.debug('speak.js: worker processing took ' + (Date.now()-startTime).toFixed(2) + ' ms');
              handleWav(event.data);
            };
            speakWorker.postMessage({ text: text, args: args });
          }
        }
        
        Device.prototype.createSpeechSynth = function() {
            return new Speaker(this);
        };
    }
);