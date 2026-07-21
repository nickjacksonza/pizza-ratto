export type MenuItem = {
  name: string;
  description?: string;
  price: number | { label: string; price: number }[];
  priceGroup?: string;
  note?: string;
  featured?: boolean;
};

export type MenuCategory = {
  id: "pizza" | "caffe" | "bevande" | "dolci";
  name: string;
  kicker: string;
  items: MenuItem[];
};

export const menu: MenuCategory[] = [
  {
    id: "pizza",
    name: "Pizza",
    kicker: "Twelve rides. One very hot oven.",
    items: [
      { name: "Bianca & Dip", description: "EVOO, rosemary, sea salt and fresh dip", price: 40, featured: true },
      { name: "Primavera", description: "Tomatoes, mozzarella and basil", price: 80 },
      { name: "Veloce", description: "Butternut, feta, onions and sunflower seeds", price: 100 },
      { name: "Sprint", description: "Salami, caramelised onions and hot honey", price: 120 },
      { name: "Arcobaleno", description: "Salami, feta, mushrooms and rocket", price: 140 },
      { name: "Bianca Pollo", description: "White base, smoked chicken, mushrooms and chives", price: 135, note: "New special · confirm availability" },
      { name: "Sole", description: "White base, yellow peppers, cherry tomatoes and mint", price: 110, note: "New special · confirm availability" },
      { name: "Rally", description: "BBQ glaze, smoked chicken, mushrooms and avocado", price: 150, featured: true },
      { name: "Bosco", description: "Tomatoes, mozzarella, mushrooms, garlic, rosemary and rocket", price: 125, note: "Concept special · confirm availability" },
      { name: "Bandito", description: "Spicy salami, red onion, roasted peppers, chilli and hot honey", price: 145, note: "Concept special · confirm availability" },
      { name: "Verde", description: "Pesto, mozzarella, courgette, artichokes, feta and rocket", price: 130, note: "Concept special · confirm availability" },
      { name: "Tramonto", description: "Roasted peppers, onions, feta, cherry tomatoes and basil", price: 125, note: "Concept special · confirm availability" },
    ],
  },
  {
    id: "caffe",
    name: "Caffè",
    kicker: "For before, after, or instead of sensible decisions.",
    items: [
      { name: "Espresso", price: [{ label: "Single", price: 15 }, { label: "Double", price: 20 }], priceGroup: "R15 / R20" },
      { name: "Decaf", price: 10, priceGroup: "R10", note: "Board listing — please confirm whether this is an add-on." },
      { name: "Americano", price: 30, priceGroup: "R30" },
      { name: "Cappuccino", price: 30, priceGroup: "R30" },
      { name: "Flat White", price: 30, priceGroup: "R30" },
      { name: "Latte", price: 35, priceGroup: "R35" },
      { name: "Cortado", price: 35, priceGroup: "R35" },
      { name: "Mocha", price: 40, priceGroup: "R40" },
      { name: "Iced Coffee", price: 40, priceGroup: "R40" },
    ],
  },
  {
    id: "bevande",
    name: "Bevande",
    kicker: "Beyond coffee. Still worth a stop.",
    items: [
      { name: "Tea", price: 15, priceGroup: "R15" },
      { name: "Hot Chocolate", price: 35, priceGroup: "R35" },
      { name: "Chai", price: 35, priceGroup: "R35" },
    ],
  },
  {
    id: "dolci",
    name: "Dolci",
    kicker: "Something sweet. No speech required.",
    items: [
      { name: "Crema Dulce", price: 40, priceGroup: "R40" },
      { name: "Gelato", description: "Nut Biscoff · Vanilla hot honey · Berries", price: 45, priceGroup: "R45" },
      { name: "Limoncello", price: 65, priceGroup: "R65" },
    ],
  },
];

export const zar = (value: number) => `R${value}`;
