// app/api/cron/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET() {
  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

    // 1. Encontrar reservas pendentes e antigas
    const { data: pendingBookings, error: fetchError } = await supabaseAdmin
      .from('bookings')
      .select('id, quantity, product_id, travel_date')
      .eq('status', 'pending_payment')
      .lt('created_at', fifteenMinutesAgo);

    if (fetchError) throw fetchError;
    if (!pendingBookings || pendingBookings.length === 0) {
      return NextResponse.json({ message: 'Nenhuma reserva abandonada para limpar.' });
    }

    const releasePromises = pendingBookings.map(booking => {
      // 2. Liberar as vagas
      return supabaseAdmin.rpc('release_inventory_for_booking', {
        p_booking_id: booking.id
      });
    });
    
    await Promise.all(releasePromises);
    
    // 3. Marcar reservas como abandonadas
    const abandonedBookingIds = pendingBookings.map(b => b.id);
    await supabaseAdmin
      .from('bookings')
      .update({ status: 'abandoned', payment_status: 'abandoned' })
      .in('id', abandonedBookingIds);

    console.log(`🧹 Limpeza de ${abandonedBookingIds.length} reservas abandonadas.`);
    return NextResponse.json({ success: true, cleaned: abandonedBookingIds.length });

  } catch (error: any) {
    console.error('Erro no Cron de Limpeza:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
