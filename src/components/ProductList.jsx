// components/ProductList.jsx
import React, { useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, X, ChevronDown, ChevronUp } from 'lucide-react';

const ProductItem = ({ product, index, onEdit, onRemove, onMove, showRemove }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'PRODUCT',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'PRODUCT',
    hover: (item, monitor) => {
      if (item.index === index) return;
      onMove(item.index, index);
      item.index = index;
    },
  });

  const [showVariants, setShowVariants] = useState(false);
  const [discount, setDiscount] = useState({ type: 'flat', value: 0 });

  return (
    <div ref={(node) => drag(drop(node))} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <img 
              src={product.image?.src} 
              alt={product.title} 
              className="w-16 h-16 object-cover rounded"
            />
            <div>
              <h3 className="font-semibold">{product.title}</h3>
              {product.variants.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowVariants(!showVariants)}
                >
                  {showVariants ? (
                    <ChevronUp className="mr-2 h-4 w-4" />
                  ) : (
                    <ChevronDown className="mr-2 h-4 w-4" />
                  )}
                  {showVariants ? 'Hide' : 'Show'} Variants
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(index)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            {showRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-4">
            <select
              className="border rounded p-2"
              value={discount.type}
              onChange={(e) => setDiscount({ ...discount, type: e.target.value })}
            >
              <option value="flat">Flat</option>
              <option value="percentage">Percentage</option>
            </select>
            <Input
              type="number"
              value={discount.value}
              onChange={(e) => setDiscount({ ...discount, value: e.target.value })}
              className="w-24"
            />
          </div>
        </div>

        {showVariants && product.variants.length > 1 && (
          <div className="space-y-2">
            {product.variants.map((variant) => (
              <div 
                key={variant.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <span>{variant.title}</span>
                <span>${variant.price}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

const ProductList = ({ products, onEdit, onMove, setProducts }) => {
  return (
    <div>
      {products.map((product, index) => (
        <ProductItem
          key={product.id}
          product={product}
          index={index}
          onEdit={onEdit}
          onRemove={(index) => {
            const newProducts = [...products];
            newProducts.splice(index, 1);
            setProducts(newProducts);
          }}
          onMove={onMove}
          showRemove={products.length > 1}
        />
      ))}
    </div>
  );
};

export default ProductList;