import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { Package, Mail, Printer, Check, Clock, Truck, CheckCircle, Download, Edit, Save, X, Tag, Box } from 'lucide-react';
import { products as initialProducts, giftSets as initialGiftSets } from '@/data/products';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'ko' | 'ru';
}

interface Order {
  orderId: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
  }>;
  address: {
    name: string;
    phone: string;
    postalCode: string;
    address1: string;
    address2?: string;
  };
  subtotal: number;
  shipping: number;
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  printed?: boolean;
}

interface Product {
  id: number;
  name: string;
  nameKo: string;
  nameRu: string;
  category: string;
  price: number;
  originalPrice?: number;
  description: string;
  descriptionKo: string;
  descriptionRu: string;
  tags: string[];
  tagsKo: string[];
  tagsRu: string[];
  image: string;
  bestseller?: boolean;
  new?: boolean;
  weight: string;
  stock: number;
  outOfStock?: boolean;
}

interface GiftSet {
  id: number;
  name: string;
  nameKo: string;
  nameRu: string;
  price: number;
  description: string;
  descriptionKo: string;
  descriptionRu: string;
  includes: string[];
  image: string;
  bestseller?: boolean;
  stock: number;
  outOfStock?: boolean;
}

export function AdminPanel({ isOpen, onClose, language }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'subscribers' | 'products' | 'giftsets'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscribers, setSubscribers] = useState<string[]>([]);
  const [, setSelectedOrder] = useState<Order | null>(null);
  const { getAllOrders, updateOrderStatus, markOrderAsPrinted, getAllSubscribers } = useAuth();
  
  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [giftSets, setGiftSets] = useState<GiftSet[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingGiftSet, setEditingGiftSet] = useState<GiftSet | null>(null);

  useEffect(() => {
    if (isOpen) {
      setOrders(getAllOrders());
      setSubscribers(getAllSubscribers());
      // Load products from localStorage or use initial
      const savedProducts = localStorage.getItem('lumi_tea_products');
      const savedGiftSets = localStorage.getItem('lumi_tea_giftsets');
      setProducts(savedProducts ? JSON.parse(savedProducts) : initialProducts);
      setGiftSets(savedGiftSets ? JSON.parse(savedGiftSets) : initialGiftSets);
    }
  }, [isOpen]);

  const content = {
    en: {
      title: 'Admin Panel',
      orders: 'Orders',
      subscribers: 'Subscribers',
      products: 'Products',
      giftSets: 'Gift Sets',
      pending: 'Pending',
      all: 'All',
      orderId: 'Order ID',
      customer: 'Customer',
      total: 'Total',
      status: 'Status',
      date: 'Date',
      print: 'Print Label',
      printed: 'Printed',
      markShipped: 'Mark Shipped',
      markDelivered: 'Mark Delivered',
      noOrders: 'No orders yet',
      noSubscribers: 'No subscribers yet',
      refresh: 'Refresh',
      export: 'Export',
      shippingLabel: 'Shipping Label',
      edit: 'Edit',
      save: 'Save',
      apply: 'Apply Changes',
      cancel: 'Cancel',
      price: 'Price',
      originalPrice: 'Original Price',
      discount: 'Discount',
      stock: 'Stock',
      name: 'Name',
      description: 'Description',
      outOfStock: 'Out of Stock',
      applyDiscount: 'Apply Discount %',
      bulkEdit: 'Bulk Edit',
      addStock: 'Add Stock',
      reduceStock: 'Reduce Stock',
      changesApplied: 'Changes applied successfully!'
    },
    ko: {
      title: '관리자 패널',
      orders: '주문',
      subscribers: '구독자',
      products: '상품',
      giftSets: '선물 세트',
      pending: '대기 중',
      all: '전체',
      orderId: '주문번호',
      customer: '고객',
      total: '총액',
      status: '상태',
      date: '날짜',
      print: '라벨 인쇄',
      printed: '인쇄됨',
      markShipped: '발송 완료',
      markDelivered: '배송 완료',
      noOrders: '주문이 없습니다',
      noSubscribers: '구독자가 없습니다',
      refresh: '새로고침',
      export: '낳출',
      shippingLabel: '배송 라벨',
      edit: '수정',
      save: '저장',
      apply: '변경사항 적용',
      cancel: '취소',
      price: '가격',
      originalPrice: '원래 가격',
      discount: '할인',
      stock: '재고',
      name: '이름',
      description: '설명',
      outOfStock: '품절',
      applyDiscount: '할인 % 적용',
      bulkEdit: '일괄 수정',
      addStock: '재고 추가',
      reduceStock: '재고 감소',
      changesApplied: '변경사항이 적용되었습니다!'
    },
    ru: {
      title: 'Админ панель',
      orders: 'Заказы',
      subscribers: 'Подписчики',
      products: 'Товары',
      giftSets: 'Подарочные наборы',
      pending: 'В ожидании',
      all: 'Все',
      orderId: 'Номер заказа',
      customer: 'Клиент',
      total: 'Итого',
      status: 'Статус',
      date: 'Дата',
      print: 'Печать наклейки',
      printed: 'Напечатано',
      markShipped: 'Отм. отправлено',
      markDelivered: 'Отм. доставлено',
      noOrders: 'Заказов пока нет',
      noSubscribers: 'Подписчиков пока нет',
      refresh: 'Обновить',
      export: 'Экспорт',
      shippingLabel: 'Наклейка доставки',
      edit: 'Изменить',
      save: 'Сохранить',
      apply: 'Применить изменения',
      cancel: 'Отмена',
      price: 'Цена',
      originalPrice: 'Оригинальная цена',
      discount: 'Скидка',
      stock: 'Остаток',
      name: 'Название',
      description: 'Описание',
      outOfStock: 'Нет в наличии',
      applyDiscount: 'Применить скидку %',
      bulkEdit: 'Массовое редактирование',
      addStock: 'Добавить остаток',
      reduceStock: 'Уменьшить остаток',
      changesApplied: 'Изменения применены!'
    }
  };

  const t = content[language];

  const getStatusBadge = (status: Order['status']) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      paid: 'bg-green-100 text-green-700',
      shipped: 'bg-blue-100 text-blue-700',
      delivered: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return styles[status] || styles.pending;
  };

  const handlePrintLabel = (order: Order) => {
    setSelectedOrder(order);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const labelHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Shipping Label - ${order.orderId}</title>
          <style>
            @media print {
              body { margin: 0; padding: 10mm; }
              .label { width: 100mm; height: 150mm; border: 2px solid #000; padding: 10mm; box-sizing: border-box; }
            }
            body { font-family: Arial, sans-serif; font-size: 12pt; }
            .label { width: 100mm; min-height: 150mm; border: 2px solid #000; padding: 10mm; margin: 0 auto; }
            .header { text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 5mm; margin-bottom: 5mm; }
            .logo { font-size: 18pt; font-weight: bold; color: #e91e63; }
            .order-id { font-size: 10pt; color: #666; }
            .section { margin: 5mm 0; }
            .section-title { font-weight: bold; font-size: 10pt; color: #666; margin-bottom: 2mm; }
            .recipient { font-size: 14pt; font-weight: bold; }
            .address { font-size: 11pt; line-height: 1.4; }
            .phone { font-size: 11pt; margin-top: 2mm; }
            .items { margin-top: 5mm; }
            .item { font-size: 10pt; margin: 1mm 0; }
            .footer { margin-top: 5mm; padding-top: 5mm; border-top: 1px solid #ccc; text-align: center; font-size: 9pt; color: #666; }
            .barcode { text-align: center; margin: 5mm 0; font-family: monospace; font-size: 14pt; letter-spacing: 2px; }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="header">
              <div class="logo">LUMI TEA</div>
              <div class="order-id">Order: ${order.orderId}</div>
            </div>
            
            <div class="section">
              <div class="section-title">RECIPIENT / 수령인</div>
              <div class="recipient">${order.address.name}</div>
              <div class="phone">📞 ${order.address.phone}</div>
            </div>
            
            <div class="section">
              <div class="section-title">ADDRESS / 주소</div>
              <div class="address">
                ${order.address.postalCode}<br>
                ${order.address.address1}<br>
                ${order.address.address2 || ''}
              </div>
            </div>
            
            <div class="section items">
              <div class="section-title">ITEMS / 상품</div>
              ${order.items.map(item => `<div class="item">• ${item.name} x${item.quantity}</div>`).join('')}
            </div>
            
            <div class="barcode">*${order.orderId}*</div>
            
            <div class="footer">
              Thank you for choosing Lumi Tea!<br>
              문의: lumitea.kr@gmail.com | 8032 5445
            </div>
          </div>
          <script>window.onload = () => { window.print(); };</script>
        </body>
        </html>
      `;
      
      printWindow.document.write(labelHTML);
      printWindow.document.close();
      
      markOrderAsPrinted(order.orderId);
      setOrders(getAllOrders());
    }
  };

  const handleExportOrders = () => {
    const csvContent = [
      ['Order ID', 'Date', 'Customer', 'Email', 'Phone', 'Address', 'Items', 'Total', 'Status'].join(','),
      ...orders.map(o => [
        o.orderId,
        new Date(o.createdAt).toLocaleString(),
        o.userName,
        o.userEmail,
        o.address.phone,
        `"${o.address.postalCode} ${o.address.address1} ${o.address.address2 || ''}"`,
        `"${o.items.map(i => `${i.name} x${i.quantity}`).join(', ')}"`,
        o.total,
        o.status
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lumi-tea-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleExportSubscribers = () => {
    const content = subscribers.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lumi-tea-subscribers-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  // Product management functions
  const saveProduct = (product: Product) => {
    const updatedProducts = products.map(p => p.id === product.id ? product : p);
    setProducts(updatedProducts);
    localStorage.setItem('lumi_tea_products', JSON.stringify(updatedProducts));
    // Trigger storage event for other tabs
    window.dispatchEvent(new StorageEvent('storage', { key: 'lumi_tea_products' }));
    setEditingProduct(null);
    alert(t.changesApplied);
  };

  const saveGiftSet = (giftSet: GiftSet) => {
    const updatedGiftSets = giftSets.map(g => g.id === giftSet.id ? giftSet : g);
    setGiftSets(updatedGiftSets);
    localStorage.setItem('lumi_tea_giftsets', JSON.stringify(updatedGiftSets));
    // Trigger storage event for other tabs
    window.dispatchEvent(new StorageEvent('storage', { key: 'lumi_tea_giftsets' }));
    setEditingGiftSet(null);
    alert(t.changesApplied);
  };

  const updateStock = (productId: number, delta: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const newStock = Math.max(0, product.stock + delta);
      const updated = { ...product, stock: newStock, outOfStock: newStock === 0 };
      saveProduct(updated);
    }
  };

  const toggleOutOfStock = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const updated = { ...product, outOfStock: !product.outOfStock };
      saveProduct(updated);
    }
  };

  // Refresh orders when tab changes
  useEffect(() => {
    if (activeTab === 'orders') {
      setOrders(getAllOrders());
    } else if (activeTab === 'subscribers') {
      setSubscribers(getAllSubscribers());
    }
  }, [activeTab]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <span className="gradient-text">{t.title}</span>
          </DialogTitle>
        </DialogHeader>
        
        {/* Tabs */}
        <div className="flex gap-4 border-b mb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-2 px-4 font-medium whitespace-nowrap ${activeTab === 'orders' ? 'border-b-2 border-pink-500 text-pink-500' : 'text-gray-500'}`}
          >
            <Package className="w-4 h-4 inline mr-1" />
            {t.orders} ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('subscribers')}
            className={`pb-2 px-4 font-medium whitespace-nowrap ${activeTab === 'subscribers' ? 'border-b-2 border-pink-500 text-pink-500' : 'text-gray-500'}`}
          >
            <Mail className="w-4 h-4 inline mr-1" />
            {t.subscribers} ({subscribers.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`pb-2 px-4 font-medium whitespace-nowrap ${activeTab === 'products' ? 'border-b-2 border-pink-500 text-pink-500' : 'text-gray-500'}`}
          >
            <Tag className="w-4 h-4 inline mr-1" />
            {t.products} ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('giftsets')}
            className={`pb-2 px-4 font-medium whitespace-nowrap ${activeTab === 'giftsets' ? 'border-b-2 border-pink-500 text-pink-500' : 'text-gray-500'}`}
          >
            <Box className="w-4 h-4 inline mr-1" />
            {t.giftSets} ({giftSets.length})
          </button>
        </div>

        {activeTab === 'orders' && (
          <div>
            <div className="flex justify-between mb-4">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setOrders(getAllOrders())}>
                  <Clock className="w-4 h-4 mr-1" /> {t.refresh}
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportOrders}>
                <Download className="w-4 h-4 mr-1" /> {t.export}
              </Button>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-12 text-gray-500">{t.noOrders}</div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div key={order.orderId} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-bold">{order.orderId}</span>
                        <span className="text-gray-500 text-sm ml-2">{new Date(order.createdAt).toLocaleString()}</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {order.userName} | {order.address.name} | {order.total.toLocaleString()} ₩
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handlePrintLabel(order)}
                        disabled={order.printed}
                      >
                        {order.printed ? <Check className="w-4 h-4 mr-1" /> : <Printer className="w-4 h-4 mr-1" />}
                        {order.printed ? t.printed : t.print}
                      </Button>
                      {order.status === 'paid' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => { updateOrderStatus(order.orderId, 'shipped'); setOrders(getAllOrders()); }}
                        >
                          <Truck className="w-4 h-4 mr-1" /> {t.markShipped}
                        </Button>
                      )}
                      {order.status === 'shipped' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => { updateOrderStatus(order.orderId, 'delivered'); setOrders(getAllOrders()); }}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" /> {t.markDelivered}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'subscribers' && (
          <div>
            <div className="flex justify-end mb-4">
              <Button variant="outline" size="sm" onClick={handleExportSubscribers}>
                <Download className="w-4 h-4 mr-1" /> {t.export}
              </Button>
            </div>
            
            {subscribers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">{t.noSubscribers}</div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {subscribers.map((email, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{email}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {products.map((product) => (
                <div key={product.id} className="bg-gray-50 rounded-lg p-4">
                  {editingProduct?.id === product.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500">{t.name} (EN)</label>
                          <Input 
                            value={editingProduct.name} 
                            onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">{t.price}</label>
                          <Input 
                            type="number" 
                            value={editingProduct.price} 
                            onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500">{t.originalPrice}</label>
                          <Input 
                            type="number" 
                            value={editingProduct.originalPrice || ''} 
                            placeholder="No discount"
                            onChange={(e) => setEditingProduct({...editingProduct, originalPrice: e.target.value ? Number(e.target.value) : undefined})}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">{t.stock}</label>
                          <Input 
                            type="number" 
                            value={editingProduct.stock} 
                            onChange={(e) => setEditingProduct({...editingProduct, stock: Number(e.target.value)})}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">{t.description} (EN)</label>
                        <textarea
                          value={editingProduct.description}
                          onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[60px]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveProduct(editingProduct)} className="bg-pink-500 hover:bg-pink-600">
                          <Save className="w-4 h-4 mr-1" /> {t.apply}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingProduct(null)}>
                          <X className="w-4 h-4 mr-1" /> {t.cancel}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{product.name}</span>
                          {product.originalPrice && (
                            <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded">
                              -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                            </span>
                          )}
                          {product.outOfStock && (
                            <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded">
                              {t.outOfStock}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.price.toLocaleString()} ₩ 
                          {product.originalPrice && (
                            <span className="line-through text-gray-400 ml-1">
                              {product.originalPrice.toLocaleString()} ₩
                            </span>
                          )}
                          | {t.stock}: {product.stock}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingProduct(product)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateStock(product.id, 10)}>
                          +10
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateStock(product.id, -10)}>
                          -10
                        </Button>
                        <Button 
                          size="sm" 
                          variant={product.outOfStock ? "default" : "outline"}
                          onClick={() => toggleOutOfStock(product.id)}
                        >
                          {product.outOfStock ? 'In Stock' : t.outOfStock}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'giftsets' && (
          <div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {giftSets.map((giftSet) => (
                <div key={giftSet.id} className="bg-gray-50 rounded-lg p-4">
                  {editingGiftSet?.id === giftSet.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500">{t.name} (EN)</label>
                          <Input 
                            value={editingGiftSet.name} 
                            onChange={(e) => setEditingGiftSet({...editingGiftSet, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">{t.price}</label>
                          <Input 
                            type="number" 
                            value={editingGiftSet.price} 
                            onChange={(e) => setEditingGiftSet({...editingGiftSet, price: Number(e.target.value)})}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">{t.stock}</label>
                        <Input 
                          type="number" 
                          value={editingGiftSet.stock} 
                          onChange={(e) => setEditingGiftSet({...editingGiftSet, stock: Number(e.target.value)})}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">{t.description} (EN)</label>
                        <textarea
                          value={editingGiftSet.description}
                          onChange={(e) => setEditingGiftSet({...editingGiftSet, description: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[60px]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveGiftSet(editingGiftSet)} className="bg-pink-500 hover:bg-pink-600">
                          <Save className="w-4 h-4 mr-1" /> {t.apply}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingGiftSet(null)}>
                          <X className="w-4 h-4 mr-1" /> {t.cancel}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{giftSet.name}</span>
                          {giftSet.outOfStock && (
                            <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded">
                              {t.outOfStock}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {giftSet.price.toLocaleString()} ₩ | {t.stock}: {giftSet.stock}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditingGiftSet(giftSet)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant={giftSet.outOfStock ? "default" : "outline"}
                          onClick={() => {
                            const updated = { ...giftSet, outOfStock: !giftSet.outOfStock };
                            saveGiftSet(updated);
                          }}
                        >
                          {giftSet.outOfStock ? 'In Stock' : t.outOfStock}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
