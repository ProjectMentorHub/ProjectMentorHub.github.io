// src/pages/Projects.jsx
import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

import ProjectCard from '../components/ProjectCard';
import FilterBar from '../components/FilterBar';
import SEO from '../components/SEO';

import allProjects from '../data/projects';
import { getDisplayCategory, getPrimaryCategory, getCseSubCategory } from '../utils/projectMetadata';
import { logProjectsSearch } from '../utils/localAnalytics';
const VALID_CATEGORIES = new Set(['CSE', 'EEE', 'ECE', 'MECH', 'MATLAB']);
const VALID_SUBCATEGORIES = new Set(['WEB', 'ML', 'DL']);
const CSE_SUBCATEGORY_OPTIONS = [
  { value: 'WEB', label: 'Web Development' },
  { value: 'ML', label: 'Machine Learning' },
  { value: 'DL', label: 'Deep Learning' }
];

const normalizeFilters = (next = {}) => {
  const rawCategory = next?.category ? String(next.category).trim().toUpperCase() : '';
  const category = VALID_CATEGORIES.has(rawCategory) ? rawCategory : '';
  const query = next?.query ? String(next.query).slice(0, 120) : '';
  const rawSub = next?.subCategory ? String(next.subCategory).trim().toUpperCase() : '';
  const subCategory = category === 'CSE' && VALID_SUBCATEGORIES.has(rawSub) ? rawSub : '';

  return { category, query, subCategory };
};

const parseFiltersFromSearch = (search = '') => {
  const params = new URLSearchParams(search);
  const categoryParam = params.get('category');
  const queryParam = params.get('query') ?? params.get('q');
  const subParam = params.get('sub') ?? params.get('subcategory');

  return normalizeFilters({
    category: categoryParam,
    query: queryParam,
    subCategory: subParam
  });
};

const SEARCH_SYNONYMS = {
  ai: ['artificial intelligence', 'machine learning', 'ml', 'deep learning'],
  ml: ['machine learning', 'artificial intelligence', 'deep learning'],
  'machine learning': ['ml', 'artificial intelligence', 'deep learning', 'neural networks'],
  'deep learning': ['neural networks', 'cnn', 'rnn'],
  iot: ['internet of things', 'embedded systems', 'smart devices'],
  robotic: ['robotics', 'automation', 'mechatronics'],
  robot: ['robotics', 'automation'],
  blockchain: ['web3', 'distributed ledger'],
  'web development': ['full stack', 'frontend', 'backend'],
  cloud: ['aws', 'azure', 'gcp', 'cloud computing'],
  'data science': ['analytics', 'machine learning', 'statistics'],
  matlab: ['simulink', 'mathworks'],
  'power systems': ['power', 'grid', 'electrical'],
  'image processing': ['computer vision', 'opencv'],
  vision: ['computer vision', 'image processing'],
  automation: ['robotics', 'iot', 'control systems'],
  biotech: ['bio technology', 'bioinformatics']
};

const tokenise = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9+/.\s-]+/g, ' ')
    .split(/[\s/,.+-]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1);

const buildKeywordIndex = (projects) => {
  const keywordMap = new Map();

  projects.forEach((project) => {
    const tokens = new Set([
      ...tokenise(project.title),
      ...tokenise(project.shortDescription),
      ...tokenise(project.description),
      ...(Array.isArray(project.tags)
        ? project.tags.flatMap((tag) => tokenise(tag))
        : [])
    ]);

    tokens.forEach((token) => {
      if (token.length < 3) return;
      const entry = keywordMap.get(token) || { keyword: token, count: 0 };
      entry.count += 1;
      keywordMap.set(token, entry);
    });
  });

  return keywordMap;
};

const expandTokensWithSynonyms = (tokens) => {
  const expanded = new Set(tokens);

  tokens.forEach((token) => {
    const synonyms = SEARCH_SYNONYMS[token];
    if (Array.isArray(synonyms)) {
      synonyms.forEach((synonym) => {
        expanded.add(synonym.toLowerCase());
        tokenise(synonym).forEach((childToken) => expanded.add(childToken));
      });
    }
  });

  return expanded;
};

