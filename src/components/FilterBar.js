const FilterBar = ({
  filters,
  onFilterChange,
  suggestions = [],
  onSuggestionSelect = () => {},
  searchSummary = null,
  subcategories = [],
  onSubcategoryChange = () => {}
}) => {
  const categories = ['All', 'CSE', 'EEE', 'MATLAB'];
  const selectedSubcategory =
    filters.category === 'CSE'
      ? subcategories.find((option) => option.value === filters.subCategory)
      : null;
  let summaryMessage = '';

  if (searchSummary) {
    if (searchSummary.query) {
      summaryMessage =
        searchSummary.matching > 0
          ? `Highlighting ${searchSummary.matching} relevant project${
              searchSummary.matching === 1 ? '' : 's'
            } out of ${searchSummary.total}.`
          : `No direct matches yet—showing all ${searchSummary.total} projects sorted by relevance.`;
    } else if (selectedSubcategory) {
      summaryMessage = `Showing ${searchSummary.total} ${selectedSubcategory.label} project${
        searchSummary.total === 1 ? '' : 's'
      }.`;
    }
  }

  const handleCategoryChange = (category) => {
    onFilterChange({
      ...filters,
      category,
      subCategory: category === 'CSE' ? filters.subCategory : ''
    });
  };

  const handleSearchChange = (event) => {
    onFilterChange({ ...filters, query: event.target.value });
  };

  const handleSubcategoryChange = (value) => {
    const normalized = value === filters.subCategory ? '' : value;
    onSubcategoryChange(normalized);
  };

  return (
    <div className="bg-white border-b border-black/10 py-6 mb-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-2" htmlFor="projects-search">
              Search Projects
            </label>
            <input
              id="projects-search"
              type="search"
              value={filters.query || ''}
              onChange={handleSearchChange}
              placeholder="Search by title, keywords, or description"
              className="w-full px-4 py-2 border border-black/20 focus:outline-none focus:border-black transition-colors"
            />
            {summaryMessage && (
              <p className="mt-2 text-xs text-gray-500">{summaryMessage}</p>
            )}
            {/* Suggestions removed per requirements */}
            {filters.category === 'CSE' && subcategories.length > 0 && (
              <div className="mt-6 p-4 border border-black/10 bg-gray-50 rounded-2xl">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      CSE specialisations
                    </p>
                    <p className="text-sm text-gray-700">
                      Jump straight to Web Dev, ML, or Deep Learning tracks.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => handleSubcategoryChange('')}
                    className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition shadow-sm ${
                      !filters.subCategory
                        ? 'bg-black text-white'
                        : 'bg-white border border-black/20 text-gray-800 hover:border-black/40'
                    }`}
                  >
                    All CSE
                  </button>
                  {subcategories.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSubcategoryChange(option.value)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition shadow-sm ${
                        filters.subCategory === option.value
                          ? 'bg-black text-white'
                          : 'bg-white border border-black/20 text-gray-800 hover:border-black/40'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-semibold mb-3">Category / Domain</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat === 'All' ? '' : cat)}
                  className={`px-4 py-2 border transition-all ${
                    filters.category === (cat === 'All' ? '' : cat)
                      ? 'bg-black text-white border-black'
                      : 'border-black/20 text-black hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
