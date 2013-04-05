require.def(
    'antie/devices/speech/remoteapi',
    [
         'antie/class',
         'antie/devices/device',
         'antie/audiosource'
    ],
    function(Class, Device, AudioSource) {
        var remoteApiPrefix = "http://tts-api.com/tts.mp3?q=";
        var Speaker = Class.extend({
            /**
             * Initialise speech, passing in the device handle. 
             */
            init: function(device) {
                this._player = device.createPlayer('speechPlayer', 'audio');
                this._logger = device.getLogger();
                this._logger.debug("Initialised remoteapi speech synth");
                
                addEventListeners(this._player, this._logger);
            },
            
            speak: function(text, onComplete) {
                var self = this;
                var onCompleteInternal = function() {
                    self._player.removeEventListener('ended', onCompleteInternal);
                    onComplete();
                };
                
                var sourceUrl = remoteApiPrefix + encodeURI(text);
                var audioSource = new AudioSource(sourceUrl, 'audio/mp4');
                this._player.setSources([audioSource]);
                
                if(typeof onComplete === 'function') {
                    this._player.addEventListener('ended', onCompleteInternal);
                }
                
                this._player.load();
                this._player.play();
                this._logger.debug("Excuse me I am talking!");
            },
            
            stop: function() {
                throw new Error("Not implemented!");
            },
            
            destroy: function() {
                this._player.destroy();
            }
        });
        
        function addEventListeners(player, logger) {
            logger.log('adding listeners on ' + player.id);
            var events = ["loadstart", "progress", "suspend", "abort", "error", "emptied", "stalled", "play", "pause", "loadedmetadata", "loadeddata", "waiting", "playing", "canplay", "canplaythrough", "seeking", "timeupdate", "ended", "ratechange", "durationchange", "volumechange"];
            for (var i = 0; i < events.length; i++) {
                var e = events[i];
                logger.log('adding ' + e + ' listener...');
                player._mediaElement.addEventListener(e, function(e) {
                    /*if(e.type === 'canplaythrough') {
                        logger.log("ok I'm playing");
                        player.yesiamloaded = true;
                    }*/
                    logger.log('event on ' + player.id + ': ' + e.type);
                });
            }
            player.addEventListener("error", function(e) {
               logger.log('error event on ' + player.id + '. Last? ' + e.last); 
            });
            /*player._mediaElement.addEventListener("play", function() {
                debugger;
            });*/
        }

        Device.prototype.createSpeechSynth = function() {
            return new Speaker(this);
        };
    }
);