-- 1. Remove the highly insecure policy that allows anyone to read any voucher
DROP POLICY IF EXISTS "Qualquer usuário pode validar códigos" ON vouchers;

-- 2. Create a secure policy that allows users to ONLY read vouchers eles mesmos compraram
CREATE POLICY "Apenas o comprador pode ver seus próprios vouchers"
ON vouchers FOR SELECT
TO authenticated
USING (auth.uid() = purchaser_id);
