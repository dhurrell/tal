require.def(
    'antie/devices/speech/remoteapi',
    [
         'antie/class',
         'antie/devices/device',
         'antie/audiosource'
    ],
    function(Class, Device, AudioSource) {
        var Speaker = Class.extend({
            /**
             * Initialise speech, passing in the device handle. 
             */
            init: function(device) {
                this._player = device.createPlayer('speechPlayer', 'audio');
                this._logger = device.getLogger();
                this._remoteApiPrefix = device.getConfig().voice && device.getConfig().voice.api || false;
                
                if(!this._remoteApiPrefix) {
                    throw new Error("No remote API specified in config.");
                }
                
                this._logger.debug("Initialised remoteapi speech synth");
            },
            
            speak: function(text, onComplete) {
                var self = this;
                var onCompleteInternal = function() {
                    self._player.removeEventListener('ended', onCompleteInternal);
                    onComplete();
                };
                
                var sourceUrl = this._remoteApiPrefix + text; // AudioSource calls encodeURI()
                var audioSource = new AudioSource(sourceUrl, 'audio/mp4');
                this._player.setSources([audioSource]);
                
                if(typeof onComplete === 'function') {
                    this._player.addEventListener('ended', onCompleteInternal);
                }
                
                this._player.load();
                this._player.play();
            },
            
            stop: function() {
                throw new Error("Not implemented!");
            },
            
            destroy: function() {
                this._player.destroy();
            }
        });

        Device.prototype.createSpeechSynth = function() {
            return new Speaker(this);
        };
    }
);