// LOKASI: src/pages/Cashier/Cashier.jsx (FINAL DENGAN HEADER BARU)
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { fetchMenus, createTransaction } from '../../services/cashier';
import PaymentModal from '../../components/PaymentModal';
import ReceiptModal from '../../components/ReceiptModal';
import DiscountModal from '../../components/DiscountModal';
import CustomerModal from '../../components/CustomerModal';
import './Cashier.scss';

function CashierPage() {
  const navigate = useNavigate();
  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [discount, setDiscount] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [cashierName, setCashierName] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  const loadMenus = async () => {
    try {
      setError('');
      setLoading(true);
      const data = await fetchMenus();
      setMenus(data || []);
    } catch (err) {
      setError('Gagal memuat data menu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setCashierName(decodedToken.name || 'Kasir');
      } catch (e) {
        console.error('Invalid token:', e);
        setCashierName('Kasir');
      }
    }
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    loadMenus();
    return () => clearInterval(timer);
  }, []);

  const uniqueCategories = useMemo(() => { const categories = menus.map(menu => menu.Category).filter(Boolean); return ['Semua', ...new Set(categories)]; }, [menus]);
  const filteredMenus = useMemo(() => { return menus.filter(menu => { const matchesCategory = selectedCategory === 'Semua' || menu.Category === selectedCategory; const matchesSearch = menu.Name.toLowerCase().includes(searchTerm.toLowerCase()); return matchesCategory && matchesSearch; }); }, [menus, searchTerm, selectedCategory]);
  const handleLogout = () => { localStorage.removeItem('authToken'); navigate('/login'); };
  const resetDiscount = () => { if (discount > 0) { setDiscount(0); } };
  const addToCart = (menu) => { resetDiscount(); setCart(currentCart => { const existingItem = currentCart.find(item => item.menu_id === menu.ID); if (existingItem) { return currentCart.map(item => item.menu_id === menu.ID ? { ...item, quantity: item.quantity + 1 } : item ); } else { return [...currentCart, { menu_id: menu.ID, name: menu.Name, price: menu.Price, quantity: 1 }]; } }); };
  const updateQuantity = (menu_id, amount) => { resetDiscount(); setCart(currentCart => { return currentCart.map(item => { if (item.menu_id === menu_id) { const newQuantity = item.quantity + amount; return newQuantity > 0 ? { ...item, quantity: newQuantity } : null; } return item; }).filter(Boolean); }); };
  const removeFromCart = (menu_id) => { resetDiscount(); setCart(currentCart => currentCart.filter(item => item.menu_id !== menu_id)); };
  const clearCart = () => { setCart([]); setDiscount(0); setSelectedCustomer(null); };
  const calculateSubtotal = () => { return cart.reduce((total, item) => total + item.price * item.quantity, 0); };
  const subtotal = calculateSubtotal();
  const grandTotal = subtotal - discount;
  const handleApplyDiscount = (discountValue) => { setDiscount(discountValue); };
  const handleProcessTransaction = async (paymentMethod, cashTendered, change) => {
    if (cart.length === 0) { return; }
    const itemsToSubmit = cart.map(({ menu_id, quantity }) => ({ menu_id, quantity }));
    const transactionData = { items: itemsToSubmit, payment_method: paymentMethod, cash_tendered: cashTendered, change: change, discount: discount, customer_id: selectedCustomer ? selectedCustomer.ID : null };
    try {
        const newTransaction = await createTransaction(transactionData);
        setIsPaymentModalOpen(false);
        const receiptData = { ...newTransaction, Subtotal: subtotal };
        setLastTransaction(receiptData);
        setIsReceiptModalOpen(true);
    } catch (err) {
        alert('Gagal memproses transaksi: ' + (err.response?.data?.error || 'Error tidak diketahui'));
    }
  };
  const openPaymentModal = () => { if (cart.length > 0) { setIsPaymentModalOpen(true); } else { alert('Keranjang masih kosong!'); } };
  const handleNewTransaction = () => { setIsReceiptModalOpen(false); setLastTransaction(null); clearCart(); loadMenus(); };

  return (
    <div className="cashier-layout">
      <header className="cashier-header">
        <div className="header-info-left">
          <h1>Halaman Kasir</h1>
          <span className="cashier-name">Kasir: {cashierName}</span>
        </div>
        <div className="header-info-right">
          <span className="realtime-clock">{format(currentTime, 'dd MMM yyyy, HH:mm:ss', { locale: id })}</span>
          <div className="header-actions">
            <Link to="/transactions" className="history-button">Riwayat Transaksi</Link>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        </div>
      </header>
      
      {/* TIDAK ADA LAGI cashier-info-bar di sini */}
      
      <main className="cashier-main-content">
        <section className="menu-section">
          <h2>Daftar Menu</h2>
          <div className="filter-controls"><div className="search-input-group"><input type="text" placeholder="Cari menu..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div><div className="category-tabs">{uniqueCategories.map(category => (<button key={category} className={`category-tab ${selectedCategory === category ? 'active' : ''}`} onClick={() => setSelectedCategory(category)}>{category}</button>))}</div></div>
          {loading && <p>Memuat menu...</p>}
          {error && <p className="error-message">{error}</p>}
          <div className="menu-grid">{filteredMenus.map(menu => (<div key={menu.ID} className="menu-item" onClick={() => addToCart(menu)}><p className="menu-name">{menu.Name}</p><p className="menu-price">Rp {menu.Price.toLocaleString('id-ID')}</p><p className="menu-stock">Stok: {menu.Stock}</p></div>))}{!loading && filteredMenus.length === 0 && <p className="cart-empty" style={{width: '100%', textAlign:'center', marginTop: '20px'}}>Menu tidak ditemukan.</p>}</div>
        </section>
        <aside className="cart-section">
          <div className="customer-display">
            <div className="customer-info"><span className="label">Pelanggan:</span><span className="name">{selectedCustomer ? selectedCustomer.Name : 'Pelanggan Umum'}</span></div>
            <button onClick={() => setIsCustomerModalOpen(true)} className="change-customer-button">{selectedCustomer ? 'Ganti' : 'Pilih'}</button>
          </div>
          <div className="cart-header"><h2>Pesanan</h2><button onClick={clearCart} className="clear-cart-button">Kosongkan</button></div>
          <div className="cart-items">{cart.length === 0 ? (<p className="cart-empty">Keranjang kosong</p>) : (cart.map((item) => (<div key={item.menu_id} className="cart-item"><div className="item-info"><span className="item-name">{item.name}</span><span className="item-price">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span></div><div className="item-controls"><button onClick={() => updateQuantity(item.menu_id, -1)} className="control-button">-</button><span className="item-quantity">{item.quantity}</span><button onClick={() => updateQuantity(item.menu_id, 1)} className="control-button">+</button><button onClick={() => removeFromCart(item.menu_id)} className="remove-button">×</button></div></div>)))}</div>
          <div className="cart-summary"><div className="cart-total"><span>Subtotal:</span><span>Rp {subtotal.toLocaleString('id-ID')}</span></div>{discount > 0 && (<div className="cart-total discount-row"><span>Diskon:</span><span>- Rp {discount.toLocaleString('id-ID')}</span></div>)}<div className="cart-total grand-total"><span>TOTAL:</span><span>Rp {grandTotal.toLocaleString('id-ID')}</span></div><div className="discount-action"><button onClick={() => setIsDiscountModalOpen(true)} className="discount-button">{discount > 0 ? 'Ubah Diskon' : 'Tambah Diskon'}</button></div><button onClick={openPaymentModal} className="process-button">PROSES PEMBAYARAN</button></div>
        </aside>
      </main>
      <PaymentModal isOpen={isPaymentModalOpen} onRequestClose={() => setIsPaymentModalOpen(false)} totalAmount={grandTotal} onConfirm={handleProcessTransaction} />
      <ReceiptModal isOpen={isReceiptModalOpen} onClose={handleNewTransaction} transactionData={lastTransaction} />
      <DiscountModal isOpen={isDiscountModalOpen} onClose={() => setIsDiscountModalOpen(false)} onApply={handleApplyDiscount} currentDiscount={discount} subtotal={subtotal} />
      <CustomerModal isOpen={isCustomerModalOpen} onClose={() => setIsCustomerModalOpen(false)} onSelectCustomer={setSelectedCustomer} />
    </div>
  );
}

export default CashierPage;