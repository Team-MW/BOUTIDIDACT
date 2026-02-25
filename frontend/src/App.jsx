import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Plus,
  Minus,
  Trash2,
  Printer,
  CheckCircle2,
  AlertCircle,
  Coffee,
  Utensils,
  IceCream,
  CupSoda,
  ShoppingBag,
  CreditCard,
  Banknote,
  Activity,
  X,
  LayoutDashboard,
  Package,
  Settings
} from 'lucide-react';
import logoUrl from './assets/logo.svg';

const CATEGORIES = [
  { id: 'all', name: 'Tout', icon: Activity, color: 'bg-gray-800 text-white' },
  { id: 'burgers', name: 'Burgers', icon: Utensils, color: 'bg-orange-100 text-orange-600' },
  { id: 'sides', name: 'Accompagnements', icon: Coffee, color: 'bg-yellow-100 text-yellow-600' },
  { id: 'drinks', name: 'Boissons', icon: CupSoda, color: 'bg-blue-100 text-blue-600' },
  { id: 'desserts', name: 'Desserts', icon: IceCream, color: 'bg-pink-100 text-pink-600' },
];

const PRODUCTS = [
  { id: 1, category: 'burgers', name: 'Le Classique', price: 8.50, image: '🍔', desc: 'Boeuf, Cheddar, Salade, Tomate' },
  { id: 2, category: 'burgers', name: 'Double Cheese', price: 10.50, image: '🧀', desc: 'Double Boeuf, Double Cheddar' },
  { id: 3, category: 'burgers', name: 'Bacon Smash', price: 11.00, image: '🥓', desc: 'Boeuf Smash, Bacon fumé, Oignons BBQ' },
  { id: 4, category: 'burgers', name: 'Chicken Crispy', price: 9.50, image: '🍗', desc: 'Poulet frit croustillant, Mayo épicée' },
  { id: 5, category: 'sides', name: 'Frites Maison', price: 3.00, image: '🍟', desc: 'Pommes de terre fraîches' },
  { id: 6, category: 'sides', name: 'Onion Rings', price: 4.00, image: '🧅', desc: 'Beignets d\'oignons croustillants' },
  { id: 7, category: 'sides', name: 'Cheddar Fries', price: 4.50, image: '🧀', desc: 'Frites avec sauce cheddar' },
  { id: 8, category: 'drinks', name: 'Coca-Cola', price: 2.50, image: '🥤', desc: 'Canette 33cl' },
  { id: 9, category: 'drinks', name: 'Ice Tea Pêche', price: 2.50, image: '🧃', desc: 'Canette 33cl' },
  { id: 10, category: 'drinks', name: 'Eau Minérale', price: 2.00, image: '💧', desc: 'Bouteille 50cl' },
  { id: 11, category: 'desserts', name: 'Tiramisu', price: 4.50, image: '🍮', desc: 'Fait maison, café et mascarpone' },
  { id: 12, category: 'desserts', name: 'Cheesecake', price: 5.00, image: '🍰', desc: 'Coulis fruits rouges' },
  { id: 13, category: 'desserts', name: 'Glace Vanille', price: 3.50, image: '🍨', desc: '2 boules artisanales' },
];

