'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import catalogService from '../services/catalogService';
import { getErrorMessage } from '../utils/errors';

/**
 * Reusable hook for accessing, searching, and filtering the library book catalog.
 * Decouples catalog state and networking from UI views.
 */
export function useCatalog(initialCategory = 'All') {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await catalogService.getResources();
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load catalog resources.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const categories = useMemo(() => {
    const set = new Set(['All']);
    resources.forEach((item) => {
      if (item?.category) set.add(item.category);
    });
    return Array.from(set);
  }, [resources]);

  const filteredResources = useMemo(() => {
    return resources.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item?.category === selectedCategory;
      const term = searchTerm.trim().toLowerCase();
      if (!term) return matchesCategory;

      const titleMatch = (item?.title || '').toLowerCase().includes(term);
      const authorMatch = (item?.author || '').toLowerCase().includes(term);
      const isbnMatch = (item?.isbn || '').toLowerCase().includes(term);
      const accessionMatch = (item?.accession_no || '').toLowerCase().includes(term);

      return matchesCategory && (titleMatch || authorMatch || isbnMatch || accessionMatch);
    });
  }, [resources, selectedCategory, searchTerm]);

  return {
    resources,
    filteredResources,
    categories,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    refreshCatalog: fetchCatalog,
  };
}

export default useCatalog;
