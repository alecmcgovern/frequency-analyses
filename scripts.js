window.onload = function() {
	let audioTracks = [
		{
			title: "Obsidian - Deadmau5",
			url: "./audio/Obsidian.mp3" 
		},
		{
			title: "I Shot The Sheriff - Bob Marley",
			url: "./audio/Sheriff.mp3" 
		},
		{
			title: "Data Points - Monitor",
			url: "./audio/DataPoints.wav" 
		},
		{
			title: "Nothing - Harvey McKay & Saytek",
			url: "./audio/Nothing.mp3" 
		},
		{
			title: "Peet - Paul Kalkbrenner",
			url: "./audio/Peet.mp3" 
		},
		{
			title: "Memorand (Nomadic Remix) - Monitor",
			url: "./audio/Memorand.mp3"
		},
		{
			title: "Keraunoscopia - Nomadic",
			url: "./audio/Keraunoscopia.mp3"
		}
	];

	let canvas = document.getElementById('canvas1');
	let context = canvas.getContext('2d');
	let canvas2 = document.getElementById('canvas2');
	let context2 = canvas2.getContext('2d');
	let canvas3 = document.getElementById('canvas3');
	let context3 = canvas3.getContext('2d');
	let canvas4 = document.getElementById('canvas4');
	let context4 = canvas4.getContext('2d');
	let canvas5 = document.getElementById('canvas5');
	let context5 = canvas5.getContext('2d');
	let canvas6 = document.getElementById('canvas6');
	let context6 = canvas6.getContext('2d');

	let AudioContext = window.AudioContext || window.webkitAudioContext || false;
	let inputType = 0;
	let inputStream = null;

	// Setup audio input
	if (navigator.mediaDevices) {
		navigator.mediaDevices.getUserMedia = navigator.mediaDevices.getUserMedia || navigator.mediaDevices.webkitGetUserMedia || navigator.mediaDevices.mozGetUserMedia || navigator.mediaDevices.msGetUserMedia || navigator.mediaDevices.oGetUserMedia;

		navigator.mediaDevices.getUserMedia({audio: true, video: false}).then(function(stream) {
			inputStream = stream;
		}).catch(function(err) {
			console.log(err);
		});
	} else {
		console.log("no media devices found");
	}


	// Audio context analyser	
	if (AudioContext) {
		let ctx = null;
		let analyser = null;
		let audioSrc = null;

		let currentAudio = null;
		let currentAudioIndex = null;

		let MEDIA_ELEMENT_NODES = new WeakMap();

		setupMenuControl();
		loadAudioTracks();
		setupAudioControls();

		function setupMenuControl() {
			let menuToggle = document.getElementsByClassName("menu-icon")[0];
			let rightPanel = document.getElementsByClassName("right-panel")[0];
			menuToggle.addEventListener("click", () => {
				if (menuToggle.classList.contains("menu-open")) {
					menuToggle.classList.remove("menu-open");
					rightPanel.classList.remove("menu-open");
				} else {
					menuToggle.classList.add("menu-open");
					rightPanel.classList.add("menu-open");
				}
			});
		}

		function loadAudioTracks() {
			let songList = document.getElementsByClassName('song-list')[0];

			audioTracks.forEach((track) => {
				let audioElement = document.createElement("audio");
				audioElement.classList.add("audio");
				audioElement.src = track.url;

				let audioControls = document.createElement("div");
				let playPause = document.createElement("div");
				let songTitle = document.createElement("div");
				audioControls.classList.add("audio-controls");
				playPause.classList.add("play-pause");
				songTitle.classList.add("song-title");

				audioControls.appendChild(playPause);
				audioControls.appendChild(songTitle);

				songTitle.innerHTML = track.title;

				songList.appendChild(audioElement);
				songList.appendChild(audioControls);
			});
		}

		function setupAudioControls() {
			let audioElements = document.getElementsByClassName("audio");
			let PlayPauseControls = document.getElementsByClassName("play-pause");
			let microphoneInputButton = document.getElementsByClassName("audio-input")[0];
			let playPauseArray = [].slice.call(PlayPauseControls);

			playPauseArray.forEach((control, index) => {
				setupAudioContext(audioElements[index]);

				control.addEventListener("click", () => {
					if (!playPauseArray[index].classList.contains("pause")) {

						if (currentAudio) {
							currentAudio.pause();
							audioSrc.disconnect(analyser);
							playPauseArray[currentAudioIndex].classList.remove("pause");
						}

						if (inputType === 1) {
							audioSrc.disconnect(analyser);
							microphoneInputButton.classList.remove("input-on");
							inputType = 0;
						}

						if (MEDIA_ELEMENT_NODES.has(audioElements[index])) {
							audioSrc = MEDIA_ELEMENT_NODES.get(audioElements[index]);
							audioSrc.connect(analyser);
							analyser.connect(ctx.destination);
						}
						playPauseArray[index].classList.add("pause");
						currentAudio = audioElements[index];
						currentAudioIndex = index;
						currentAudio.volume = 0.5;
						currentAudio.play();
					} else {
						audioSrc.disconnect(analyser);
						playPauseArray[index].classList.remove("pause");
						audioElements[index].pause();
						currentAudio = null;
					}
				});
			});	


			// Direct audio input
			microphoneInputButton.addEventListener("click", () => {
				if (inputType === 0) {
					inputType = 1;
					microphoneInputButton.classList.add("input-on");

					if (currentAudio) {
						currentAudio.pause();
						audioSrc.disconnect(analyser);
						playPauseArray[currentAudioIndex].classList.remove("pause");
					}


					if (ctx == null) {
						ctx = new AudioContext();	
						analyser = ctx.createAnalyser();
					}

					audioSrc = ctx.createMediaStreamSource(inputStream);
					audioSrc.connect(analyser);

					analyser.connect(ctx.destination);

					currentAudio = null;
					currentAudioIndex = null;
				} else {
					audioSrc.disconnect(analyser);
					inputType = 0;
					microphoneInputButton.classList.remove("input-on");
					if (currentAudio) {
						currentAudio.pause();
						currentAudio = null;
					}
				}
			});

			renderFrame();	
		}

		function setupAudioContext(audio) {
			if (ctx == null) {
				ctx = new AudioContext();	
			}
			analyser = ctx.createAnalyser();

			if (MEDIA_ELEMENT_NODES.has(audio)) {
				audioSrc = MEDIA_ELEMENT_NODES.get(audio);
			} else {
				audioSrc = ctx.createMediaElementSource(audio);
				MEDIA_ELEMENT_NODES.set(audio, audioSrc);
			}

			audioSrc.connect(analyser);
		}


		function paintBackground(context, color) {
			context.beginPath();
			context.rect(0, 0, canvas2.width, canvas2.height);
			context.fillStyle = color;
			context.fill();
		}

		function renderFrame() {
			requestAnimationFrame(renderFrame);

			let frequencyData = new Uint8Array(analyser.frequencyBinCount);
			analyser.getByteFrequencyData(frequencyData);
			// console.log(frequencyData);


			// CANVAS 1 //
			const num_bars = 50;
			let bin_size = Math.floor(frequencyData.length / num_bars);

			paintBackground(context, "black");
			context.fillStyle = "white";
			context.fillRect(20, canvas.height/2, canvas.width - 40, 1);


			for (var i = 0; i < num_bars; i++) {
				let sum = 0;
				for (var j = 0; j < bin_size; j++) {
					sum += frequencyData[(i * bin_size) + j];
				}

				let average = sum / bin_size;
				let bar_width = (canvas.width - 40) / num_bars;
				let scaled_average = (average / 256) * canvas.height/2;
				context.fillStyle = "#"+((1<<24)*Math.random()|0).toString(16);

				const x = i * bar_width + 20;
				const y = canvas.height/2 + scaled_average/2;

				context.fillRect(x, y, bar_width - 2, -scaled_average);
			}



			// CANVAS 2 //
			const num_bars2 = 15;
			let bin_size2 = Math.floor(frequencyData.length / num_bars2);

			paintBackground(context2, "black");

			for (var i = 0; i < num_bars2; i++) {
				let sum = 0;
				for (var j = 0; j < bin_size2; j++) {
					sum += frequencyData[i + j];
				}

				let average = sum / bin_size2;
				let bar_width = (canvas2.width - 140) / (num_bars2 * 3);
				let scaled_average = (average / 256) * canvas2.height/6;


				context2.beginPath();
				let startAngle = 0; // Starting point on circle
        		let endAngle = Math.PI + (Math.PI * j) / 2; // End point on circle
        		let radius = canvas2.width/2 - i*bar_width - 100 + scaled_average > 0 ? canvas2.width/2 - i*bar_width - 100 + scaled_average : 0;
				context2.arc(canvas2.width/2, canvas2.height/2, radius, startAngle, endAngle, false);

				if (scaled_average > 0) {
					context2.lineWidth = num_bars2 - i > 1 ? num_bars2 - i : 1;
					context2.strokeStyle = "#"+((1<<24)*Math.random()|0).toString(16);
					context2.stroke();
				} else {
					context2.lineWidth = 0;
				}
			}


			// CANVAS 3 //
			bin_size = Math.floor(frequencyData.length / num_bars);

			paintBackground(context3, "black");
			context3.fillStyle = "white";
			context3.fillRect(20, canvas.height/2, canvas.width - 40, 1);

			for (var i = 0; i < num_bars; i++) {
				let sum = 0;
				for (var j = 0; j < bin_size; j++) {
					sum += frequencyData[(i * bin_size) + j];
				}

				let average = sum / bin_size;
				let bar_width = (canvas.width - 40) / num_bars;
				let scaled_average = (average / 256) * canvas.height/2;
				context3.fillStyle = "#"+((1<<24)*Math.random()|0).toString(16);

				const x = i * bar_width + 20;
				const y = canvas.height/2 - scaled_average/2 - 2;
				const height = scaled_average > 0 ? 2 : 0;

				context3.fillRect(x, y, bar_width - 2, height);
			}




			// CANVAS 4 //
			bin_size = Math.floor(frequencyData.length / num_bars);

			paintBackground(context4, "black");

			for (var i = 0; i < num_bars; i++) {
				let sum = 0;
				for (var j = 0; j < bin_size; j++) {
					sum += frequencyData[(i * bin_size) + j];
				}

				let average = sum / bin_size;
				let bar_width = (canvas.width - 40) / num_bars;
				let scaled_average = (average / 256) * canvas.height/2;
				context4.fillStyle = "#"+((1<<24)*Math.random()|0).toString(16);

				context4.beginPath();
				let startAngle = 0; // Starting point on circle
        		let endAngle = Math.PI + (Math.PI * j) / 2; // End point on circle
        		let radius = canvas2.width/2 - i*bar_width - 100 + scaled_average > 0 ? canvas2.width/2 - i*bar_width - 100 + scaled_average : 0;
				context4.arc(canvas2.width/2, canvas2.height/2, radius, startAngle, endAngle, false);

				if (scaled_average > 0) {
					context4.lineWidth = num_bars2 - i > 1 ? num_bars2 - i : 1;
					context4.strokeStyle = "#"+((1<<24)*Math.random()|0).toString(16);
					context4.stroke();
				} else {
					context4.lineWidth = 0;
				}
			}

			// CANVAS 5 //
			bin_size = Math.floor(frequencyData.length / num_bars);

			paintBackground(context5, "black");
			context5.fillStyle = "white";
			context5.fillRect(20, canvas.height/2, canvas.width - 50, 1);

			for (var i = 0; i < num_bars; i++) {
				let sum = 0;
				for (var j = 0; j < bin_size; j++) {
					sum += frequencyData[(i * bin_size) + j];
				}

				let average = sum / bin_size;
				let bar_width = (canvas.width - 40) / num_bars;
				let scaled_average = (average / 256) * canvas.height/2;
				context5.fillStyle = "#"+((1<<24)*Math.random()|0).toString(16);

				const x = canvas.width - i * bar_width - 23;
				const y = canvas.height/2 + scaled_average/2;

				context5.fillRect(x, y, bar_width - 2, -scaled_average);
			}


			// CANVAS 6 //
			bin_size = Math.floor(frequencyData.length / num_bars);

			paintBackground(context6, "black");

			for (var i = 0; i < num_bars; i++) {
				let sum = 0;
				for (var j = 0; j < bin_size; j++) {
					sum += frequencyData[(i * bin_size) + j];
				}

				let average = sum / bin_size;
				let bar_width = (canvas.width - 40) / num_bars;
				let scaled_average = (average / 256) * canvas.height/2;
				context6.strokeStyle = "#"+((1<<24)*Math.random()|0).toString(16);
				context6.lineWidth = 2;

				context6.beginPath();
				let startAngle = 0; // Starting point on circle
        		let endAngle = Math.PI + (Math.PI * j) / 2; // End point on circle
        		let radius = scaled_average;

				context6.arc(canvas2.width/2, canvas2.height/2, radius, startAngle, endAngle);
				context6.stroke();
			}
		}

	} else {
		alert("Sorry, the Web Audio API is not supported by your browser.");
	}
}

