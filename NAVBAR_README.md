# MealMatch Navigation Bar

A responsive React navigation bar component designed for the MealMatch meal planning application.

## Features

✅ **Responsive Design** - Adapts to desktop, tablet, and mobile screens
✅ **Active Link Highlighting** - Shows which page is currently active
✅ **Mobile Menu Toggle** - Hamburger menu for smaller screens
✅ **Light Theme** - Clean, modern design with green accent colors
✅ **Emoji Icons** - Visual indicators for each navigation section
✅ **Smooth Animations** - Transitions and hover effects

## Navigation Items

Based on the MealMatch ER diagram, the navbar includes:

1. **Dashboard** 📊 - Overview and home page
2. **Meal Plans** 📅 - Weekly meal planning interface
3. **Recipes** 👨‍🍳 - Browse and search recipes
4. **Inventory** 📦 - Manage user pantry/ingredients
5. **Shopping List** 🛒 - View and manage shopping items
6. **Favorites** ❤️ - Saved favorite recipes
7. **Profile** 👤 - User account settings
8. **Logout** 🚪 - Sign out of application

## Usage

### Basic Integration

```jsx
import React from 'react';
import Navbar from './Navbar';
import App from './App';

function Main() {
  return (
    <>
      <Navbar />
      <App />
    </>
  );
}

export default Main;
```

### Component Props

The current implementation uses internal state. To make it more flexible, you can extend it with props:

```jsx
<Navbar 
  onLogout={handleLogout}
  userName="John Doe"
/>
```

## Customization

### Colors

Edit the CSS variables in `Navbar.css`:

```css
:root {
  --primary-color: #2ecc71;        /* Green */
  --secondary-color: #27ae60;      /* Dark Green */
  --text-dark: #2c3e50;            /* Text Color */
  --text-light: #ecf0f1;           /* Light Text */
  --background-light: #f8f9fa;     /* Background */
  --border-color: #e0e0e0;         /* Borders */
}
```

### Icons

Replace emoji icons in `Navbar.jsx` with your preferred icon library (e.g., Font Awesome, Material Icons):

```jsx
import { FiHome, FiCalendar, FiChef } from 'react-icons/fi';

// Replace emoji with icons
<FiHome /> instead of 📊
<FiCalendar /> instead of 📅
// etc.
```

### Layout Variants

#### Using React Router for navigation:

```jsx
import { Link } from 'react-router-dom';

// Replace <a> tags with <Link>:
<Link to="/dashboard" className={`nav-link ${activeLink === '/dashboard' ? 'active' : ''}`}>
  📊 Dashboard
</Link>
```

## Responsive Breakpoints

- **Desktop** (>768px) - Full horizontal menu
- **Tablet** (481px - 768px) - Hamburger menu
- **Mobile** (<480px) - Compact hamburger menu

## File Structure

```
├── Navbar.jsx        # React component
├── Navbar.css        # Styling and responsive design
├── App.jsx           # Example usage
└── App.css           # App styling
```

## Database Integration

The navbar links correspond to the MealMatch entities:

| Link | Related Entity |
|------|---|
| Dashboard | User |
| Meal Plans | MealPlan, MealPlanEntry |
| Recipes | Recipe, MealPlanEntry |
| Inventory | UserInventory, Ingredient |
| Shopping List | ShoppingList, ShoppingListItem |
| Favorites | FavoriteRecipe |
| Profile | User |

## Accessibility

- Semantic HTML with `<nav>` element
- Keyboard navigable links
- Clear active state indication
- Readable contrast ratios
- Responsive font sizes

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- [ ] User profile dropdown menu
- [ ] Notification bell
- [ ] Search functionality
- [ ] Dark theme toggle
- [ ] Keyboard shortcuts
- [ ] Submenu support for categories
