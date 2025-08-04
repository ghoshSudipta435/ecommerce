import React from 'react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isDarkMode } = useTheme();

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating
              ? 'text-yellow-400 fill-current'
              : 'text-gray-300 dark:text-gray-600'
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <div className={`group relative bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden ${
      isDarkMode ? 'border border-gray-700' : 'border border-gray-200'
    }`}>
      {/* Product Image */}
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 dark:bg-gray-700">
        <img
          src={product.image || 'https://via.placeholder.com/300x300?text=Product'}
          alt={product.name}
          className="h-48 w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Category Badge */}
      <div className="absolute top-2 left-2">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
          {product.category}
        </span>
      </div>

      {/* Wishlist Button */}
      <button className="absolute top-2 right-2 p-1 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
        <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
      </button>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className={`text-lg font-semibold mb-2 line-clamp-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {renderStars(product.rating || 0)}
          </div>
          <span className={`ml-2 text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            ({product.reviews || 0} reviews)
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              ${product.price}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className={`text-sm line-through ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                ${product.originalPrice}
              </span>
            )}
          </div>
          {product.discount && (
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Product Details */}
        <div className={`text-sm mb-4 space-y-1 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {product.brand && (
            <p><span className="font-medium">Brand:</span> {product.brand}</p>
          )}
          {product.author && (
            <p><span className="font-medium">Author:</span> {product.author}</p>
          )}
          {product.publication && (
            <p><span className="font-medium">Publication:</span> {product.publication}</p>
          )}
          {product.size && (
            <p><span className="font-medium">Size:</span> {product.size}</p>
          )}
          {product.gender && (
            <p><span className="font-medium">Gender:</span> {product.gender}</p>
          )}
          {product.dietary && (
            <p><span className="font-medium">Dietary:</span> {product.dietary}</p>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard; 