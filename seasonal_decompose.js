function seasonal_decompose(data, period, model) {
  // Step 1: Calculate the rolling mean for the trend component
  let trend = [];
  let half = Math.floor(period / 2);
  for (let i = 0; i < data.length; i++) {
    let start = i - half;
    let end = i + half;
    if (start < 0) {
      end += Math.abs(start);
      start = 0;
    }
    if (end > data.length - 1) {
      start -= end - data.length + 1;
      end = data.length - 1;
    }
    let sum = data.slice(start, end + 1).reduce((acc, val) => acc + val.y, 0);
    trend.push({t: data[i].t, y: sum / (end - start + 1)});
  }

  // Step 2: Detrend the time series
  let detrended;
  if (model === "additive") {
    detrended = data.map((val, i) => ({t: val.t, y: val.y - trend[i].y}));
  } else {
    detrended = data.map((val, i) => ({t: val.t, y: val.y / trend[i].y}));
  }

  // Step 3: Calculate the seasonal component
  let seasonal = new Array(period).fill(0);
  let counts = new Array(period).fill(0);
  for (let i = 0; i < detrended.length; i++) {
    let index = i % period;
    seasonal[index] += detrended[i].y;
    counts[index]++;
  }
  for (let i = 0; i < seasonal.length; i++) {
    seasonal[i] /= counts[i];
  }
  seasonal = seasonal.flatMap((val) => new Array(Math.floor(data.length / period)).fill(val));

  // Step 4: Calculate the residual component
  let residual;
  if (model === "additive") {
    residual = data.map((val, i) => ({t: val.t, y: val.y - trend[i].y - seasonal[i]}));
  } else {
    residual = data.map((val, i) => ({t: val.t, y: val.y / (trend[i].y * seasonal[i])}));
  }

  return {
    trend: trend,
    seasonal: seasonal.map((val, i) => ({t: data[i].t, y: val})),
    residual: residual,
  };
}
