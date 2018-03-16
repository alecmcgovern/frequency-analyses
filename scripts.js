window.onload = function() {
	// alert("welcome");
	console.log("hello all");
	let header = document.getElementsByClassName('header')[0];

	let canvas = document.getElementById('canvas1');
	let context = canvas.getContext('2d');
	let canvas2 = document.getElementById('canvas2');
	let context2 = canvas2.getContext('2d');

	let AudioContext = window.AudioContext || window.webkitAudioContext || false;

	let audio = new Audio();
	audio.src = "./Audio/Memorand.wav";
	audio.controls = true;
	audio.autoplay = false;
	// audio.muted = true;
	audio.id = 'audio1';
	header.appendChild(audio);

 
	if (AudioContext) {
		let ctx = new AudioContext();
		let analyser = ctx.createAnalyser();

		let audioSrc = ctx.createMediaElementSource(audio);
		audioSrc.connect(analyser);
		analyser.connect(ctx.destination);
		renderFrame();


		function renderFrame() {
			requestAnimationFrame(renderFrame);

			let frequencyData = new Uint8Array(analyser.frequencyBinCount);
			analyser.getByteFrequencyData(frequencyData);

			// CANVAS 1 //
			const num_bars = 100;
			let bin_size = Math.floor(frequencyData.length / num_bars);


			context.clearRect(0, 0, canvas.width, canvas.height);
			context.beginPath();
			context.rect(0, 0, canvas2.width, canvas2.height);
			context.fillStyle = "black";
			context.fill();

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
				context.fillRect(i * bar_width + 20, canvas.height/2 + scaled_average/2, bar_width - 2, -scaled_average);
			}



			// CANVAS 2 //
			const num_bars2 = 15;

			let bin_size2 = Math.floor(frequencyData.length / num_bars2);

			context2.clearRect(0, 0, canvas2.width, canvas2.height);

			context2.beginPath();
			context2.rect(0, 0, canvas2.width, canvas2.height);
			context2.fillStyle = "black";
			context2.fill();


			for (var i = 0; i < num_bars2; i++) {
			// for (var i = 0; i < 1; i++) {
				let sum = 0;
				for (var j = 0; j < bin_size2; j++) {
					sum += frequencyData[(i * bin_size2) + j];
				}

				let average = sum / bin_size2;
				let bar_width = (canvas2.width - 140) / (num_bars2 * 2);
				let scaled_average = (average / 256) * canvas2.height/8;


				context2.beginPath();
				let startAngle = 0; // Starting point on circle
        		let endAngle = Math.PI + (Math.PI * j) / 2; // End point on circle
        		let radius = canvas2.width/2 - 40 + scaled_average > 0 ? canvas2.width/2 - i*bar_width - 40 + scaled_average : 0;
				context2.arc(canvas2.width/2, canvas2.height/2, radius, startAngle, endAngle, false);
				if (scaled_average > 0) {
					context2.lineWidth = num_bars2 - i > 1 ? num_bars2 - i : 1;
					context2.strokeStyle = "#"+((1<<24)*Math.random()|0).toString(16);
					context2.stroke();
				} else {
					context2.lineWidth = 0;
				}
				// context2.strokeStyle = "rgb(0, 255, 233)";
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