const computeSuggestions = (query, keywordIndex) => {
  const suggestions = [];
  const trimmed = (query || '').toLowerCase().trim();

  const pushUnique = (label, source) => {
    const normalizedLabel = label.toLowerCase();
    if (
      !normalizedLabel ||
      suggestions.some((item) => item.label.toLowerCase() === normalizedLabel)
    ) {
      return;
    }
    suggestions.push({ label, source });
  };

  if (!trimmed) {
    const popular = Array.from(keywordIndex.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
    popular.forEach((entry) => pushUnique(entry.keyword, 'popular'));
    return suggestions;
  }

  const queryTokens = trimmed.split(/\s+/);
  const lastFragment = queryTokens[queryTokens.length - 1] || '';

  Array.from(keywordIndex.values())
    .filter((entry) => entry.keyword.startsWith(lastFragment) && entry.keyword !== lastFragment)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .forEach((entry) => pushUnique(entry.keyword, 'keyword'));

  const expandedTokens = expandTokensWithSynonyms([trimmed, ...queryTokens]);
  expandedTokens.forEach((token) => {
    if (token !== trimmed && token !== lastFragment) {
      pushUnique(token, 'synonym');
    }
  });

  return suggestions.slice(0, 10);
};

const FEATURED_CATEGORY_ORDER = ['CSE', 'EEE', 'MATLAB'];
const FEATURED_CATEGORY_TITLES = {
  CSE: 'CSE Projects',
  EEE: 'EEE Projects',
  MATLAB: 'MATLAB Projects'
};

const Projects = () => {
  // Source data
  const projects = allProjects;
  const lastLoggedSearchRef = useRef('');

  const location = useLocation();
  const navigate = useNavigate();

  // Filters (supports category + search query)
  const [filters, setFilters] = useState(() => parseFiltersFromSearch(location.search));

  useEffect(() => {
    const next = parseFiltersFromSearch(location.search);
    setFilters((prev) =>
      prev.category === next.category &&
      prev.query === next.query &&
      prev.subCategory === next.subCategory
        ? prev
        : next
    );
  }, [location.search]);

  const handleFilterChange = (next) => {
    const normalized = normalizeFilters(next);
    setFilters((prev) =>
      prev.category === normalized.category &&
      prev.query === normalized.query &&
      prev.subCategory === normalized.subCategory
        ? prev
        : normalized
    );

    const params = new URLSearchParams();
    if (normalized.category) params.set('category', normalized.category);
    if (normalized.query) params.set('query', normalized.query);
    if (normalized.subCategory) params.set('sub', normalized.subCategory);

    const nextSearch = params.toString();
    const currentSearch = location.search.startsWith('?')
      ? location.search.slice(1)
      : location.search;

    if (currentSearch !== nextSearch) {
      navigate(
        {
          pathname: location.pathname,
          search: nextSearch ? `?${nextSearch}` : ''
        },
        { replace: true }
      );
    }
  };

  // Derived list using the canonical category and search term
  const keywordIndex = useMemo(() => buildKeywordIndex(projects), [projects]);
  const suggestions = useMemo(
    () => computeSuggestions(filters.query, keywordIndex),
    [filters.query, keywordIndex]
  );

  const searchState = useMemo(() => {
    let scopedProjects = projects;

    if (filters.category) {
      const wanted = String(filters.category).trim().toUpperCase();
      scopedProjects = scopedProjects.filter(
        (project) => getPrimaryCategory(project) === wanted
      );
    }

    if (filters.category === 'CSE' && filters.subCategory) {
      scopedProjects = scopedProjects.filter(
        (project) => getCseSubCategory(project) === filters.subCategory
      );
    }

    const normalizedQuery = (filters.query || '').toLowerCase();
    const trimmedQuery = normalizedQuery.trim();

    if (!trimmedQuery) {
      return {
        orderedProjects: scopedProjects,
        topMatches: [],
        matchingCount: 0,
        normalizedQuery: '',
        topMatchIds: [],
        scores: scopedProjects.map((project) => ({
          project,
          score: 0
        }))
      };
    }

    const queryTokens = tokenise(trimmedQuery);
    const expandedTokens = expandTokensWithSynonyms(queryTokens);
    expandedTokens.add(trimmedQuery);

    const scored = scopedProjects.map((project) => {
      const searchableText = [
        project.title,
        project.shortDescription,
        project.description,
        project.category,
        ...(Array.isArray(project.tags) ? project.tags : [])
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      let score = 0;

      if (searchableText.includes(trimmedQuery)) {
        score += 12;
      }

      const tags = Array.isArray(project.tags)
        ? project.tags.map((tag) => String(tag).toLowerCase())
        : [];

      expandedTokens.forEach((token) => {
        if (token.length < 2) return;
        if (searchableText.includes(token)) {
          score += 4;
        }
        if (tags.some((tag) => tag.includes(token))) {
          score += 3;
        }
      });

      return {
        project,
        score
      };
    });

    const matches = scored.filter((entry) => entry.score > 0);
    const nonMatches = scored.filter((entry) => entry.score <= 0);

    matches.sort((a, b) => b.score - a.score);
    nonMatches.sort((a, b) => {
      if (a.project.title && b.project.title) {
        return a.project.title.localeCompare(b.project.title);
      }
      return 0;
    });

    const ordered =
      matches.length > 0 ? [...matches, ...nonMatches] : scored.sort((a, b) => b.score - a.score);

    return {
      orderedProjects: ordered.map((entry) => entry.project),
      topMatches: matches.slice(0, 12),
      matchingCount: matches.length,
      normalizedQuery: trimmedQuery,
      topMatchIds: matches.slice(0, 5).map((entry) => entry.project.id),
      scores: ordered
    };
  }, [projects, filters.category, filters.subCategory, filters.query]);

  const filteredProjects = searchState.orderedProjects;

  const featuredCategoryProjects = useMemo(() => {
    return FEATURED_CATEGORY_ORDER.map((category) => ({
      category,
      title: FEATURED_CATEGORY_TITLES[category] || `${category} Projects`,
      projects: projects
        .filter((project) => getPrimaryCategory(project) === category)
        .slice(0, 3)
    })).filter((entry) => entry.projects.length > 0);
  }, [projects]);

  const isDefaultAllView =
    !filters.category && !(filters.query || '').trim() && !filters.subCategory;

  useEffect(() => {
    const trimmedQuery = searchState.normalizedQuery;
    if (trimmedQuery.length < 2) {
      lastLoggedSearchRef.current = '';
      return;
    }

    const categoryKey =
      filters.category === 'CSE' && filters.subCategory
        ? `CSE:${filters.subCategory}`
        : filters.category || 'All';
    const fingerprint = searchState.topMatchIds.join('|');
    const cacheKey = `${categoryKey}::${trimmedQuery.toLowerCase()}::${fingerprint}::${filteredProjects.length}`;

    if (lastLoggedSearchRef.current === cacheKey) return;
    lastLoggedSearchRef.current = cacheKey;

    logProjectsSearch({
      query: trimmedQuery,
      category: categoryKey,
      totalResults: searchState.topMatches.length,
      results: searchState.topMatches.slice(0, 5).map(({ project }, index) => ({
        id: project.id,
        title: project.title,
        category: getDisplayCategory(project),
        rank: index + 1
      }))
    });
  }, [
    filters.category,
    filters.subCategory,
    searchState.normalizedQuery,
    filteredProjects.length,
    searchState.topMatchIds,
    searchState.topMatches
  ]);

  // Schema.org (uses the SAME canonical category to avoid mismatch)
  const itemListSchema = useMemo(() => {
    if (!filteredProjects.length) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Projects',
      itemListElement: filteredProjects.slice(0, 12).map((project, index) => ({
        '@type': 'Product',
        position: index + 1,
        name: project.title,
        description: project.description,
        category: getDisplayCategory(project),
        url: `https://projectmentorhub.com/project/${project.id}`,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'INR',
          price: project.price,
          availability: 'https://schema.org/InStock'
        }
      }))
    };
  }, [filteredProjects]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <SEO
        title="Projects"
        description="Browse ready-to-submit CSE, EEE, and MATLAB academic project kits complete with documentation, source code, and implementation guides."
        canonical="https://projectmentorhub.com/projects"
        type="website"
        schema={itemListSchema}
      />

      <div className="container mx-auto px-4 max-w-7xl">
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2">Projects</h1>
                <p className="text-gray-600 text-lg">
                  Browse our collection of premium project kits
                </p>
              </div>
              {filters.category === 'CSE' && (
                <div className="bg-white border border-black/10 rounded-2xl p-4 shadow-sm max-w-md">
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                    Custom CSE builds
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    We tailor CSE projects to your exact requirements—share your title, tech stack, and deadlines and we will build it for you.
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-2">
                    “Bring your ideas into action with us.”
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Pass through without changing your FilterBar API */}
          <FilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            suggestions={suggestions}
            onSuggestionSelect={(value) => {
              const current = String(filters.query || '').replace(/\s+$/, '');
              if (!current) {
                handleFilterChange({
                  ...filters,
                  query: value
                });
                return;
              }

              const parts = current.split(/\s+/);
              parts[parts.length - 1] = value;
              handleFilterChange({
                ...filters,
                query: parts.join(' ')
              });
            }}
            searchSummary={{
              query: filters.query,
              matching: searchState.matchingCount,
              total: filteredProjects.length
            }}
            subcategories={CSE_SUBCATEGORY_OPTIONS}
            onSubcategoryChange={(value) =>
              handleFilterChange({
                ...filters,
                category: 'CSE',
                subCategory: value
              })
            }
          />

          {filteredProjects.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No projects found matching your filters</p>
            </div>
          ) : isDefaultAllView ? (
            <div className="space-y-10">
              {featuredCategoryProjects.map((entry) => (
                <section key={entry.category} className="bg-white/70 p-6 border border-black/5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-400">Category</p>
                      <h2 className="text-2xl font-semibold">{entry.title}</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleFilterChange({
                          ...filters,
                          category: entry.category,
                          subCategory: ''
                        })
                      }
                      className="px-5 py-2 border border-black/20 text-sm font-semibold tracking-wide uppercase hover:bg-black hover:text-white transition"
                    >
                      Show All
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {entry.projects.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;
