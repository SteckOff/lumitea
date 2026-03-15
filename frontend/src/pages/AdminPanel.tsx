import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { adminAPI, productsAPI, ordersAPI } from './api';
import { 
    Users, 
    Package, 
    ShoppingCart, 
    LogOut, 
    Plus, 
    Edit2, 
    Trash2, 
    Check, 
    X,
    Loader2,
    Search,
    Filter
} from 'lucide-react';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    verified: boolean;
    createdAt: string;
}

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    image: string;
}

interface Order {
    id: string;
    userEmail: string;
    items: any[];
    total: number;
    status: string;
    createdAt: string;
}

export function AdminPanel() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'products' | 'orders'>('dashboard');
    const [users, setUsers] = useState<User[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Product form state
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        price: '',
        category: 'green',
        stock: '',
        image: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        setError('');
        try {
            const [usersData, productsData, ordersData] = await Promise.all([
                adminAPI.getUsers(),
                productsAPI.getAll(),
                adminAPI.getAllOrders()
            ]);
            setUsers(usersData.users || []);
            setProducts(productsData.products || []);
            setOrders(ordersData.orders || []);
        } catch (err: any) {
            setError(err.message || 'Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await productsAPI.create({
                name: productForm.name,
                description: productForm.description,
                price: parseFloat(productForm.price),
                category: productForm.category,
                stock: parseInt(productForm.stock),
                image: productForm.image
            });
            setShowProductForm(false);
            setProductForm({ name: '', description: '', price: '', category: 'green', stock: '', image: '' });
            loadData();
        } catch (err: any) {
            setError(err.message || 'Failed to create product');
        }
    };

    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;
        
        try {
            await productsAPI.update(editingProduct.id, {
                name: productForm.name,
                description: productForm.description,
                price: parseFloat(productForm.price),
                category: productForm.category,
                stock: parseInt(productForm.stock),
                image: productForm.image
            });
            setEditingProduct(null);
            setProductForm({ name: '', description: '', price: '', category: 'green', stock: '', image: '' });
            loadData();
        } catch (err: any) {
            setError(err.message || 'Failed to update product');
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        
        try {
            await productsAPI.delete(id);
            loadData();
        } catch (err: any) {
            setError(err.message || 'Failed to delete product');
        }
    };

    const handleUpdateOrderStatus = async (orderId: string, status: string) => {
        try {
            await adminAPI.updateOrderStatus(orderId, status);
            loadData();
        } catch (err: any) {
            setError(err.message || 'Failed to update order');
        }
    };

    const handleUpdateUserRole = async (userId: string, role: string) => {
        try {
            await adminAPI.updateUserRole(userId, role);
            loadData();
        } catch (err: any) {
            setError(err.message || 'Failed to update user');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        
        try {
            await adminAPI.deleteUser(userId);
            loadData();
        } catch (err: any) {
            setError(err.message || 'Failed to delete user');
        }
    };

    const openEditProduct = (product: Product) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            category: product.category,
            stock: product.stock.toString(),
            image: product.image
        });
        setShowProductForm(true);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW'
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50">
            {/* Header */}
            <header className="bg-white border-b border-stone-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-serif font-semibold text-teal-700">
                                Lumi Tea Admin
                            </h1>
                            <span className="text-sm text-stone-500">
                                Welcome, {user?.name}
                            </span>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-4 py-2 text-stone-600 hover:text-red-600 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Navigation */}
            <nav className="bg-white border-b border-stone-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                        {[
                            { id: 'dashboard', label: 'Dashboard', icon: null },
                            { id: 'users', label: 'Users', icon: Users },
                            { id: 'products', label: 'Products', icon: Package },
                            { id: 'orders', label: 'Orders', icon: ShoppingCart },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-teal-600 text-teal-600'
                                        : 'border-transparent text-stone-500 hover:text-stone-700'
                                }`}
                            >
                                {tab.icon && <tab.icon className="w-4 h-4" />}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {error}
                    </div>
                )}

                {/* Dashboard */}
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <p className="text-sm text-stone-500 mb-1">Total Users</p>
                            <p className="text-3xl font-semibold text-stone-800">{users.length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <p className="text-sm text-stone-500 mb-1">Total Products</p>
                            <p className="text-3xl font-semibold text-stone-800">{products.length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <p className="text-sm text-stone-500 mb-1">Total Orders</p>
                            <p className="text-3xl font-semibold text-stone-800">{orders.length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <p className="text-sm text-stone-500 mb-1">Revenue</p>
                            <p className="text-3xl font-semibold text-stone-800">
                                {formatPrice(orders.reduce((sum, o) => sum + o.total, 0))}
                            </p>
                        </div>
                    </div>
                )}

                {/* Users */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-stone-200">
                            <h2 className="text-lg font-semibold text-stone-800">Users</h2>
                        </div>
                        <table className="w-full">
                            <thead className="bg-stone-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Joined</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-200">
                                {users.map((u) => (
                                    <tr key={u.id}>
                                        <td className="px-6 py-4 text-stone-800">{u.name}</td>
                                        <td className="px-6 py-4 text-stone-600">{u.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-stone-500">{formatDate(u.createdAt)}</td>
                                        <td className="px-6 py-4 text-right">
                                            {u.id !== user?.id && (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleUpdateUserRole(u.id, u.role === 'admin' ? 'user' : 'admin')}
                                                        className="p-2 text-stone-400 hover:text-teal-600 transition-colors"
                                                        title="Toggle role"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(u.id)}
                                                        className="p-2 text-stone-400 hover:text-red-600 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Products */}
                {activeTab === 'products' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-stone-800">Products</h2>
                            <button
                                onClick={() => {
                                    setEditingProduct(null);
                                    setProductForm({ name: '', description: '', price: '', category: 'green', stock: '', image: '' });
                                    setShowProductForm(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Product
                            </button>
                        </div>

                        {showProductForm && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                                    <h3 className="text-xl font-semibold mb-4">
                                        {editingProduct ? 'Edit Product' : 'Add Product'}
                                    </h3>
                                    <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-1">Name</label>
                                            <input
                                                type="text"
                                                value={productForm.name}
                                                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                                className="w-full px-4 py-2 border border-stone-300 rounded-lg"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                                            <textarea
                                                value={productForm.description}
                                                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                                className="w-full px-4 py-2 border border-stone-300 rounded-lg"
                                                rows={3}
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-stone-700 mb-1">Price (₩)</label>
                                                <input
                                                    type="number"
                                                    value={productForm.price}
                                                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                                    className="w-full px-4 py-2 border border-stone-300 rounded-lg"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-stone-700 mb-1">Stock</label>
                                                <input
                                                    type="number"
                                                    value={productForm.stock}
                                                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                                                    className="w-full px-4 py-2 border border-stone-300 rounded-lg"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
                                            <select
                                                value={productForm.category}
                                                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                                                className="w-full px-4 py-2 border border-stone-300 rounded-lg"
                                            >
                                                <option value="green">Green Tea</option>
                                                <option value="yellow">Yellow Tea</option>
                                                <option value="fermented">Fermented Tea</option>
                                                <option value="herbal">Herbal Tea</option>
                                                <option value="gift">Gift Set</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-1">Image URL</label>
                                            <input
                                                type="text"
                                                value={productForm.image}
                                                onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                                                className="w-full px-4 py-2 border border-stone-300 rounded-lg"
                                                placeholder="/images/teas/tea-name.jpg"
                                            />
                                        </div>
                                        <div className="flex gap-3 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setShowProductForm(false)}
                                                className="flex-1 px-4 py-2 border border-stone-300 rounded-lg hover:bg-stone-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                                            >
                                                {editingProduct ? 'Update' : 'Create'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-stone-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Product</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Price</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Stock</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-200">
                                    {products.map((p) => (
                                        <tr key={p.id}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {p.image && (
                                                        <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                                                    )}
                                                    <span className="text-stone-800">{p.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 text-xs rounded-full bg-stone-100 text-stone-600 capitalize">
                                                    {p.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-stone-600">{formatPrice(p.price)}</td>
                                            <td className="px-6 py-4 text-stone-600">{p.stock}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openEditProduct(p)}
                                                        className="p-2 text-stone-400 hover:text-teal-600 transition-colors"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(p.id)}
                                                        className="p-2 text-stone-400 hover:text-red-600 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Orders */}
                {activeTab === 'orders' && (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-stone-200">
                            <h2 className="text-lg font-semibold text-stone-800">Orders</h2>
                        </div>
                        <table className="w-full">
                            <thead className="bg-stone-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-200">
                                {orders.map((o) => (
                                    <tr key={o.id}>
                                        <td className="px-6 py-4 text-stone-800 font-mono text-sm">{o.id.slice(0, 8)}...</td>
                                        <td className="px-6 py-4 text-stone-600">{o.userEmail}</td>
                                        <td className="px-6 py-4 text-stone-800">{formatPrice(o.total)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(o.status)}`}>
                                                {o.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-stone-500">{formatDate(o.createdAt)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <select
                                                value={o.status}
                                                onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                                                className="text-sm border border-stone-300 rounded-lg px-2 py-1"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}

export default AdminPanel;
