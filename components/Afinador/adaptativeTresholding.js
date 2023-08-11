const MIN_THRESHOLD = 0.01;
const THRESHOLD_MULTIPLIER = 2;

function getAdaptiveThreshold(audioData, previousThreshold) {
  let sum = 0;
  for (let i = 0; i < audioData.length; i++) {
    sum += Math.abs(audioData[i]);
  }
  let avg = sum / audioData.length;
  let threshold = Math.max(avg * THRESHOLD_MULTIPLIER, MIN_THRESHOLD);
  if (previousThreshold) {
    threshold = (previousThreshold + threshold) / 2;
  }
  return threshold;
}

// Example usage:
let audioData = [0.1, 0.2, 0.3, 0.4, 0.5];
let threshold = getAdaptiveThreshold(audioData);
console.log(threshold); // 0.3