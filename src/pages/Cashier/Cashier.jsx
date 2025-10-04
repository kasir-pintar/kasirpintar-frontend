// LOKASI: src/pages/Cashier/Cashier.jsx (VERSI FINAL & LENGKAP)
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMenus, createTransaction } from '../../services/cashier';
import PaymentModal from '../../components/PaymentModal';
import ReceiptModal from '../../components/ReceiptModal';
import './Cashier.scss';

function CashierPage() {
  const navigate = useNavigate();
  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);

  const loadMenus = async () => { try { setError(''); setLoading(true); const data = await fetchMenus(); setMenus(data || []); } catch (err) { setError('Gagal memuat data menu.'); } finally { setLoading(false); } };
  useEffect(() => { loadMenus(); }, []);
  const uniqueCategories = useMemo(() => { const categories = menus.map(menu => menu.Category).filter(Boolean); return ['Semua', ...new Set(categories)]; }, [menus]);
  const filteredMenus = useMemo(() => { return menus.filter(menu => { const matchesCategory = selectedCategory === 'Semua' || menu.Category === selectedCategory; const matchesSearch = menu.Name.toLowerCase().includes(searchTerm.toLowerCase()); return matchesCategory && matchesSearch; }); }, [menus, searchTerm, selectedCategory]);
  const handleLogout = () => { localStorage.removeItem('authToken'); navigate('/login'); };
  const addToCart = (menu) => { setCart(currentCart => { const existingItem = currentCart.find(item => item.menu_id === menu.ID); if (existingItem) { return currentCart.map(item => item.menu_id === menu.ID ? { ...item, quantity: item.quantity + 1 } : item ); } else { return [...currentCart, { menu_id: menu.ID, name: menu.Name, price: menu.Price, quantity: 1 }]; } }); };
  const updateQuantity = (menu_id, amount) => { setCart(currentCart => { return currentCart.map(item => { if (item.menu_id === menu_id) { const newQuantity = item.quantity + amount; return newQuantity > 0 ? { ...item, quantity: newQuantity } : null; } return item; }).filter(Boolean); }); };
  const removeFromCart = (menu_id) => { setCart(currentCart => currentCart.filter(item => item.menu_id !== menu_id)); };
  const clearCart = () => { setCart([]); };
  const calculateTotal = () => { return cart.reduce((total, item) => total + item.price * item.quantity, 0); };
  
  const handleProcessTransaction = async (paymentMethod) => {
    if (cart.length === 0) { return; }
    const itemsToSubmit = cart.map(({ menu_id, quantity }) => ({ menu_id, quantity }));
    const transactionData = { items: itemsToSubmit, payment_method: paymentMethod };
    try {
        const newTransaction = await createTransaction(transactionData);
        setIsPaymentModalOpen(false);
        setLastTransaction(newTransaction);
        setIsReceiptModalOpen(true);
    } catch (err) {
        alert('Gagal memproses transaksi: ' + (err.response?.data?.error || 'Error tidak diketahui'));
    }
  };

  const openPaymentModal = () => { if (cart.length > 0) { setIsPaymentModalOpen(true); } else { alert('Keranjang masih kosong!'); } };
  
  const handleNewTransaction = () => {
    setIsReceiptModalOpen(false);
    setLastTransaction(null);
    clearCart();
    loadMenus();
  };

  return (
    <div className="cashier-layout">
      <header className="cashier-header"><h1>Halaman Kasir</h1><button onClick={handleLogout} className="logout-button">Logout</button></header>
      <main className="cashier-main-content">
        <section className="menu-section">
          <h2>Daftar Menu</h2>
          <div className="filter-controls"><div className="search-input-group"><input type="text" placeholder="Cari menu..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div><div className="category-tabs">{uniqueCategories.map(category => (<button key={category} className={`category-tab ${selectedCategory === category ? 'active' : ''}`} onClick={() => setSelectedCategory(category)}>{category}</button>))}</div></div>
          {loading && <p>Memuat menu...</p>}
          {error && <p className="error-message">{error}</p>}
          <div className="menu-grid">{filteredMenus.map(menu => (<div key={menu.ID} className="menu-item" onClick={() => addToCart(menu)}><p className="menu-name">{menu.Name}</p><p className="menu-price">Rp {menu.Price.toLocaleString('id-ID')}</p><p className="menu-stock">Stok: {menu.Stock}</p></div>))}{!loading && filteredMenus.length === 0 && <p className="cart-empty" style={{width: '100%', textAlign:'center', marginTop: '20px'}}>Menu tidak ditemukan.</p>}</div>
        </section>
        <aside className="cart-section">
          <div className="cart-header"><h2>Pesanan</h2><button onClick={clearCart} className="clear-cart-button">Kosongkan</button></div>
          <div className="cart-items">{cart.length === 0 ? (<p className="cart-empty">Keranjang kosong</p>) : (cart.map((item) => (<div key={item.menu_id} className="cart-item"><div className="item-info"><span className="item-name">{item.name}</span><span className="item-price">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span></div><div className="item-controls"><button onClick={() => updateQuantity(item.menu_id, -1)} className="control-button">-</button><span className="item-quantity">{item.quantity}</span><button onClick={() => updateQuantity(item.menu_id, 1)} className="control-button">+</button><button onClick={() => removeFromCart(item.menu_id)} className="remove-button">×</button></div></div>)))}</div>
          <div className="cart-summary"><div className="cart-total"><span>TOTAL:</span><span>Rp {calculateTotal().toLocaleString('id-ID')}</span></div><button onClick={openPaymentModal} className="process-button">PROSES PEMBAYARAN</button></div>
        </aside>
      </main>
      <PaymentModal isOpen={isPaymentModalOpen} onRequestClose={() => setIsPaymentModalOpen(false)} totalAmount={calculateTotal()} onConfirm={handleProcessTransaction} />
      <ReceiptModal isOpen={isReceiptModalOpen} onClose={handleNewTransaction} transactionData={lastTransaction} />
    </div>
  );
}

export default CashierPage;