'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Revalidates cache for tour-related pages.
 * @param slug - The slug of the tour that was created or updated.
 */
export async function revalidateTourCache(slug: string) {
  // Revalidate the specific tour page
  revalidatePath(`/tours/${slug}`);

  // Revalidate the main tours search page
  revalidatePath('/tours/search');

  // Revalidate the home page (for featured products)
  revalidatePath('/');

  console.log(`Revalidated cache for slug: ${slug}`);
}

/**
 * Marks a transaction as 'paid'.
 * @param transactionId - The ID of the transaction to update.
 */
export async function markTransactionAsPaid(transactionId: string) {
  if (!transactionId) {
    return { error: 'Transaction ID is required.' };
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .update({ status: 'paid', payment_date: new Date().toISOString() })
      .eq('id', transactionId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Revalidate the finance page to show the change
    revalidatePath('/admin/finance');
    revalidatePath('/admin/(protected)/finance');


    return { data };
  } catch (error: any) {
    console.error('Error marking transaction as paid:', error.message);
    return { error: error.message };
  }
}
