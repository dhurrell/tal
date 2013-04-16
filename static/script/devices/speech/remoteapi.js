/**
 * @fileOverview Implementation of a Text-to-Speech API utilising a remote web service to carry out the TTS operation,
 * returning AAC audio. The URL of the remote web service is specified in the device configuration.
 */
require.def(
    'antie/devices/speech/remoteapi',
    [
         'antie/devices/speech/basespeech',
         'antie/devices/device',
         'antie/audiosource'
    ],
    function(BaseSpeech, Device, AudioSource) {
        var _speechEnd;
        var Speaker = BaseSpeech.extend({
            /* See basespeech.js for documentation */
            init: function(device) {
                var self = this;
                _speechEnd = function(ev) {
                    self._logger.log('Finished talking');
                    if (typeof self._onComplete === 'function') {
                        self._onComplete();
                    }
                };
                
                this._super(device);
                this._player = device.createPlayer('speechPlayer', 'audio');
                this._player.render();
                this._player.addEventListener('ended', _speechEnd);
                this._remoteApiPrefix = device.getConfig().voice && device.getConfig().voice.api || false;
                
                if(!this._remoteApiPrefix) {
                    throw new Error("No remote API specified in config.");
                }
                
                this._logger.debug("Initialised remoteapi speech synth");
            },
            
            destroy: function() {
                this._player.removeEventListener('ended', _speechEnd);
                this._player.stop();
                this._player.destroy();
                this.player = null;
            },

            /* See basespeech.js for documentation */
            _speakInternal: function(text, onComplete) {
                var sourceUrl = this._remoteApiPrefix + text; // AudioSource calls encodeURI()
                var audioSource = new AudioSource(sourceUrl, 'audio/mp4');
                this._player.setSources([audioSource]);
                
                this._onComplete = onComplete;
                
                this._player.load();
                this._player.play();
            },
            
            /* See basespeech.js for documentation */
            _stopInternal: function() {
                this._onComplete = null;
                this._player.stop();
            }
        });

        /**
         * Return the class represented here when device.createSpeechSynth() is called.
         */
        Device.prototype.createSpeechSynth = function() {
            return new Speaker(this);
        };
    }
);