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

	let AudioContext = window.AudioContext || window.webkitAudioContext || false;
		
	if (AudioContext) {
		let ctx = null;
		let analyser = null;
		let audioSrc = null;

		let currentAudio = null;
		let currentAudioIndex = null;

		let MEDIA_ELEMENT_NODES = new WeakMap();

		loadAudioTracks();

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
			setupAudioControls();
		}


		function setupAudioControls() {
			let audioElements = document.getElementsByClassName("audio");
			let PlayPauseControls = document.getElementsByClassName("play-pause");

			let playPauseArray = [].slice.call(PlayPauseControls);;

			playPauseArray.forEach((control, index) => {
				setupAudioContext(audioElements[index]);

				control.addEventListener("click", () => {
					if (!playPauseArray[index].classList.contains("pause")) {

						if (currentAudio) {
							currentAudio.pause();
							playPauseArray[currentAudioIndex].classList.remove("pause");
						}
						if (MEDIA_ELEMENT_NODES.has(audioElements[index])) {
							audioSrc = MEDIA_ELEMENT_NODES.get(audioElements[index]);
							audioSrc.connect(analyser);
							analyser.connect(ctx.destination);
						}
						playPauseArray[index].classList.add("pause");
						// setupAudioContext(audioElements[index]);
						currentAudio = audioElements[index];
						currentAudioIndex = index;
						currentAudio.play();
					} else {
						playPauseArray[index].classList.remove("pause");
						audioElements[index].pause();
						currentAudio = null;
					}
				});
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

			// audioSrc = ctx.createMediaElementSource(audio);
			audioSrc.connect(analyser);
			analyser.connect(ctx.destination);
			// renderFrame();
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
				const y = canvas.height/2 - scaled_average/2;

				context3.fillRect(x, y, bar_width - 2, 2);
			}




			// CANVAS 4 //
			bin_size = Math.floor(frequencyData.length / num_bars);

			paintBackground(context4, "black");
			context4.fillStyle = "white";
			context4.fillRect(20, canvas.height/2, canvas.width - 40, 1);

			for (var i = 0; i < num_bars; i++) {
				let sum = 0;
				for (var j = 0; j < bin_size; j++) {
					sum += frequencyData[(i * bin_size) + j];
				}

				let average = sum / bin_size;
				let bar_width = (canvas.width - 40) / num_bars;
				let scaled_average = (average / 256) * canvas.height/2;
				context4.fillStyle = "#"+((1<<24)*Math.random()|0).toString(16);

				const x = canvas.width - i * bar_width - 23;
				const y = canvas.height/2 + scaled_average/2;

				context4.fillRect(x, y, bar_width - 2, -scaled_average);
			}
		}

	} else {
		alert("Sorry, the Web Audio API is not supported by your browser.");
	}

 

  //   if (navigator.mediaDevices) {
		// navigator.mediaDevices.getUserMedia = navigator.mediaDevices.getUserMedia || navigator.mediaDevices.webkitGetUserMedia || navigator.mediaDevices.mozGetUserMedia || navigator.mediaDevices.msGetUserMedia || navigator.mediaDevices.oGetUserMedia;

		// navigator.mediaDevices.getUserMedia({audio: true, video: false}).then(function(stream) {
		// 	try {
		// 		audio.srcObject = stream;
		// 	} catch (error) {
		// 		audio.src = URL.createObjectURL(stream);
		// 	}
		// })
		// .catch(function(err) {
		// 	console.log(err);
		// });
  //   } else {
  //       console.log("no media devices found");
  //   }


	
}

