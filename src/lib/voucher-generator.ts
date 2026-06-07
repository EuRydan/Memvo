export function generateVoucherCode(): string {
  // Gera 4 números aleatórios (0000 a 9999) garantindo o padding com zeros
  const part1 = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  const part2 = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  
  return `me_${part1}-${part2}`
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
