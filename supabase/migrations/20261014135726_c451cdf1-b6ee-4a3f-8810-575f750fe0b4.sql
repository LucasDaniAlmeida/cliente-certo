GRANT DELETE ON public.clientes TO authenticated;

CREATE POLICY clientes_delete_staff
ON public.clientes
FOR DELETE
TO authenticated
USING (
  (SELECT public.has_app_role('admin'::text))
  OR (SELECT public.has_app_role('operador'::text))
);