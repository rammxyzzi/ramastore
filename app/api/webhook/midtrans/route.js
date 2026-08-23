import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import crypto from 'crypto'

export async function POST(req) {
  try {
    const body = await req.json()
    const { order_id, status_code, gross_amount, signature_key, transaction_status, fraud_status } = body

    const serverKey = process.env.MIDTRANS_SERVER_KEY
    const hashString = order_id + status_code + gross_amount + serverKey
    const calculatedSignature = crypto.createHash('sha512').update(hashString).digest('hex')

    if (calculatedSignature !== signature_key) {
      return NextResponse.json({ message: 'Invalid signature' }, { status: 403 })
    }

    let newStatus = 'pending'
    if (transaction_status == 'capture' && fraud_status == 'accept' || transaction_status == 'settlement') {
      newStatus = 'paid'
    } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
      newStatus = 'failed'
    }

    await supabase.from('transactions').update({ status: newStatus }).eq('invoice_id', order_id)

    if (newStatus === 'paid') {
      const { data: trxData } = await supabase.from('transactions').select('product_id').eq('invoice_id', order_id).single()
      if (trxData) {
        await supabase.rpc('decrement_stock', { product_id: trxData.product_id })
      }
    }

    return NextResponse.json({ message: 'OK' })
  } catch (err) {
    return NextResponse.json({ message: 'Error' }, { status: 500 })
  }
}
