// LOKASI: src/pages/Cashier/Cashier.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { fetchMenus } from '../../services/cashier';
import { applyVoucher } from '../../services/promotion';
import { toast } from 'react-toastify';
import PaymentModal from '../../components/PaymentModal';
import ReceiptModal from '../../components/ReceiptModal';
import DiscountModal from '../../components/DiscountModal';
import CustomerModal from '../../components/CustomerModal';
import './Cashier.scss';
import { FaTags } from 'react-icons/fa';

function CashierPage() {
    const navigate = useNavigate();
    const [menus, setMenus] = useState([]);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Modal States
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    
    // Transaction Data States
    const [lastTransaction, setLastTransaction] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [manualDiscount, setManualDiscount] = useState(0);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [cashierName, setCashierName] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    
    // Voucher States
    const [voucherCode, setVoucherCode] = useState("");
    const [appliedVoucher, setAppliedVoucher] = useState(null);
    const [voucherError, setVoucherError] = useState("");
    const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);

    // Load Menus
    const loadMenus = async () => {
        try {
            setError('');
            setLoading(true);
            const response = await fetchMenus();
            // Pastikan data yang diambil adalah array
            setMenus(response.data || []);
        } catch (err) {
            setError('Gagal memuat data menu.');
            console.error("Fetch menus error:", err);
            setMenus([]);
        } finally {
            setLoading(false);
        }
    };

    // Init Effect
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

    // Memoized Data
    const uniqueCategories = useMemo(() => {
        if (!Array.isArray(menus)) return ['Semua'];
        const cats = menus.map(menu => menu.Category).filter(Boolean);
        return ['Semua', ...new Set(cats)];
    }, [menus]);

    const filteredMenus = useMemo(() => {
        if (!Array.isArray(menus)) return [];
        return menus.filter(menu =>
            (selectedCategory === 'Semua' || menu.Category === selectedCategory) &&
            menu.Name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [menus, searchTerm, selectedCategory]);

    // Cart Logic
    const resetAllDiscounts = () => {
        setManualDiscount(0);
        setAppliedVoucher(null);
        setVoucherCode("");
        setVoucherError("");
    };

    const addToCart = (menu) => {
        resetAllDiscounts();
        setCart(currentCart => {
            const existingItem = currentCart.find(item => item.menu_id === menu.ID);
            if (existingItem) {
                if (existingItem.quantity < menu.Stock) {
                    return currentCart.map(item => item.menu_id === menu.ID ? { ...item, quantity: item.quantity + 1 } : item );
                } else {
                    toast.warn(`Stok ${menu.Name} tidak mencukupi.`);
                    return currentCart;
                }
            } else {
                if (menu.Stock > 0) {
                     return [...currentCart, { menu_id: menu.ID, name: menu.Name, price: menu.Price, quantity: 1 }];
                } else {
                    toast.warn(`Stok ${menu.Name} habis.`);
                    return currentCart;
                }
            }
        });
    };

    const updateQuantity = (menu_id, amount) => {
        resetAllDiscounts();
        setCart(currentCart => {
            const originalMenu = menus.find(m => m.ID === menu_id);
            if (!originalMenu) return currentCart;

            return currentCart.map(item => {
                if (item.menu_id === menu_id) {
                    const newQuantity = item.quantity + amount;
                    if (newQuantity <= 0) return null;
                    if (newQuantity > originalMenu.Stock) {
                        toast.warn(`Stok ${item.name} tidak mencukupi.`);
                        return item;
                    }
                    return { ...item, quantity: newQuantity };
                }
                return item;
            }).filter(Boolean);
        });
    };

    const removeFromCart = (menu_id) => {
        resetAllDiscounts();
        setCart(currentCart => currentCart.filter(item => item.menu_id !== menu_id));
    };

    const clearCart = () => {
        setCart([]);
        setSelectedCustomer(null);
        resetAllDiscounts();
    };

    // Calculations
    const subtotal = useMemo(() => cart.reduce((total, item) => total + item.price * item.quantity, 0), [cart]);

    const voucherDiscount = useMemo(() => {
        if (!appliedVoucher) return 0;
        const { promotion } = appliedVoucher;
        if (!promotion) return 0;

        let discount = 0;
        if (promotion.Type === 'PERCENTAGE') {
            discount = (subtotal * promotion.Value) / 100;
        } else if (promotion.Type === 'FIXED_AMOUNT') {
            discount = promotion.Value;
        }
        return Math.min(discount, subtotal);
    }, [appliedVoucher, subtotal]);

    const totalDiscount = voucherDiscount + manualDiscount;
    const grandTotal = Math.max(0, subtotal - totalDiscount);

    // Handlers
    const handleLogout = () => { 
        localStorage.removeItem('authToken'); 
        navigate('/login'); 
    };

    const handleApplyManualDiscount = (discountValue) => {
        const validDiscount = Math.min(discountValue, subtotal);
        setManualDiscount(validDiscount);
        setAppliedVoucher(null);
        setVoucherCode("");
        setVoucherError("");
        if (validDiscount > 0) {
            toast.info('Diskon manual diterapkan, voucher dihapus.');
        }
    };

    const handleApplyVoucher = async () => {
        if (!voucherCode) {
            setVoucherError("Masukkan kode voucher.");
            return;
        }
        setIsApplyingVoucher(true);
        setVoucherError("");
        try {
            const result = await applyVoucher({ code: voucherCode });
            setAppliedVoucher(result);
            setManualDiscount(0);
            toast.success(`Voucher "${result.promotion.Name}" diterapkan!`);
        } catch (err) {
            setAppliedVoucher(null);
            const errorMessage = err.response?.data?.error || err.message || "Gagal menerapkan voucher.";
            setVoucherError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsApplyingVoucher(false);
        }
    };

    const handleRemoveVoucher = () => {
        setAppliedVoucher(null);
        setVoucherCode("");
        setVoucherError("");
        toast.info("Voucher dihapus.");
    };

    // --- FIX: Handler Baru untuk Sukses Bayar ---
    // Logika API createTransaction sudah dipindah ke dalam PaymentModal
    // Fungsi ini hanya menerima hasil balikan dari Modal
    const handleTransactionSuccess = (transactionResult) => {
        setIsPaymentModalOpen(false);
        
        // Gabungkan data API dengan data lokal (Subtotal, User, Customer) agar struk lengkap
        const receiptData = { 
            ...transactionResult, 
            Subtotal: subtotal,
            User: { Name: cashierName }, 
            Customer: selectedCustomer 
        };
        
        setLastTransaction(receiptData);
        setIsReceiptModalOpen(true);
    };

    const openPaymentModal = () => { 
        if (cart.length > 0) { 
            setIsPaymentModalOpen(true); 
        } else { 
            toast.warn('Keranjang masih kosong!'); 
        } 
    };
    
    const handleNewTransaction = () => { 
        setIsReceiptModalOpen(false); 
        setLastTransaction(null); 
        clearCart(); 
        loadMenus(); 
    };

    // --- JSX ---
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
                        <button onClick={() => navigate('/transactions')} className="history-button">Riwayat Transaksi</button>
                        <button onClick={handleLogout} className="logout-button">Logout</button>
                    </div>
                </div>
            </header>

            <main className="cashier-main-content">
                <section className="menu-section">
                    <h2>Daftar Menu</h2>
                    <div className="filter-controls">
                        <div className="search-input-group">
                            <input type="text" placeholder="Cari menu..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="category-tabs">
                            {uniqueCategories.map(category => (
                                <button key={category} className={`category-tab ${selectedCategory === category ? 'active' : ''}`} onClick={() => setSelectedCategory(category)}>{category || 'Lainnya'}</button>
                            ))}
                        </div>
                    </div>
                    {loading && <p className='loading-text'>Memuat menu...</p>}
                    {error && <p className="error-message">{error}</p>}
                    <div className="menu-grid">
                        {!loading && Array.isArray(filteredMenus) && filteredMenus.map(menu => (
                            <div key={menu.ID} className={`menu-item ${menu.Stock === 0 ? 'out-of-stock' : ''}`} onClick={() => menu.Stock > 0 && addToCart(menu)} title={menu.Stock === 0 ? 'Stok Habis' : ''}>
                                <p className="menu-name">{menu.Name}</p>
                                <p className="menu-price">Rp {menu.Price.toLocaleString('id-ID')}</p>
                                <p className="menu-stock">Stok: {menu.Stock}</p>
                            </div>
                        ))}
                        {!loading && filteredMenus.length === 0 && menus.length > 0 && <p className="info-text">Menu tidak ditemukan.</p>}
                        {!loading && menus.length === 0 && !error && <p className="info-text">Belum ada menu di outlet ini.</p>}
                    </div>
                </section>

                <aside className="cart-section">
                    <div className="customer-display">
                        <div className="customer-info">
                            <span className="label">Pelanggan:</span>
                            <span className="name">{selectedCustomer ? selectedCustomer.Name : 'Pelanggan Umum'}</span>
                        </div>
                        <button onClick={() => setIsCustomerModalOpen(true)} className="change-customer-button">{selectedCustomer ? 'Ganti' : 'Pilih'}</button>
                    </div>
                    <div className="cart-header"><h2>Pesanan</h2><button onClick={clearCart} className="clear-cart-button" disabled={cart.length === 0}>Kosongkan</button></div>
                    <div className="cart-items">
                        {cart.length === 0 ? (
                            <p className="cart-empty">Keranjang kosong</p>
                        ) : (
                            cart.map((item) => (
                                <div key={item.menu_id} className="cart-item">
                                    <div className="item-info">
                                        <span className="item-name">{item.name}</span>
                                        <span className="item-price">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="item-controls">
                                        <button onClick={() => updateQuantity(item.menu_id, -1)} className="control-button">-</button>
                                        <span className="item-quantity">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.menu_id, 1)} className="control-button">+</button>
                                        <button onClick={() => removeFromCart(item.menu_id)} className="remove-button">×</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {cart.length > 0 && (
                        <div className="cart-summary">
                            <div className="cart-total"><span>Subtotal:</span><span>Rp {subtotal.toLocaleString('id-ID')}</span></div>

                            <div className="voucher-section">
                                <div className="voucher-input-group">
                                    <input type="text" placeholder="Masukkan Kode Voucher" value={voucherCode} onChange={(e) => setVoucherCode(e.target.value.toUpperCase())} disabled={!!appliedVoucher || manualDiscount > 0} />
                                    {appliedVoucher ? (
                                        <button onClick={handleRemoveVoucher} className="remove-voucher-btn">Hapus</button>
                                    ) : (
                                        <button onClick={handleApplyVoucher} disabled={isApplyingVoucher || manualDiscount > 0 || !voucherCode} className="apply-voucher-btn">{isApplyingVoucher ? 'Memeriksa...' : 'Terapkan'}</button>
                                    )}
                                </div>
                                {voucherError && <small className="error-text">{voucherError}</small>}
                                {appliedVoucher && (
                                    <div className="applied-voucher-info"><FaTags /> <span>{appliedVoucher.promotion.Name}</span></div>
                                )}
                            </div>

                            {voucherDiscount > 0 && (<div className="cart-total discount-row"><span>Diskon Voucher:</span><span>- Rp {Math.round(voucherDiscount).toLocaleString('id-ID')}</span></div>)}

                            <div className="cart-total discount-row">
                                <button className="discount-link" onClick={() => setIsDiscountModalOpen(true)} disabled={!!appliedVoucher}>{manualDiscount > 0 ? 'Ubah Diskon Manual' : 'Diskon Manual'}</button>
                                <span>- Rp {manualDiscount.toLocaleString('id-ID')}</span>
                            </div>

                            <div className="cart-total grand-total"><span>TOTAL:</span><span>Rp {Math.round(grandTotal).toLocaleString('id-ID')}</span></div>
                            <button onClick={openPaymentModal} className="process-button">PROSES PEMBAYARAN</button>
                        </div>
                    )}
                </aside>
            </main>

            {/* --- FIX: Props PaymentModal Lengkap --- */}
            <PaymentModal 
                isOpen={isPaymentModalOpen} 
                onClose={() => setIsPaymentModalOpen(false)} 
                
                // Data wajib dikirim agar tidak Error NaN / Undefined
                cart={cart}
                subtotal={subtotal}
                discount={totalDiscount}
                total={grandTotal}
                customer={selectedCustomer}
                voucher={appliedVoucher}
                
                // Callback sukses
                onPaymentComplete={handleTransactionSuccess} 
            />

            <ReceiptModal isOpen={isReceiptModalOpen} onClose={handleNewTransaction} transactionData={lastTransaction} />
            <DiscountModal isOpen={isDiscountModalOpen} onClose={() => setIsDiscountModalOpen(false)} onApply={handleApplyManualDiscount} currentDiscount={manualDiscount} subtotal={subtotal} />
            <CustomerModal isOpen={isCustomerModalOpen} onClose={() => setIsCustomerModalOpen(false)} onSelectCustomer={setSelectedCustomer} />
        </div>
    );
}

export default CashierPage;