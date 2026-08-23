'use client'
import { useState, useEffect } from 'react'

export default function CheckoutForm({ product }) {
  const [gameUserId, setGameUserId] = useState('')
  const [gameZoneId, setGameZoneId] = useState('')
  const [buyerContact, setBuyerContact] = useState('')
  const [loading, setLoading] = useState(false)

  const isSoldOut = product.stock <= 0

  useEffect(() => {
    const scriptScript = document.createElement('script')
    scriptScript.src = "https://app.sandbox.midtrans.com/snap/snap.js"
    scriptScript.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY)
    document.body.appendChild(scriptScript)
  }, [])

  const handleCheckout = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          price: product.price,
          gameUserId,
          gameZoneId,
          buyerContact
        })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message || 'Gagal membuat transaksi')

      window.snap.pay(data.token, {
        onSuccess: function (result) { alert("Pembayaran Berhasil!"); },
        onPending: function (result) { alert("Menunggu pembayaran..."); },
        onError: function (result) { alert("Pembayaran Gagal!"); }
      })

    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border rounded-xl p-6 shadow-md bg-white max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2 text-black">{product.name}</h2>
      <p className="text-blue-600 font-semibold mb-4">Rp {product.price.toLocaleString('id-ID')}</p>

      {isSoldOut ? (
        <div className="w-full bg-red-100 text-red-600 font-bold py-3 rounded-lg text-center">
          Stok Telah Sold Out
        </div>
      ) : (
        <form onSubmit={handleCheckout} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">User ID Game</label>
            <input 
              type="text" 
              required
              placeholder="Contoh: 12345678" 
              value={gameUserId} 
              onChange={(e) => setGameUserId(e.target.value)}
              className="mt-1 w-full border rounded-lg p-2 text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Zone / Server ID (Opsional)</label>
            <input 
              type="text" 
              placeholder="Contoh: 1234" 
              value={gameZoneId} 
              onChange={(e) => setGameZoneId(e.target.value)}
              className="mt-1 w-full border rounded-lg p-2 text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">No. WhatsApp</label>
            <input 
              type="text" 
              required
              placeholder="08123456789" 
              value={buyerContact} 
              onChange={(e) => setBuyerContact(e.target.value)}
              className="mt-1 w-full border rounded-lg p-2 text-black"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
          >
            {loading ? 'Memproses...' : `Beli Sekarang (Sisa Stok: ${product.stock})`}
          </button>
        </form>
      )}
    </div>
  )
}
