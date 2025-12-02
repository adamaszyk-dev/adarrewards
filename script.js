const countdownMain = document.getElementById('countdown-main');
const countdownMs = document.getElementById('countdown-ms');
const countdownStatus = document.getElementById('countdown-status');
const countdownBar = document.getElementById('countdown-bar');
const totalCentiseconds = 30000;
let remaining = totalCentiseconds;
let completed = false;

function formatTime(cs) {
  const totalSeconds = Math.floor(cs / 100);
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(1, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  const centis = (cs % 100).toString().padStart(2, '0');
  return { main: `${m}:${s}`, ms: `.${centis}` };
}

function updateCountdown() {
  const clamped = Math.max(0, remaining);
  const { main, ms } = formatTime(clamped);
  countdownMain.textContent = main;
  countdownMs.textContent = ms;

  if (countdownBar) {
    const percent = clamped / totalCentiseconds;
    countdownBar.style.transform = `scaleX(${percent})`;
  }

  if (remaining <= 0) {
    if (!completed) {
      countdownStatus.textContent = 'przelew wykonany';
      countdownStatus.style.color = '#2ff0a0';
      completed = true;
      setTimeout(() => {
        remaining = totalCentiseconds;
        completed = false;
        countdownStatus.textContent = 'przelew w drodze';
        countdownStatus.style.color = '#9eb5d4';
      }, 1600);
    }
    return;
  }

  if (remaining <= 6000) {
    countdownStatus.textContent = 'ostatnie sekundy';
    countdownStatus.style.color = '#ff3b53';
  } else if (remaining <= 18000) {
    countdownStatus.textContent = 'przyspieszamy';
    countdownStatus.style.color = '#47c9ff';
  } else {
    countdownStatus.textContent = 'przelew w drodze';
    countdownStatus.style.color = '#9eb5d4';
  }

  remaining -= 1;
}

setInterval(updateCountdown, 10);
updateCountdown();

const testimonials = document.querySelectorAll('.testimonial');
let activeIndex = 0;

function rotateTestimonials() {
  testimonials[activeIndex].classList.remove('active');
  activeIndex = (activeIndex + 1) % testimonials.length;
  testimonials[activeIndex].classList.add('active');
}

setInterval(rotateTestimonials, 4000);
