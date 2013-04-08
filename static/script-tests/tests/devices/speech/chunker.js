(function() {
	this.SpeechChunkerTest = AsyncTestCase("Speech Chunker");

	this.SpeechChunkerTest.prototype.setUp = function() {
		this.sandbox = sinon.sandbox.create();
	}

	this.SpeechChunkerTest.prototype.tearDown = function() {
		this.sandbox.restore();
	}
	
	this.SpeechChunkerTest.prototype.testSentenceFullStop = function(queue) {
	    queuedRequire(queue, 
        [
            "antie/speech/chunker"
        ], 
        function(Chunker) {
            var c = new Chunker("The quick brown fox jumped over the lazy dog. It was a great shame.", 50);
            assertEquals("The quick brown fox jumped over the lazy dog.", c.nextChunk());
        }
    );
	}
	
	this.SpeechChunkerTest.prototype.testSentenceExclamationMark = function(queue) {
	    queuedRequire(queue, 
        [
            "antie/speech/chunker"
        ], 
        function(Chunker) {
            var c = new Chunker("The quick brown fox jumped over the lazy dog! It was a great shame.", 50);
            assertEquals("The quick brown fox jumped over the lazy dog!", c.nextChunk());
        }
    );
	}

	this.SpeechChunkerTest.prototype.testSentenceQuestionMark = function(queue) {
	    queuedRequire(queue, 
        [
            "antie/speech/chunker"
        ], 
        function(Chunker) {
            var c = new Chunker("The quick brown fox jumped over the lazy dog? It was a great shame.", 50);
            assertEquals("The quick brown fox jumped over the lazy dog?", c.nextChunk());
        }
    );
	}
	
	this.SpeechChunkerTest.prototype.testSentenceSemiColon = function(queue) {
	    queuedRequire(queue, 
        [
            "antie/speech/chunker"
        ], 
        function(Chunker) {
            var c = new Chunker("The quick brown fox jumped over the lazy dog; it was a great shame.", 50);
            assertEquals("The quick brown fox jumped over the lazy dog;", c.nextChunk());
        }
    );
	}
	
  this.SpeechChunkerTest.prototype.testSecondSentenceFullStop = function(queue) {
	    queuedRequire(queue, 
        [
            "antie/speech/chunker"
        ], 
        function(Chunker) {
            var c = new Chunker("The quick brown fox jumped over the lazy dog. It was a great shame.", 50);
            c.nextChunk();
            assertEquals("It was a great shame.", c.nextChunk());
        }
    );
	}

	this.SpeechChunkerTest.prototype.testThirdSentenceFullStop = function(queue) {
      queuedRequire(queue, 
        [
            "antie/speech/chunker"
        ], 
        function(Chunker) {
            var c = new Chunker("The quick brown fox jumped over the lazy dog. It was a great shame. There was no rejoicing. In fact everyone cried.", 50);
            c.nextChunk();
            c.nextChunk();
            assertEquals("In fact everyone cried.", c.nextChunk());
        }
    );
	}
	
	this.SpeechChunkerTest.prototype.testThirdSentenceMixture = function(queue) {
      queuedRequire(queue, 
        [
            "antie/speech/chunker"
        ], 
        function(Chunker) {
            var c = new Chunker("The quick brown fox jumped over the lazy dog! It was a great shame! There was no rejoicing? In fact everyone cried.", 50);
            c.nextChunk();
            c.nextChunk();
            assertEquals("In fact everyone cried.", c.nextChunk());
        }
    );
	}
	
	this.SpeechChunkerTest.prototype.testLongGapAfterFirstSentence = function(queue) {
      queuedRequire(queue, 
        [
            "antie/speech/chunker"
        ], 
        function(Chunker) {
            var c = new Chunker("The quick! Brown fox jumped over the lazy dog, which was a great shame, but oh well whatevs", 50);
            assertEquals("The quick!", c.nextChunk());
        }
    );
	}
	
	this.SpeechChunkerTest.prototype.testCommaFallbackInLongSentence = function(queue) {
      queuedRequire(queue, 
        [
            "antie/speech/chunker"
        ], 
        function(Chunker) {
            var c = new Chunker("The quick! Brown fox jumped over the lazy dog, which was a great shame, but oh well whatevs", 50);
            c.nextChunk();
            assertEquals("Brown fox jumped over the lazy dog,", c.nextChunk());
        }
    );
	}

	this.SpeechChunkerTest.prototype.testWhitespaceFallbackInSuperLongSentence = function(queue) {
      queuedRequire(queue, 
        [
            "antie/speech/chunker"
        ], 
        function(Chunker) {
            var c = new Chunker("The quick! Brown fox jumped over the lazy dog which was a great shame but oh well whatevs", 50);
            c.nextChunk();
            assertEquals("Brown fox jumped over the lazy dog which was a", c.nextChunk());
        }
    );
	}
	
	this.SpeechChunkerTest.prototype.testAbsoluteChunkLengthLimit = function(queue) {
      queuedRequire(queue, 
        [
            "antie/speech/chunker"
        ], 
        function(Chunker) {
            var c = new Chunker("The quick! Brownfoxjumpedoverthelazydogwhichwasagreatshamebutohwellwhatevs, I don't care...", 50);
            c.nextChunk();
            assertEquals("Brownfoxjumpedoverthelazydogwhichwasagreatshamebut", c.nextChunk());
        }
    );
	}
	
		this.SpeechChunkerTest.prototype.testRecoveryAfterAbsoluteChunkLengthLimit = function(queue) {
      queuedRequire(queue, 
        [
            "antie/speech/chunker"
        ], 
        function(Chunker) {
            var c = new Chunker("The quick! Brownfoxjumpedoverthelazydogwhichwasagreatshamebutohwellwhatevs, I don't care...", 50);
            c.nextChunk();
            c.nextChunk();
            assertEquals("ohwellwhatevs, I don't care...", c.nextChunk());
        }
    );
	}
	
	this.SpeechChunkerTest.prototype.testExhaustedAfterOne = function(queue) {
      queuedRequire(queue, 
        [
            "antie/speech/chunker"
        ], 
        function(Chunker) {
            var c = new Chunker("The quick brown fox", 50);
            c.nextChunk();
            assertFalse("No sentences left", c.hasNextChunk());
        }
    );
	}
	
		this.SpeechChunkerTest.prototype.testNotExhaustedWhenOneLeft = function(queue) {
      queuedRequire(queue, 
        [
            "antie/speech/chunker"
        ], 
        function(Chunker) {
            var c = new Chunker("The quick brown fox jumped over the lazy dog. It was a great shame.", 50);
            c.nextChunk();
            assert("A sentence remains", c.hasNextChunk());
        }
    );
    
    this.SpeechChunkerTest.prototype.testExhaustedAfterTwo = function(queue) {
      queuedRequire(queue, 
        [
            "antie/speech/chunker"
        ], 
        function(Chunker) {
            var c = new Chunker("The quick brown fox jumped over the lazy dog. It was a great shame.", 50);
            c.nextChunk();
            c.nextChunk();
            assertFalse("No sentences left", c.hasNextChunk());
        }
    );
	}
})();