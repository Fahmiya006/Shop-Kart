import { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './Home.css';



export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [error, setError] = useState('');
  const [categories, setCategories] = useState(['All']);

  const fetchProducts = async (search = '', category = '') => {
    setLoading(true);
    setError('');
    try {
      let url = '/api/products?';
      if (search) url += `keyword=${search}&`;
      if (category && category !== 'All') url += `category=${category}`;
      const { data } = await axios.get(url);
setProducts(data);
const allProducts = await axios.get('/api/products');
const cats = ['All', ...new Set(allProducts.data.map(p => p.category))];
setCategories(cats);
    } catch (err) {
      setError('Failed to load products. Make sure the server is running.');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts(keyword, activeCategory);
    // eslint-disable-next-line
  }, [activeCategory]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(keyword, activeCategory);
  };

  return (
    <div className="home-page">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-content">
          <h1 className="hero-title">Discover Amazing Products</h1>
          <p className="hero-subtitle">Shop the latest trends at unbeatable prices</p>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search products..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">Search</button>
          </form>
        </div>
      </div>

      <div className="home-content">
        {/* Category Filters */}
        <div className="category-filters">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="loading-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton-card">
                <div className="skeleton-img"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line short"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="error-box">
            <p>⚠️ {error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <p>😕 No products found. Try a different search.</p>
          </div>
        ) : (
          <>
            <p className="results-count">{products.length} product{products.length !== 1 ? 's' : ''} found</p>
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}