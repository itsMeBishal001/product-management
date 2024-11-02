// src/services/api.js

/**
 * API Configuration
 */
const API_CONFIG = {
  BASE_URL: "http://stageapi.monkcommerce.app/task",
  ENDPOINTS: {
    PRODUCTS: "/products/search",
  },
  DEFAULT_LIMIT: 10,
};

/**
 * Error class for API-specific errors
 */
class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "APIError";
  }
}

/**
 * Create URL with query parameters
 */
const createUrl = (endpoint, params = {}) => {
  const url = new URL(API_CONFIG.BASE_URL + endpoint);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.append(key, value.toString());
    }
  });
  return url.toString();
};

/**
 * Fetch products with search, pagination, and limit
 * @param {Object} options
 * @param {string} options.search - Search query
 * @param {number} options.page - Page number (0-based)
 * @param {number} options.limit - Number of items per page
 * @param {string} options.apiKey - API key for authentication
 * @returns {Promise<Array>} Array of products
 */
export const fetchProducts = async ({
  search = "",
  page = 0,
  limit = API_CONFIG.DEFAULT_LIMIT,
  apiKey,
}) => {
  if (!apiKey) {
    throw new APIError("API key is required", 401);
  }

  try {
    const url = createUrl(API_CONFIG.ENDPOINTS.PRODUCTS, {
      search,
      page,
      limit,
    });

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new APIError(
        "Failed to fetch products",
        response.status,
        await response.json()
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError("Failed to fetch products", 500, {
      message: error.message,
    });
  }
};

/**
 * Hook for using the products API
 */
export const useProducts = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [products, setProducts] = React.useState([]);

  const fetchProductsData = React.useCallback(async (options) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts(options);
      setProducts(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    products,
    loading,
    error,
    fetchProducts: fetchProductsData,
  };
};

// Example usage in a component:
/*
const ProductList = () => {
  const { products, loading, error, fetchProducts } = useProducts();
  const apiKey = import.meta.env.VITE_API_KEY;

  React.useEffect(() => {
    fetchProducts({
      search: 'Hat',
      page: 0,
      limit: 10,
      apiKey
    });
  }, [fetchProducts]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <h2>{product.title}</h2>
          <img src={product.image.src} alt={product.title} />
          {product.variants.map(variant => (
            <div key={variant.id}>
              <p>{variant.title}</p>
              <p>${variant.price}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
*/
