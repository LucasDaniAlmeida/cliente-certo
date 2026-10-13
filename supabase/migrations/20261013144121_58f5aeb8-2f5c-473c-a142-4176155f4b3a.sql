GRANT SELECT, INSERT, UPDATE ON public.clientes TO authenticated;
GRANT ALL ON public.clientes TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_roles_read_own ON public.user_roles FOR SELECT TO authenticated USING (user_id = (select auth.uid()));
CREATE POLICY clientes_insert_staff ON public.clientes FOR INSERT TO authenticated WITH CHECK (public.has_app_role('admin') OR public.has_app_role('operador'));
CREATE POLICY clientes_update_staff ON public.clientes FOR UPDATE TO authenticated USING (public.has_app_role('admin') OR public.has_app_role('operador')) WITH CHECK (public.has_app_role('admin') OR public.has_app_role('operador'));
ALTER TABLE public.clientes ALTER COLUMN status SET DEFAULT 'Entrar em contato';
CREATE OR REPLACE FUNCTION public.validate_cliente() RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
IF NEW.status IS NOT NULL AND NEW.status NOT IN ('Entrar em contato','Sem resposta','Contato feito','Recusado','Proposta','Agendamento','Fechado') THEN RAISE EXCEPTION 'Situação inválida'; END IF;
IF NEW.status = 'Agendamento' AND NEW.data_agendamento IS NULL THEN RAISE EXCEPTION 'Preencha a data do agendamento'; END IF;
IF length(coalesce(NEW.obs,'')) > 10000 THEN RAISE EXCEPTION 'Observação muito longa'; END IF;
RETURN NEW;
END $$;
CREATE TRIGGER validate_cliente_before_save BEFORE INSERT OR UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.validate_cliente();
CREATE OR REPLACE FUNCTION public.import_clientes(rows_data jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE r jsonb; added int:=0; duplicates int:=0; errors int:=0; cp text; cn text; nm text; phones text[];
BEGIN
IF NOT (public.has_app_role('admin') OR public.has_app_role('operador')) THEN RAISE EXCEPTION 'Acesso não autorizado'; END IF;
IF jsonb_typeof(rows_data) <> 'array' OR jsonb_array_length(rows_data)>500 THEN RAISE EXCEPTION 'Lote inválido'; END IF;
PERFORM pg_advisory_xact_lock(874512390);
FOR r IN SELECT value FROM jsonb_array_elements(rows_data) LOOP
BEGIN
cp:=regexp_replace(coalesce(r->>'cpf',''),'\D','','g'); cn:=regexp_replace(coalesce(r->>'cnpj',''),'\D','','g'); nm:=lower(btrim(coalesce(r->>'nome','')));
SELECT coalesce(array_agg(value), ARRAY[]::text[]) INTO phones FROM jsonb_array_elements_text(coalesce(r->'telefone','[]'::jsonb));
IF nm='' AND coalesce(r->>'nome_fantasia','')='' AND cp='' AND cn='' THEN errors:=errors+1; CONTINUE; END IF;
IF EXISTS (SELECT 1 FROM public.clientes c WHERE (cp<>'' AND regexp_replace(coalesce(c.cpf,''),'\D','','g')=cp) OR (cn<>'' AND regexp_replace(coalesce(c.cnpj,''),'\D','','g')=cn) OR (cp='' AND cn='' AND nm<>'' AND lower(btrim(coalesce(c.nome,'')))=nm AND (cardinality(phones)=0 OR EXISTS (SELECT 1 FROM unnest(c.telefone) p, unnest(phones) q WHERE regexp_replace(p,'\D','','g')=regexp_replace(q,'\D','','g'))))) THEN duplicates:=duplicates+1; CONTINUE; END IF;
INSERT INTO public.clientes(nome,nome_fantasia,cpf,cnpj,telefone,status) VALUES(nullif(r->>'nome',''),nullif(r->>'nome_fantasia',''),nullif(r->>'cpf',''),nullif(r->>'cnpj',''),phones,'Entrar em contato');
added:=added+1;
EXCEPTION WHEN others THEN errors:=errors+1;
END;
END LOOP;
RETURN jsonb_build_object('imported',added,'duplicates',duplicates,'errors',errors);
END $$;
REVOKE ALL ON FUNCTION public.import_clientes(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.import_clientes(jsonb) TO authenticated;
