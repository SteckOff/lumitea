// Order tracking page — public lookup by order_no + email.
// Customers don't need an account: they enter the order number from their
// receipt and the email they used at checkout.

import { useState } from 'react';
import { Search, Package, Truck, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface OrderLookup {
  order_no: string;
  status: string;
  total: number;
  tracking_code: string | null;
  carrier: string | null;
  created_at: string;
  items: Array<{ name_snapshot: string; quantity: number }>;
}

const STATUS_META: Record<string, { icon: typeof Package; color: string; label: string }> = {
  pending:   { icon: Clock,         color: 'text-orange-600',  label: 'Payment pending' },
  paid:      { icon: CheckCircle2,  color: 'text-green-600',   label: 'Paid — preparing your order' },
  shipped:   { icon: Truck,         color: 'text-blue-600',    label: 'Shipped' },
  delivered: { icon: Package,       color: 'text-gray-700',    label: 'Delivered' },
  cancelled: { icon: XCircle,       color: 'text-red-600',     label: 'Cancelled' },
  refunded:  { icon: XCircle,       color: 'text-purple-600',  label: 'Refunded' },
};

export function TrackOrderPage() {
  const [orderNo, setOrderNo] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderLookup | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const lookup = async () => {
    setErr(null);
    setOrder(null);
    if (!orderNo.trim() || !email.trim()) {
      setErr('Please enter both order number and email.');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('order_no, status, total, tracking_code, carrier, created_at, items')
        .eq('order_no', orderNo.trim())
        .eq('user_email', email.trim())
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        setErr('No order found with this number and email.');
      } else {
        setOrder(data as OrderLookup);
      }
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-16 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">Track Your Order</h1>
        <p className="text-gray-600 text-center mb-8">
          Enter the order number from your confirmation email and the email you used at checkout.
        </p>

        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Order number</label>
            <Input
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
              placeholder="LT-20260516-0042"
              onKeyDown={(e) => e.key === 'Enter' && lookup()}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              onKeyDown={(e) => e.key === 'Enter' && lookup()}
            />
          </div>
          <Button onClick={lookup} disabled={loading} className="w-full bg-pink-600 hover:bg-pink-700">
            <Search className="h-4 w-4 mr-2" />
            {loading ? 'Searching…' : 'Track order'}
          </Button>
          {err && <p className="text-sm text-red-600 text-center">{err}</p>}
        </div>

        {order && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
            {(() => {
              const meta = STATUS_META[order.status] ?? STATUS_META.pending;
              const Icon = meta.icon;
              return (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className={`h-8 w-8 ${meta.color}`} />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Status</p>
                      <p className={`text-lg font-semibold ${meta.color}`}>{meta.label}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm border-t pt-4">
                    <div>
                      <p className="text-gray-500">Order #</p>
                      <p className="font-medium">{order.order_no}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500">Total</p>
                      <p className="font-medium">₩{order.total.toLocaleString('ko-KR')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Date</p>
                      <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500">Items</p>
                      <p className="font-medium">{order.items?.length ?? 0}</p>
                    </div>
                  </div>

                  {order.tracking_code && (
                    <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <p className="text-xs uppercase tracking-wide text-blue-700 mb-1">Tracking</p>
                      <p className="font-mono font-semibold text-blue-900">{order.tracking_code}</p>
                      {order.carrier && (
                        <p className="text-xs text-blue-700 mt-1">{order.carrier}</p>
                      )}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
