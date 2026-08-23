import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { snap } from '@/lib/midtrans'

export async function POST(req) {
  try {
    const { productId, productName, price, gameUserId, gameZoneId, buyerContact } = await req.json()

    const { data: product, error: prodError } = await supabase
      .from('products')
      .select('stock')
      .eq('id', productId)
      .single()

    if (prodError || !product || product.stock <= 0) {
      return NextResponse.json({ message: 'Stok produk habis atau tidak ditemukan' }, { status: 400 })
    }

    const invoiceId = `INV-${Date.now()}`

    await supabase.from('transactions').insert([
      {
        invoice_id: invoiceId,
        product_id: productId,
        buyer_contact: buyerContact,
        game_user_id: gameUserId,
        game_zone_id: gameZoneId,
        total_price: price,
        status: 'pending'
      }
    ])

    const parameter = {
      transaction_details: { order_id: invoiceId, gross_amount: price },
      customer_details: { phone: buyerContact },
      item_details: [{ id: productId, price: price, quantity: 1, name: productName }]
    }

    const transaction = await snap.createTransaction(parameter)

    return NextResponse.json({ token: transaction.token, invoiceId })
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 })
  }
}
