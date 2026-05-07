import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Bypass RLS
);

export async function POST(request: Request) {
  try {
    const { action, payload, id } = await request.json();

    if (action === 'insert') {
        const { error } = await supabaseAdmin.from('coupons').insert([payload]);
        if (error) throw error;
    } else if (action === 'update') {
        const { error } = await supabaseAdmin.from('coupons').update(payload).eq('id', id);
        if (error) throw error;
    } else if (action === 'delete') {
        const { error } = await supabaseAdmin.from('coupons').delete().eq('id', id);
        if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
