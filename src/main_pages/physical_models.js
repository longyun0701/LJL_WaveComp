const pi = Math.PI;

function sinWave(t, f, a) {
  const x0 = f * t * 2*pi;
  return Math.sin(x0)*a;

}
function sqrWave(t, f, a) {
  const x0 = (f * t * 2) % 2;
  if (x0 < 0.5 - 1 / pi || (x0 > 0.5 + 1 / pi && x0 < 1.5 - 1 / pi) || x0 > 1.5 + 1 / pi)
    return 0;
  if (x0 < 1)
    return a;
  else
    return -a;

}
function triWave(t, f, a) {
  const x0 = (f * t * 2) % 2;
  if (x0 < 0.5)
    return 8 / pi * x0 * a;
  if (x0 > 1.5)
    return 8 / pi * (x0 - 2) * a;
  return -8 / pi * (x0 - 1) * a;
}

export const waveTypes = {
    'sin': {
        name_cn: "正弦波",
        name_en: "sine",
        function: sinWave,
        abbr: 'sin',
    },
    'sqr': {
        name_cn: "方波",
        name_en: "square",
        function: sqrWave,
        abbr: 'sqr',
    },
    'tri': {
        name_cn: "三角波",
        name_en: "triangle",
        function: triWave,
        abbr: 'tri',
    },
};