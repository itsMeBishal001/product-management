// components/ProductPicker.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Search } from 'lucide-react';

const ProductPicker = ({ isOpen, onClose, onSelect }) => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://stageapi.monkcommerce.app/task/products/search?search=${search}&page=${page}`,
        {
          headers: {
            'x-api-key': process.env.VITE_API_KEY
          }
        }
      );
      const data = await response.json();
      setProducts(prev => page === 0 ? data : [...prev, ...data]);
      setHasMore(data.length > 0);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  const lastProductRef = useRef();
  useEffect(() => {
    if (loading) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });

    if (lastProductRef.current) {
      observer.current.observe(lastProductRef.current);
    }
  }, [loading, hasMore]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleProductSelect = (product) => {
    setSelectedProducts(prev => 
      prev.find(p => p.id === product.id)
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Products</DialogTitle>
        </DialogHeader>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Search products..."
            value={search}
            onChange={handleSearch}
          />
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {products.map((product, index) => {
            const isLast = index === products.length - 1;
            return (
              <div
                key={product.id}
                ref={isLast ? lastProductRef : null}
                className="flex items-center gap-4 p-4 border-b"
              >
                <Checkbox
                  checked={selectedProducts.some(p => p.id === product.id)}
                  onCheckedChange={() => handleProductSelect(product)}
                />
                <img
                  src={product.image?.src}
                  alt={product.title}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <h3 className="font-semibold">{product.title}</h3>
                  <p className="text-sm text-gray-500">
                    {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            );
          })}
          {loading && <div className="p-4 text-center">Loading...</div>}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onSelect(selectedProducts)}>
            Add Selected ({selectedProducts.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductPicker;