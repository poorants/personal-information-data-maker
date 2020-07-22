import cliProgress from "cli-progress";

// min <= x < max
function random(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getBar(barName) {
  const bar = new cliProgress.SingleBar(
    {
      format: `${barName} | {bar} | {value}/{total} - {percentage}%`,
    },
    cliProgress.Presets.rect
  );
  return bar;
}

export default {
  random,
  getBar,
};