export default function App() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Carte Bancaire');
  const [isPrinting, setIsPrinting] = useState(false);
  const [printStatus, setPrintStatus] = useState(null); // 'success' | 'error' | null
  const [errorMessage, setErrorMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const filteredProducts = activeCategory === 'all'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === activeCategory);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart((prevCart) => {
      return prevCart.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + delta;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const removeFromCart = (id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckoutAndPrint = async () => {
    if (cart.length === 0) return;

    setIsPrinting(true);
    setPrintStatus(null);
    setErrorMessage("");

    const ticketData = {
      printerIp: "192.168.1.100", // À configurer pour l'ip réelle
      nomCommerce: "BOUTIDIDACT",
      ticketId: `TXN-${Math.floor(Math.random() * 100000)}`,
      items: cart.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      total: totalAmount,
      paiement: paymentMethod
    };

    try {
      const response = await axios.post('http://localhost:3001/api/print', ticketData);
      if (response.data.success) {
        setPrintStatus('success');
        setCart([]); // Vider le panier après succès (Optionnel)
      }
    } catch (error) {
      setPrintStatus('error');
      const msg = error.response?.data?.error || "Erreur de connexion avec l'imprimante réseau.";
      setErrorMessage(msg);
    } finally {
      setIsPrinting(false);
      setTimeout(() => setPrintStatus(null), 6000);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">

      {/* SIDEBAR OVERLAY */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40"
            />

            <motion.div
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[360px] bg-white z-50 shadow-2xl shadow-indigo-500/10 border-r border-gray-100 flex flex-col"
            >
              <div className="p-8 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 p-1 flex-shrink-0">
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <div>
                    <span className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 tracking-tight leading-none block">BOUTIDIDACT</span>
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block">Menu Principal</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 py-8 px-6 space-y-3 overflow-y-auto no-scrollbar">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 px-2">Espace de vente</div>

                <button onClick={() => setIsSidebarOpen(false)} className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-indigo-50 text-indigo-700 font-bold transition-all shadow-sm shadow-indigo-500/10">
                  <LayoutDashboard size={24} className="text-indigo-600" />
                  <span className="text-lg">Caisse (POS)</span>
                </button>

                <button onClick={() => { alert("Module 'Mes Produits' en cours de construction !"); setIsSidebarOpen(false); }} className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-semibold transition-all group">
                  <Package size={24} className="text-gray-400 group-hover:text-amber-500 transition-colors" />
                  <span className="text-lg">Mes Produits</span>
                </button>

                <div className="py-4"></div>

                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 px-2">Configurations</div>

                <button onClick={() => { alert("Paramètres de l'Imprimante ESC/POS à venir !"); setIsSidebarOpen(false); }} className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-semibold transition-all group">
                  <Printer size={24} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
                  <span className="text-lg">Imprimante ESC/POS</span>
                </button>

                <button onClick={() => { alert("Paramètres globaux..."); setIsSidebarOpen(false); }} className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-semibold transition-all group">
                  <Settings size={24} className="text-gray-400 group-hover:text-gray-700 transition-colors" />
                  <span className="text-lg">Paramètres Généraux</span>
                </button>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-200 cursor-pointer hover:border-indigo-300 transition-colors">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl flex items-center justify-center font-black text-lg shadow-inner">
                    EL
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base text-gray-900 truncate block">Elamine</p>
                    <p className="text-[11px] font-black text-indigo-500 truncate uppercase mt-0.5 block tracking-wider">Administrateur</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* LEFT SECTION - MENU */}
      <div className="flex-1 flex flex-col h-full bg-[#FAFAFA]">

        {/* Header - Glassmorphism */}
        <header className="px-8 py-6 bg-white/70 backdrop-blur-lg border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <div
              onClick={() => setIsSidebarOpen(true)}
              className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/10 transform transition-transform hover:scale-105 hover:-rotate-3 cursor-pointer overflow-hidden border border-gray-100 p-1"
            >
              <img src={logoUrl} alt="Boutididact Logo" className="w-full h-full object-contain mix-blend-multiply" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 tracking-tight leading-none mb-1">
                BOUTIDIDACT
              </h1>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Caisse Terminal</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 text-gray-700">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="font-semibold text-sm">Système en ligne</span>
          </div>
        </header>

        {/* Categories / Filter */}
        <div className="px-8 py-5 flex space-x-3 overflow-x-auto no-scrollbar">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center space-x-2 px-5 py-3 rounded-2xl font-bold transition-all duration-300 transform active:scale-95
                  ${isActive
                    ? 'bg-gray-900 text-white shadow-xl shadow-gray-900/20 scale-105'
                    : 'bg-white text-gray-600 shadow-sm hover:bg-gray-50 border border-gray-100'
                  }`}
              >
                <div className={`p-2 rounded-xl ${isActive ? 'bg-gray-800' : cat.color}`}>
                  <Icon size={18} />
                </div>
                <span>{cat.name}</span>
              </button>
            )
          })}
        </div>

        {/* Products Grid */}
        <div className="flex-1 px-8 pb-8 overflow-y-auto">
          <motion.div
            layout
            className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
              {filteredProducts.map(product => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addToCart(product)}
                  className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer border border-transparent hover:border-indigo-50 transition-all flex flex-col relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>

                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform drop-shadow-md">
                    {product.image}
                  </div>

                  <div className="mt-auto">
                    <h3 className="text-lg font-bold text-gray-800 leading-tight">{product.name}</h3>
                    <p className="text-xs text-gray-400 mt-1 mb-3 line-clamp-2">{product.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black text-indigo-600 border-b-2 border-indigo-100">
                        {product.price.toFixed(2)}€
                      </span>
                      <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus size={16} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* RIGHT SECTION - CART */}
      <div className="w-[420px] bg-white border-l border-gray-200 shadow-2xl flex flex-col z-20">

        {/* Cart Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
              <ShoppingBag size={24} className="text-indigo-600" />
              Commande
            </h2>
            <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
              {totalItems} articles
            </div>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
          <AnimatePresence>
            {cart.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                  <ShoppingBag size={48} className="text-gray-300" />
                </div>
                <p className="font-medium text-lg">Le panier est vide</p>
                <p className="text-sm">Cliquez sur un produit pour l'ajouter.</p>
              </motion.div>
            ) : (
              cart.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, scale: 0.9 }}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4"
                >
                  <div className="text-3xl bg-gray-50 p-2 rounded-xl">{item.image}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 truncate">{item.name}</h4>
                    <p className="text-indigo-600 font-bold">{(item.price * item.quantity).toFixed(2)}€</p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center bg-gray-100 rounded-full p-1 border border-gray-200">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-sm hover:text-red-500 transition-colors"
                    >
                      {item.quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                    </button>
                    <span className="w-8 text-center font-bold text-gray-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-sm hover:text-green-500 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Checkout Footer */}
        <div className="p-6 bg-white border-t border-gray-100 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">

          {/* Payment Methods */}
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Moyen de paiement</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('Carte Bancaire')}
                className={`flex items-center justify-center space-x-2 py-3 rounded-xl font-bold border-2 transition-all
                  ${paymentMethod === 'Carte Bancaire'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
              >
                <CreditCard size={18} /><span>CB</span>
              </button>
              <button
                onClick={() => setPaymentMethod('Espèces')}
                className={`flex items-center justify-center space-x-2 py-3 rounded-xl font-bold border-2 transition-all
                  ${paymentMethod === 'Espèces'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                    : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
              >
                <Banknote size={18} /><span>Espèces</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <span className="text-xl font-medium text-gray-500">Total à payer</span>
            <span className="text-4xl font-black text-gray-900 border-b-4 border-emerald-400 pb-1">
              {totalAmount.toFixed(2)}€
            </span>
          </div>

          <button
            onClick={handleCheckoutAndPrint}
            disabled={cart.length === 0 || isPrinting}
            className={`w-full py-5 rounded-2xl flex items-center justify-center space-x-3 text-lg font-bold text-white transition-all transform active:scale-95
              ${cart.length === 0
                ? 'bg-gray-200 cursor-not-allowed text-gray-400'
                : isPrinting
                  ? 'bg-indigo-400 cursor-wait'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg hover:shadow-emerald-500/30'}
            `}
          >
            <Printer size={24} className={isPrinting ? 'animate-pulse' : ''} />
            <span>
              {isPrinting ? 'Impression en cours...' : 'Valider & Imprimer'}
            </span>
          </button>

          {/* Feedback Messages */}
          <AnimatePresence>
            {printStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-4 flex items-center justify-center space-x-2 text-emerald-600 bg-emerald-50 py-3 rounded-xl border border-emerald-100 font-medium"
              >
                <CheckCircle2 size={20} />
                <span>Ticket imprimé avec succès !</span>
              </motion.div>
            )}

            {printStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-4 flex flex-col items-center justify-center text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 text-center"
              >
                <div className="flex items-center space-x-2 font-bold mb-1">
                  <AlertCircle size={20} />
                  <span>Erreur d'impression</span>
                </div>
                <span className="text-sm font-medium opacity-90">{errorMessage}</span>
                <span className="text-xs mt-2 opacity-75">Vérifiez l'adresse IP et relancez le serveur Node.js</span>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
