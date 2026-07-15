export type MenuItem = {
  name: string;
  description?: string;
  price: number | { label: string; price: number }[];
  note?: string;
  featured?: boolean;
};

export type MenuCategory = {
  id: "pizza" | "coffee" | "dolci";
  name: string;
  kicker: string;
  items: MenuItem[];
};

export const menu: MenuCategory[] = [
  {
    id: "pizza",
    name: "Pizza",
    kicker: "Six rides. One very hot oven.",
    items: [
      { name: "Bianca & Dip", description: "EVOO, rosemary, sea salt and fresh dip", price: 40, featured: true },
      { name: "Primavera", description: "Tomatoes, mozzarella and basil", price: 80 },
      { name: "Veloce", description: "Butternut, feta, onions and sunflower seeds", price: 100 },
      { name: "Sprint", description: "Salami, caramelised onions and hot honey", price: 120 },
      { name: "Arcobaleno", description: "Salami, feta, mushrooms and rocket", price: 140 },
      { name: "Rally", description: "BBQ glaze, smoked chicken, mushrooms and avocado", price: 150, featured: true },
    ],
  },
  {
    id: "coffee",
    name: "Coffee",
    kicker: "For before, after, or instead of sensible decisions.",
    items: [
      { name: "Espresso", price: [{ label: "Single", price: 15 }, { label: "Double", price: 20 }] },
      { name: "Americano", price: 30 },
      { name: "Cappuccino", price: 30 },
      { name: "Flat White", price: 30 },
      { name: "Latte", price: 35 },
      { name: "Mocha", price: 40 },
      { name: "Hot Chocolate", price: 35 },
      { name: "Chai", price: 35 },
      { name: "Cortado", price: 35 },
      { name: "Iced Coffee", price: 40 },
      { name: "Decaf", price: 10, note: "Board listing — please confirm whether this is an add-on." },
      { name: "Tea", price: 15 },
    ],
  },
  {
    id: "dolci",
    name: "Dolci",
    kicker: "Something sweet. No speech required.",
    items: [
      { name: "Crema Dulce", price: 40 },
      { name: "Gelato", description: "Nut Biscoff · Vanilla hot honey · Berries", price: 45 },
      { name: "Limoncello", price: 65 },
    ],
  },
];

export const zar = (value: number) => `R${value}`;
