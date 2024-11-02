// App.jsx
import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ProductList from './components/ProductList';
import ProductPicker from './components/ProductPicker';
import { Button } from '@/components/ui/button';

const App = () => {
  const [products, setProducts] = useState([]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const handleAddProduct = () => {
    setProducts([...products, { id: Date.now(), variants: [] }]);
  };

  const handleProductUpdate = (newProducts, index) => {
    const updatedProducts = [...products];
    updatedProducts.splice(index, 1, ...newProducts);
    setProducts(updatedProducts);
    setIsPickerOpen(false);
    setEditingIndex(null);
  };

  const handleMoveProduct = (dragIndex, hoverIndex) => {
    const dragProduct = products[dragIndex];
    const newProducts = [...products];
    newProducts.splice(dragIndex, 1);
    newProducts.splice(hoverIndex, 0, dragProduct);
    setProducts(newProducts);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Product Management</h1>
        <ProductList 
          products={products}
          setProducts={setProducts}
          onEdit={(index) => {
            setEditingIndex(index);
            setIsPickerOpen(true);
          }}
          onMove={handleMoveProduct}
        />
        <Button 
          className="mt-4"
          onClick={handleAddProduct}
        >
          Add Product
        </Button>
        
        {isPickerOpen && (
          <ProductPicker
            isOpen={isPickerOpen}
            onClose={() => setIsPickerOpen(false)}
            onSelect={(selectedProducts) => handleProductUpdate(selectedProducts, editingIndex)}
          />
        )}
      </div>
    </DndProvider>
  );
};

export default App;