import React, { useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import LoadingSpinner from './LoadingSpinner';

const InfiniteScroll = ({ 
  children, 
  onLoadMore, 
  hasMore, 
  loading, 
  threshold = 100,
  className = ''
}) => {
  const { isDarkMode } = useTheme();
  const observerRef = useRef();
  const loadingRef = useRef();

  const lastElementRef = useCallback(node => {
    if (loading) return;
    
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore();
      }
    }, {
      rootMargin: `${threshold}px`
    });
    
    if (node) observerRef.current.observe(node);
  }, [loading, hasMore, onLoadMore, threshold]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className={className}>
      {children}
      
      {hasMore && (
        <div 
          ref={lastElementRef}
          className="flex justify-center items-center py-8"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <LoadingSpinner size="sm" />
              <span className={`text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Loading more...
              </span>
            </div>
          ) : (
            <div className="h-4" /> // Invisible element to trigger intersection
          )}
        </div>
      )}
      
      {!hasMore && children && React.Children.count(children) > 0 && (
        <div className="flex justify-center items-center py-8">
          <span className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            No more items to load
          </span>
        </div>
      )}
    </div>
  );
};

export default InfiniteScroll; 