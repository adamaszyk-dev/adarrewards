const countdownEl = document.getElementById('countdown');
const countdownStatus = document.getElementById('countdown-status');
let remaining = 300;

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(1, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function updateCountdown() {
  countdownEl.textContent = formatTime(Math.max(0, remaining));
  if (remaining <= 0) {
    countdownStatus.textContent = 'przelew wysłany';
    countdownStatus.style.color = '#2ff0a0';
    remaining = 300;
    setTimeout(() => {
      countdownStatus.textContent = 'przelew w drodze';
      countdownStatus.style.color = '#9eb5d4';
    }, 1200);
  } else if (remaining <= 60) {
    countdownStatus.textContent = 'ostatnie sekundy';
    countdownStatus.style.color = '#ff3b53';
  } else if (remaining <= 180) {
    countdownStatus.textContent = 'przyspieszamy';
    countdownStatus.style.color = '#3ab4ff';
  } else {
    countdownStatus.textContent = 'przelew w drodze';
    countdownStatus.style.color = '#9eb5d4';
  }
  remaining -= 5;
}

setInterval(updateCountdown, 5000);
updateCountdown();

const testimonials = document.querySelectorAll('.testimonial');
let activeIndex = 0;

function rotateTestimonials() {
  testimonials[activeIndex].classList.remove('active');
  activeIndex = (activeIndex + 1) % testimonials.length;
  testimonials[activeIndex].classList.add('active');
}

setInterval(rotateTestimonials, 4000);
