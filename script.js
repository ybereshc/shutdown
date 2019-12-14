const electron = require('electron');
const {ipcRenderer} = electron;

var millisec = 0;
var millisecInitially = 0;
var timeEnd = 0;
var pause = true;
var progress = 0;

document.addEventListener('wheel', e => {
	if (e.target === spanHour || e.target === spanMinute || e.target === spanSecond) {
		let val = 1000 * (e.target === spanMinute ? 60 : (e.target === spanHour ? 60 * 60 : 1));
		if (e.deltaY < 0)
			millisec += val;
		else
			millisec -= val;
		if (!pause) {
			if (millisec < 60000)
				pause = true;
			timeEnd = millisec + Date.now();
		}
		millisecInitially = millisec;

		updateTimer();
		updateButton();
	}
});

function updateTimer() {
	if (millisec < 0)
		millisec = 0;
	else if (millisec > 3599999999)
		millisec = 3599999999;

	timer.classList.remove('text-secondary');
	timer.classList.remove('text-danger');

	if (millisec < 1)
		timer.classList.add('text-secondary');
	else if (millisec < 60000)
		timer.classList.add('text-danger');

	let second = Math.floor(millisec / 1000);
	let minute = Math.floor(second / 60);
	let hour = Math.floor(minute / 60);

	spanSecond.innerText = (second % 60).toString().padStart(2, '0');
	spanMinute.innerText = (minute % 60).toString().padStart(2, '0');
	spanHour.innerText = hour.toString().padStart(2, '0');

	ipcRenderer.send('progress', progress);
}

function updateButton() {
	btn.classList.remove('btn-danger');
	btn.classList.remove('btn-success');
	btn.classList.remove('btn-secondary');
	btn.removeAttribute('disabled');

	if (millisec < 1) {
		btn.innerText = 'Set Time!';
		btn.classList.add('btn-secondary');
		btn.setAttribute('disabled', '');
		ipcRenderer.send('progress', progress, 'none');
	} else if (pause) {
		btn.innerText = 'Start';
		btn.classList.add('btn-success');
		ipcRenderer.send('progress', progress, 'paused');
	} else {
		btn.innerText = 'Pause';
		btn.classList.add('btn-danger');
	}
}

const update = setInterval(() => {
	if (!pause) {
		millisec = timeEnd - Date.now();
		progress = (millisecInitially - millisec) / millisecInitially;
		console.log(progress);
		updateTimer();

		if (millisec <= 0) {
			clearTimeout(update);
			document.body.innerHTML = '<h1>Bye!</h1>';
			ipcRenderer.send('progress', progress, 'indeterminate');
			ipcRenderer.send('shutdown');
		}
	}
}, 1);

btn.onclick = function(e) {
	pause = !pause;
	timeEnd = millisec + Date.now();
	updateButton();
}
