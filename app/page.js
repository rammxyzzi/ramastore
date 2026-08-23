import { supabase } from '@/lib/supabase'
import CheckoutForm from '@/components/CheckoutForm'

async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Gagal mengambil produk:', error.message)
    return []
  }
  return data || []
}

export default async function Home() {
  const products = await getProducts()

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900">Neptune Store</h1>
          <p className="text-gray-600 mt-2">Top Up Game & Jual Akun Terpercaya</p>
        </header>

        {products.length === 0 ? (
          <div className="text-center bg-white p-8 rounded-xl shadow-sm border">
            <p className="text-gray-500">Belum ada produk yang tersedia saat ini.</p>
            <p className="text-sm text-gray-400 mt-1">Silakan tambahkan data produk terlebih dahulu di tabel Supabase.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {products.map((product) => (
              <CheckoutForm key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
