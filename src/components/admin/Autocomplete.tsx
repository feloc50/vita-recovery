import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

interface AutocompleteProps {
  onSearch: (query: string) => Promise<Array<{ id: string; name: string }>>;
  onSelect: (item: { id: string; name: string }) => void;
  placeholder?: string;
}

export function Autocomplete({ onSearch, onSelect, placeholder }: AutocompleteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ id: string; name: string } | null>(null);
  const debouncedQuery = useDebounce(query, 300);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function searchItems() {
      if (!debouncedQuery) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        const searchResults = await onSearch(debouncedQuery);
        setResults(searchResults.slice(0, 5));
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }

    searchItems();
  }, [debouncedQuery, onSearch]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: { id: string; name: string }) => {
    setSelectedItem(item);
    setQuery(item.name);
    setShowResults(false);
    onSelect(item);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedItem(null);
          }}
          onFocus={() => setShowResults(true)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          placeholder={placeholder}
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="animate-spin h-4 w-4 border-2 border-primary-500 rounded-full border-t-transparent"></div>
          </div>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {results.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              className={`w-full text-left px-4 py-2 hover:bg-primary-50 ${
                selectedItem?.id === item.id ? 'bg-primary-50' : ''
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}