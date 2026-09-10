'use client';

import { useState } from 'react';
import { User, Package, MapPin, LogOut } from 'lucide-react';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'Order History', icon: Package },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
];

// Mock data — replace with real user/order data once auth + backend
// (Week 6-7) are connected.
const MOCK_ORDERS = [
  { id: 'DEORA-1001', date: 'Aug 28, 2026', status: 'Delivered', total: 'Rs. 2,850.00' },
  { id: 'DEORA-1002', date: 'Sep 02, 2026', status: 'Processing', total: 'Rs. 1,600.00' },
];

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-2xl font-bold" style={{ color: 'var(--color-ink)' }}>
        My Account
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <div
          className="flex h-fit flex-col gap-1 rounded-lg border p-3"
          style={{ borderColor: 'var(--color-line)' }}
        >
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium"
              style={{
                background: activeTab === id ? 'rgba(27, 67, 50, 0.1)' : 'transparent',
                color: activeTab === id ? 'var(--color-brand-dark)' : 'var(--color-ink)',
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
          <button
            className="mt-2 flex items-center gap-3 rounded-md border-t px-3 py-2 pt-4 text-left text-sm font-medium"
            style={{ borderColor: 'var(--color-line)', color: 'var(--color-muted)' }}
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>

        {/* Content */}
        <div className="rounded-lg border p-6" style={{ borderColor: 'var(--color-line)' }}>
          {activeTab === 'profile' && (
            <div>
              <h2 className="font-display text-lg font-bold" style={{ color: 'var(--color-ink)' }}>
                Profile Details
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>Full Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="mt-1 w-full rounded-md border px-4 py-2 text-sm outline-none"
                    style={{ borderColor: 'var(--color-line)', color: 'var(--color-ink)' }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium" style={{ color: 'var(--color-ink)' }}>Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="mt-1 w-full rounded-md border px-4 py-2 text-sm outline-none"
                    style={{ borderColor: 'var(--color-line)', color: 'var(--color-ink)' }}
                  />
                </div>
              </div>
              <button
                className="mt-6 rounded-md px-6 py-2 text-sm font-semibold text-white"
                style={{ background: 'var(--color-brand)' }}
              >
                Save Changes
              </button>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 className="font-display text-lg font-bold" style={{ color: 'var(--color-ink)' }}>
                Order History
              </h2>
              <div className="mt-4 flex flex-col gap-3">
                {MOCK_ORDERS.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-md border p-4 text-sm"
                    style={{ borderColor: 'var(--color-line)' }}
                  >
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--color-ink)' }}>{order.id}</p>
                      <p style={{ color: 'var(--color-muted)' }}>{order.date}</p>
                    </div>
                    <span
                      className="rounded-full px-3 py-1 text-xs font-medium"
                      style={{
                        background: order.status === 'Delivered' ? 'rgba(27, 67, 50, 0.1)' : 'rgba(232,184,75,0.15)',
                        color: order.status === 'Delivered' ? 'var(--color-brand-dark)' : 'var(--color-secondary)',
                      }}
                    >
                      {order.status}
                    </span>
                    <span className="font-semibold" style={{ color: 'var(--color-ink)' }}>{order.total}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div>
              <h2 className="font-display text-lg font-bold" style={{ color: 'var(--color-ink)' }}>
                Saved Addresses
              </h2>
              <p className="mt-4 text-sm" style={{ color: 'var(--color-muted)' }}>
                No saved addresses yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}