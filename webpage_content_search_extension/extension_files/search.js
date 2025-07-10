document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  const resultsContainer = document.getElementById('results-container');

  searchButton.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      performSearch();
    }
  });

  function performSearch() {
    const query = searchInput.value;
    chrome.storage.local.get(['pages'], result => {
      const pages = result.pages || [];
      const searchResults = query ? searchPages(pages, query) : pages;
      const sortedResults = sortResults(searchResults);
      displayResults(sortedResults, query);
    });
  }

  function searchPages(pages, query) {
    const terms = query.toLowerCase().split(/\s+/);
    return pages.filter(page => {
      return terms.every(term => 
        page.content.toLowerCase().includes(term) || 
        page.url.toLowerCase().includes(term) ||
        page.title.toLowerCase().includes(term)
      );
    });
  }

  function sortResults(results) {
    return results.sort((a, b) => b.timestamp - a.timestamp);
  }

  function displayResults(results, query) {
    resultsContainer.innerHTML = '';
    if (results.length === 0) {
      resultsContainer.innerHTML = '<p>No results found.</p>';
      return;
    }
    results.forEach(result => {
      const resultElement = document.createElement('div');
      resultElement.classList.add('result');
      resultElement.innerHTML = `
        <h3><a href="${result.url}" target="_blank">${result.title}</a></h3>
        <p>${highlightText(getSnippet(result.content, query), query)}</p>
        <small>${new Date(result.timestamp).toLocaleString()}</small>
      `;
      resultsContainer.appendChild(resultElement);
    });
  }

  function getSnippet(content, query) {
    if (!query) return content.slice(0, 200) + '...';
    const words = content.split(/\s+/);
    const queryIndex = words.findIndex(word => word.toLowerCase().includes(query.toLowerCase()));
    const start = Math.max(0, queryIndex - 10);
    const end = Math.min(words.length, queryIndex + 11);
    return words.slice(start, end).join(' ') + '...';
  }

  function highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query.split(/\s+/).join('|')})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  }

  // Load recent history on startup
  performSearch();
});