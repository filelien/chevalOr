-- CMS publication scheduler helpers

CREATE OR REPLACE FUNCTION public.run_cms_publication_cycle()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_published INT := 0;
  v_archived INT := 0;
BEGIN
  UPDATE public.cms_pages
  SET status = 'published',
      updated_at = now()
  WHERE status = 'scheduled'
    AND published_at IS NOT NULL
    AND published_at <= now();
  GET DIAGNOSTICS v_published = ROW_COUNT;

  UPDATE public.cms_pages
  SET status = 'archived',
      updated_at = now()
  WHERE status = 'published'
    AND expires_at IS NOT NULL
    AND expires_at <= now();
  GET DIAGNOSTICS v_archived = ROW_COUNT;

  RETURN jsonb_build_object(
    'published_now', v_published,
    'archived_now', v_archived,
    'ran_at', now()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.run_cms_publication_cycle TO authenticated, service_role;
