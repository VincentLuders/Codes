
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search-input');
  const resultsContainer = document.getElementById('results-container');
  const settingsButton = document.getElementById('settings-button');
  const sortRelevanceButton = document.getElementById('sort-relevance');
  const sortDateNewestButton = document.getElementById('sort-date-newest');
  const sortDateOldestButton = document.getElementById('sort-date-oldest');

  // Default sort method
  let currentSortMethod = 'date-newest';

  // Colors for highlighting different search terms
  const highlightColors = [
    '#FF00FF', '#00FF00', '#FF0000', '#00FFFF', '#FFA500', 
    '#0000FF', '#FF69B4', '#32CD32', '#8A2BE2', '#FF1493'
  ];

  // Event listeners for search input and sorting buttons
  searchInput.addEventListener('input', debounce(performSearch, 300));
  settingsButton.addEventListener('click', openSettings);
  sortRelevanceButton.addEventListener('click', () => {
    currentSortMethod = 'relevance';
    performSearch();
  });
  sortDateNewestButton.addEventListener('click', () => {
    currentSortMethod = 'date-newest';
    performSearch();
  });
  sortDateOldestButton.addEventListener('click', () => {
    currentSortMethod = 'date-oldest';
    performSearch();
  });

  // Set focus to search input on load and when Ctrl+F is pressed
  searchInput.focus();
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      searchInput.focus();
    }
  });

  // Set focus to search input when Tab is pressed
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      searchInput.focus();
    }
  });

  // Debounce function to limit how often a function is called
  function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // Main search function
  function performSearch() {
    const query = searchInput.value;
    chrome.storage.local.get(['pages'], result => {
      const pages = result.pages || [];
      const searchResults = query ? searchPages(pages, query) : pages;
      const sortedResults = sortResults(searchResults);
      displayResults(sortedResults, query);
    });
  }

  // Function to search pages based on query
  function searchPages(pages, query) {
    const terms = parseQuery(query);
    return pages.filter(page => {
      const pageContent = (page.content + ' ' + page.url + ' ' + page.title).toLowerCase();
      return terms.every(term => {
        if (term.type === 'positive') {
          return pageContent.includes(term.value);
        } else if (term.type === 'negative') {
          return !pageContent.includes(term.value);
        } else if (term.type === 'phrase') {
          return pageContent.includes(term.value.toLowerCase());
        }
      });
    });
  }

  // Function to parse the search query into terms
  function parseQuery(query) {
    const terms = [];
    let currentTerm = '';
    let inQuotes = false;

    for (let i = 0; i < query.length; i++) {
      if (query[i] === '"') {
        if (inQuotes) {
          terms.push({ type: 'phrase', value: currentTerm });
          currentTerm = '';
        }
        inQuotes = !inQuotes;
      } else if (query[i] === ' ' && !inQuotes) {
        if (currentTerm) {
          if (currentTerm.startsWith('-')) {
            terms.push({ type: 'negative', value: currentTerm.slice(1).toLowerCase() });
          } else {
            terms.push({ type: 'positive', value: currentTerm.toLowerCase() });
          }
          currentTerm = '';
        }
      } else {
        currentTerm += query[i];
      }
    }

    if (currentTerm) {
      if (inQuotes) {
        terms.push({ type: 'phrase', value: currentTerm });
      } else if (currentTerm.startsWith('-')) {
        terms.push({ type: 'negative', value: currentTerm.slice(1).toLowerCase() });
      } else {
        terms.push({ type: 'positive', value: currentTerm.toLowerCase() });
      }
    }

    return terms;
  }

  // Function to sort results based on current sort method
  function sortResults(results) {
    if (currentSortMethod === 'date-newest') {
      return results.sort((a, b) => b.timestamp - a.timestamp);
    } else if (currentSortMethod === 'date-oldest') {
      return results.sort((a, b) => a.timestamp - b.timestamp);
    } else {
      // For relevance, keep the order as is
      return results;
    }
  }

  // Function to display search results
  function displayResults(results, query) {
    resultsContainer.innerHTML = '';
    if (results.length === 0) {
      resultsContainer.innerHTML = '<p>No results found.</p>';
      return;
    }
    results.forEach(result => {
      const resultElement = document.createElement('div');
      resultElement.classList.add('result');
      const snippets = getSnippets(result.content, query);
      resultElement.innerHTML = `
        <h3><a href="${result.url}" target="_blank">${result.title || 'Untitled'}</a></h3>
        <div class="snippet-container">
          <p>${snippets.slice(0, 10).join('<hr>')}</p>
        </div>
        ${snippets.length > 10 ? '<button class="show-more">Show more</button>' : ''}
        <small>${formatDate(result.timestamp)}</small>
      `;
      resultsContainer.appendChild(resultElement);

      if (snippets.length > 10) {
        const showMoreButton = resultElement.querySelector('.show-more');
        showMoreButton.addEventListener('click', () => {
          const snippetContainer = resultElement.querySelector('.snippet-container');
          snippetContainer.innerHTML = `
            <p>${snippets.join('<hr>')}</p>
            <button class="show-less">Show less</button>
          `;
          const showLessButton = snippetContainer.querySelector('.show-less');
          showLessButton.addEventListener('click', () => {
            snippetContainer.innerHTML = `
              <p>${snippets.slice(0, 10).join('<hr>')}</p>
            `;
            showMoreButton.style.display = 'block';
          });
          showMoreButton.style.display = 'none';
        });
      }
    });
  }

  // Function to get relevant snippets from content
  function getSnippets(content, query) {
    const terms = parseQuery(query);
    const lines = content.split('\n');
    const relevantLines = lines.filter(line => 
      terms.some(term => 
        line.toLowerCase().includes(term.type === 'phrase' ? term.value.toLowerCase() : term.value)
      )
    );

    return relevantLines.map(line => 
      highlightText(line.trim(), terms)
    );
  }

  // Function to highlight search terms in text
  function highlightText(text, terms) {
    const positiveTerms = terms.filter(term => term.type !== 'negative');
    positiveTerms.forEach((term, index) => {
      const color = highlightColors[index % highlightColors.length];
      const regex = new RegExp(`(${term.value})`, 'gi');
      text = text.replace(regex, `<span style="background-color: ${color}; color: black;">$1</span>`);
    });
    return text;
  }

  // Function to format date in European style
  function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
  }

  // Function to open settings page
  function openSettings() {
    window.location.href = 'options.html';
  }

  // Load recent history on startup
  performSearch();
});
