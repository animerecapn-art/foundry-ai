import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify authentication
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({ error: 'Razorpay secret key not configured' }, { status: 500 });
    }

    // 2. Verify signature
    // Formula: SHA256(order_id + "|" + payment_id, secret)
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValid = generatedSignature === razorpay_signature;

    if (!isValid) {
      return NextResponse.json({ error: 'Signature verification failed' }, { status: 400 });
    }

    // 3. Update profile to Pro in Database
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        plan: 'pro',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) throw new Error(updateError.message);

    // 4. Log activity
    await supabase.from('activities').insert({
      user_id: user.id,
      type: 'checklist_item', // repurposed or logged as account upgraded activity
      title: 'Plan Upgraded to Pro 👑',
      description: `Billing plan upgraded successfully via Razorpay transaction ${razorpay_payment_id.slice(0, 10)}...`,
    });

    return NextResponse.json({
      success: true,
      message: 'Plan upgraded to Pro successfully',
    });
  } catch (error) {
    console.error('Razorpay verification error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Verification failed' },
      { status: 500 }
    );
  }
}
