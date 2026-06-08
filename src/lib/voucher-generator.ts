export function generateVoucherCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 11; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Função utilitária para uso futuro na API de criação de vouchers.
 * 
 * Como foi exigido que os números sejam únicos de forma absoluta e nunca se repitam:
 * No momento de gerar e salvar no Supabase, a API deverá rodar algo parecido com isso:
 * 
 * async function createUniqueVoucher(supabase: SupabaseClient) {
 *   let isUnique = false;
 *   let newCode = '';
 *   
 *   while (!isUnique) {
 *     newCode = generateVoucherCode();
 *     
 *     // Tenta encontrar se o código já existe
 *     const { data } = await supabase
 *       .from('vouchers')
 *       .select('id')
 *       .eq('code', newCode)
 *       .single();
 *       
 *     if (!data) {
 *       isUnique = true; // Se não encontrou, é inédito!
 *     }
 *   }
 *   
 *   return newCode;
 * }
 */
