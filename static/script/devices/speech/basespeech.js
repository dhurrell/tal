/**
 * @fileOverview Base class for Text-to-Speech APIs. Implementors must provide
 * at least a _speakInternal function and preferably _stopInternal.
 */
require.def(
    'antie/devices/speech/basespeech',
    [
         'antie/class',
         'antie/devices/device',
         'antie/speech/chunker'
    ],
    function(Class, Device, Chunker) {
        return Class.extend({
            /**
             * @constructor
             * @param {Object} device Handle to the device.
             */
            init: function(device) {
                this._player = device.createPlayer('speechPlayer', 'audio');
                this._logger = device.getLogger();
            },
            
            /**
             * Speak text aloud, calling an optional completion callback when finished.
             * Speech will be broken down into chunks and passed to the underlying speech
             * API in stages.
             * @param {String} text Full text to be spoken aloud.
             * @param {Function} onComplete Optional callback to be called when finished.
             */
            speak: function(text, onComplete) {
                if (text && text.length > 0) {
                    this._speak = true;
                    var self = this;
                    // Tokenise speech into manageable chunks
                    var chunker = new Chunker(text);
                    
                    // Callback to be called each time a chunk completes. This triggers more speech
                    // until the text input has been exhausted, then the client's completion callback
                    // is called.
                    var readyForMoreSpeech = function() {
                        // Am I still allowed to speak?
                        if (self._speak) {
                            // Is there anything more to say? Say it. If not, call onComplete callback.
                            if (chunker.hasNextChunk()) {
                                self._speakInternal(chunker.getNextChunk(), readyForMoreSpeech);
                            }
                            else if (typeof onComplete === 'function') {
                                onComplete();
                            }
                        }
                    };
                    
                    // Start the speech off, will continue until finished.
                    readyForMoreSpeech(chunker.getNextChunk());
                }
            },
            
            /**
             * Stop speaking immediately.
             */
            stop: function() {
                this._speak = false;
                
                if (typeof this._stopInternal === 'function') {
                    this._stopInternal;
                }
            },
            
            /**
             * Destroy the interface to the speech API and any media elements used.
             */
            destroy: function() {
                this.stop();
                this._player.destroy();
            },
            
            /**
             * @protected
             * Implement this function to handle speaking an individual chunk of text.
             * The onComplete callback MUST be fired to receive further chunks after the first.
             * @param {String} textChunk Chunk of text to be spoken.
             * @param {Function} Callback to be called on completion of the chunk.
             */
            _speakInternal: function(textChunk, onComplete) {
            },
            
            /**
             * @protected
             * Implement this function to stop speaking the current chunk immediately.
             * No further chunks from the same input will be sent after this is called
             * (but chunks from subsequent calls can still come in).
             */
            _stopInternal: function() {
            }
        });
        
        /**
         * Allow clients to see that a supported speech API is available on this device.
         */
        Device.prototype.isSpeechSupported = function() {
            return true;
        };
    }
);