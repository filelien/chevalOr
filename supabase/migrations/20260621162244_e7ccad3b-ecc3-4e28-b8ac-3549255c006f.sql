
REVOKE EXECUTE ON FUNCTION public.is_room_available(uuid, date, date, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.find_available_room(date, date, integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_room_available(uuid, date, date, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.find_available_room(date, date, integer, text) TO authenticated;
