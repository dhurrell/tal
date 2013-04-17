require.def(
    'antie/devices/speech/chunker',
    [
         'antie/class'
    ],
    function(Class) {
        return Class.extend({
            /**
             * Use this class to split a long piece of speech into more manageable chunks.
             * @param text String The entire chunk of text.
             * @param Number Maximum length of each chunk, in characters.
             */
            init: function(text, chunkLength) {
                if (typeof text === 'string') {
                    text = [text];
                }
                console.log('CHUNKER: ' + text.join('|'));
                this._text = text;
                this._desiredLength = chunkLength || 100;
                this._currentPosition = 0;
                this._index = 0;
            },
            
            getNextChunk: function() {
                var self = this;
                var startPosition = this._currentPosition;
                
                if (this._currentPosition >= this._text[this._index].length) {
                    this._index++;
                    this._currentPosition = 0;
                    startPosition = 0;
                }
                
                var text = this._text[this._index];
                var nextBoundaryLength = findNextChunkLength();
                
                this._currentPosition += nextBoundaryLength;
                
                var test = text.substr(startPosition, nextBoundaryLength).trim();
                console.log('NEXT:' + test);
                return test;
                
                // Helper function: Find the position of the next chunk boundary in the string.
                function findNextChunkLength() {
                    var remainingLength = text.length - self._currentPosition;
                    
                    // Only check for a suitable end point for this chunk if it's longer
                    // than the target.
                    if (remainingLength > self._desiredLength) {
                        // Consider the next n characters of the string.
                        var segmentToCheck = text.substr(self._currentPosition, self._desiredLength);
                        // Look for a chunk end: Prefer sentence terminators, then commas, then word boundaries.
                        var terminatorSets = [['.', '?', '!', ';'], [','], [' ']];
                        
                        // Check terminators until exhausted or max is no longer zero
                        for (var max = 0, i = 0; max === 0 && i < terminatorSets.length; i++) {
                            var set = terminatorSets[i];
                            // Check all terminators in the set
                            for (var j = 0; j < set.length; j++) {
                                var lastIndex = segmentToCheck.lastIndexOf(set[j]);
                                if (lastIndex > 0 && lastIndex > max) {
                                    max = lastIndex;
                                }
                            }
                        }
                        
                        // Return length of string to boundary point (inclusive), or full allowed chunk length
                        // if no suitable dividing lines found.
                        return (max > 0) ? max + 1: self._desiredLength;
                    }
                    else {
                        return remainingLength;
                    }
                }
            },
            
            hasNextChunk: function() {
                return this._index + 1 < this._text.length || this._text[this._index].length > this._currentPosition;
            }
        });
    }
);