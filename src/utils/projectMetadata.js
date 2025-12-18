const isString = (v) => typeof v === 'string' && v.trim().length > 0;
const normalizeCategory = (value) =>
  isString(value) ? value.trim().toUpperCase() : '';

export const hasMatlabTag = (project = {}) => {
  const tags = Array.isArray(project?.tags) ? project.tags : [];
  // Accept variations like "MATLAB/Simulink", "mat lab", etc.
  return tags.some((t) =>
    isString(t) && t.toLowerCase().replace(/\s+/g, '').includes('matlab')
  );
};

/**
 * Normalize to a single, canonical category used for BOTH filtering and display.
 * Rule: If it has a MATLAB tag, it's MATLAB (even if category says EEE/CSE).
 */
export const getDisplayCategory = (project = {}) => {
  const source = normalizeCategory(project?._sourceCategory);
  if (source === 'MATLAB' || hasMatlabTag(project)) return 'MATLAB';

  if (['CSE', 'EEE', 'ECE', 'MECH'].includes(source)) return source;

  const raw = normalizeCategory(project?.category);
  if (['CSE', 'EEE', 'ECE', 'MECH', 'MATLAB'].includes(raw)) return raw;
  return 'GENERAL';
};

/**
 * Returns the primary bucket we use for filtering in the Projects view.
 * Falls back to CSE so mixed/unknown categories appear under a sensible tab.
 */
export const getPrimaryCategory = (project = {}) => {
  const source = normalizeCategory(project?._sourceCategory);
  if (source === 'MATLAB' || hasMatlabTag(project)) return 'MATLAB';
  if (['EEE', 'ECE', 'MECH'].includes(source)) return source;
  if (source === 'CSE') return 'CSE';

  const canonical = getDisplayCategory(project);

  if (canonical === 'MATLAB') return 'MATLAB';
  if (canonical === 'EEE') return 'EEE';
  if (canonical === 'ECE') return 'ECE';
  if (canonical === 'MECH') return 'MECH';

  // Treat everything else (including GENERAL) as CSE to avoid an empty filter bucket.
  return 'CSE';
};

const escapeRegExp = (value = '') =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const keywordMatch = (text, terms = []) =>
  terms.some((term) => {
    const normalized = String(term || '').toLowerCase().trim();
    if (!normalized) return false;
    if (normalized.length <= 2) {
      const pattern = new RegExp(`\\b${escapeRegExp(normalized)}\\b`, 'i');
      return pattern.test(text);
    }
    return text.includes(normalized);
  });

const getProjectSearchText = (project = {}) => {
  const base = [
    project.title,
    project.shortDescription,
    project.description,
    project.category,
    ...(Array.isArray(project.tags) ? project.tags : [])
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return base;
};

const ANDROID_KEYWORDS = [
  'android',
  'apk',
  'android studio',
  'kotlin',
  'java app',
  'mobile app',
  'mobile application',
  'play store',
  'flutter'
];

const ML_KEYWORDS = [
  'machine learning',
  'ml',
  'artificial intelligence',
  'ai',
  'predict',
  'prediction',
  'predictive',
  'classification',
  'regression',
  'svm',
  'support vector',
  'random forest',
  'data science',
  'data mining',
  'nlp',
  'natural language',
  'sentiment analysis',
  'k-means',
  'logistic regression',
  'decision tree'
];

const DL_KEYWORDS = [
  'deep learning',
  'cnn',
  'convolutional neural',
  'rnn',
  'lstm',
  'transformer',
  'bert',
  'gpt',
  'neural network',
  'neural-net',
  'vision transformer',
  'resnet',
  'mobilenet',
  'yolov',
  'ssd',
  'object detection',
  'segmentation'
];

const WEB_KEYWORDS = [
  'web',
  'website',
  'webapp',
  'web app',
  'html',
  'css',
  'javascript',
  'react',
  'next.js',
  'nextjs',
  'vue',
  'angular',
  'frontend',
  'front-end',
  'backend',
  'back-end',
  'full stack',
  'full-stack',
  'mern',
  'mean',
  'django',
  'flask',
  'node',
  'express',
  'php',
  'laravel',
  'wordpress',
  'tailwind',
  'bootstrap'
];

export const getCseSubCategory = (project = {}) => {
  const text = getProjectSearchText(project);
  if (!text) return 'OTHER';

  if (keywordMatch(text, DL_KEYWORDS)) return 'DL';
  if (keywordMatch(text, ANDROID_KEYWORDS)) return 'ANDROID';
  if (keywordMatch(text, ML_KEYWORDS)) return 'ML';
  if (keywordMatch(text, WEB_KEYWORDS)) return 'WEB';

  return 'OTHER';
};

export const isAndroidProject = (project = {}) =>
  getCseSubCategory(project) === 'ANDROID';
