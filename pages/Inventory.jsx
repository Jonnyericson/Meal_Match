import React, { useState } from 'react';

const initialIngredients = [
  { id: 1, name: 'Eggs', quantity: '12', category: 'Dairy', notes: 'Breakfast staples' },
  { id: 2, name: 'Spinach', quantity: '1 bag', category: 'Produce', notes: 'Use this week' },
];

const Inventory = () => {
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    category: 'Produce',
    notes: '',
  });
  const [ingredients, setIngredients] = useState(initialIngredients);
  const [statusMessage, setStatusMessage] = useState('Add a fresh ingredient to keep your kitchen organized.');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setStatusMessage('Please enter an ingredient name before saving it.');
      return;
    }

    const newIngredient = {
      id: Date.now(),
      name: formData.name.trim(),
      quantity: formData.quantity.trim() || '1',
      category: formData.category,
      notes: formData.notes.trim(),
    };

    setIngredients((prev) => [newIngredient, ...prev]);
    setStatusMessage(`${newIngredient.name} was added to your inventory.`);
    setFormData({ name: '', quantity: '', category: 'Produce', notes: '' });
  };

  const handleRemove = (id) => {
    const removedItem = ingredients.find((ingredient) => ingredient.id === id);
    setIngredients((prev) => prev.filter((ingredient) => ingredient.id !== id));
    if (removedItem) {
      setStatusMessage(`${removedItem.name} was removed from your inventory.`);
    }
  };

  return (
    <section className="inventory-page">
      <div className="inventory-header">
        <div>
          <p className="inventory-eyebrow">Pantry planner</p>
          <h1>Inventory</h1>
          <p className="inventory-intro">Track what you have on hand and make meal planning feel effortless.</p>
        </div>
        <div className="inventory-pill">{ingredients.length} items stocked</div>
      </div>

      <div className="inventory-grid">
        <form className="inventory-form" onSubmit={handleSubmit}>
          <h2>Add an ingredient</h2>
          <label>
            Ingredient name
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Tomatoes"
            />
          </label>

          <label>
            Quantity
            <input
              type="text"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="e.g. 2 lbs"
            />
          </label>

          <label>
            Category
            <select name="category" value={formData.category} onChange={handleChange}>
              <option value="Produce">Produce</option>
              <option value="Dairy">Dairy</option>
              <option value="Protein">Protein</option>
              <option value="Pantry">Pantry</option>
              <option value="Frozen">Frozen</option>
            </select>
          </label>

          <label>
            Notes
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Any prep or storage notes?"
            />
          </label>

          <button type="submit">Add ingredient</button>
        </form>

        <div className="inventory-panel">
          <div className="inventory-status">
            <div>
              <h2>Current pantry</h2>
              <p>{statusMessage}</p>
            </div>
          </div>

          <ul className="inventory-list">
            {ingredients.map((ingredient) => (
              <li key={ingredient.id} className="inventory-item">
                <div>
                  <div className="inventory-item-top">
                    <h3>{ingredient.name}</h3>
                    <span>{ingredient.category}</span>
                  </div>
                  <p>{ingredient.quantity}</p>
                  {ingredient.notes ? <small>{ingredient.notes}</small> : null}
                </div>
                <button type="button" onClick={() => handleRemove(ingredient.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Inventory;
