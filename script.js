const elements = {
  modelType: document.getElementById("modelType"),
  duration: document.getElementById("duration"),
  pps: document.getElementById("pps"),
  failed: document.getElementById("failed"),
  bytes: document.getElementById("bytes"),
  durationValue: document.getElementById("durationValue"),
  ppsValue: document.getElementById("ppsValue"),
  failedValue: document.getElementById("failedValue"),
  bytesValue: document.getElementById("bytesValue"),
  predictBtn: document.getElementById("predictBtn"),
  resultBox: document.getElementById("resultBox"),
};

function syncValue(input, output) {
  output.textContent = input.value;
  input.addEventListener("input", () => {
    output.textContent = input.value;
  });
}

syncValue(elements.duration, elements.durationValue);
syncValue(elements.pps, elements.ppsValue);
syncValue(elements.failed, elements.failedValue);
syncValue(elements.bytes, elements.bytesValue);

function normalize(value, min, max) {
  return (value - min) / (max - min);
}

function predictWithRandomForest(duration, pps, failed, bytes) {
  const pc1 =
    0.55 * normalize(pps, 1, 1000) +
    0.35 * normalize(failed, 0, 20) +
    0.1 * normalize(bytes, 1, 5000);

  const pc2 =
    0.45 * normalize(duration, 0, 120) +
    0.4 * normalize(bytes, 1, 5000) -
    0.15 * normalize(pps, 1, 1000);

  let votesForAttack = 0;
  if (pc1 > 0.58) votesForAttack += 1;
  if (pc2 > 0.42) votesForAttack += 1;
  if (failed >= 4) votesForAttack += 1;
  if (pps >= 700) votesForAttack += 1;
  if (bytes >= 3500 && duration < 15) votesForAttack += 1;

  const probability = (votesForAttack / 5) * 100;
  const label = votesForAttack >= 3 ? "Attack" : "Normal";

  return {
    model: "PCA + Random Forest",
    scoreDetails: `PC1=${pc1.toFixed(3)}, PC2=${pc2.toFixed(3)}`,
    probability,
    label,
  };
}

function predictWithDeepLearning(duration, pps, failed, bytes) {
  const anomalyScore =
    0.25 * normalize(duration, 0, 120) +
    0.35 * normalize(pps, 1, 1000) +
    0.3 * normalize(failed, 0, 20) +
    0.1 * normalize(bytes, 1, 5000);

  const probability = Math.min(100, anomalyScore * 125);
  const label = probability >= 55 ? "Attack" : "Normal";

  return {
    model: "Deep Learning (Autoencoder + LSTM)",
    scoreDetails: `Anomaly Score=${anomalyScore.toFixed(3)}`,
    probability,
    label,
  };
}

function predict() {
  const duration = Number(elements.duration.value);
  const pps = Number(elements.pps.value);
  const failed = Number(elements.failed.value);
  const bytes = Number(elements.bytes.value);
  const modelType = elements.modelType.value;

  const result =
    modelType === "dl"
      ? predictWithDeepLearning(duration, pps, failed, bytes)
      : predictWithRandomForest(duration, pps, failed, bytes);

  elements.resultBox.classList.remove("attack", "normal");
  elements.resultBox.classList.add(
    result.label === "Attack" ? "attack" : "normal"
  );

  elements.resultBox.innerHTML = `
    <strong>Model:</strong> ${result.model}<br />
    <strong>Predicted Label:</strong> ${result.label}<br />
    <strong>Attack Probability:</strong> ${result.probability.toFixed(1)}%<br />
    <strong>Score:</strong> ${result.scoreDetails}<br />
    <small>Educational simulation for website prototyping.</small>
  `;
}

elements.predictBtn.addEventListener("click", predict);
