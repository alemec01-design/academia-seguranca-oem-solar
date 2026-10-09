-- FIX-002 / FIX-003 — conclusão, XP e progressão sequencial
-- Execute no SQL Editor do projeto Supabase da Academia.
-- Esta função pressupõe as colunas profile_id, track_number, status, score, xp, completed_at
-- em training_progress e profile_id, track_number, certificate_code em certificates.

create or replace function public.academia_complete_training(
  p_profile_id uuid,
  p_track_number integer,
  p_certificate_code text,
  p_score integer default 100
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_score integer := greatest(0, least(100, coalesce(p_score, 100)));
begin
  if p_profile_id is null or p_track_number is null or p_track_number < 1 or p_track_number > 300 then
    raise exception 'Parâmetros de conclusão inválidos';
  end if;
  if not exists (select 1 from public.profiles where id = p_profile_id) then
    raise exception 'Perfil não encontrado para profile_id informado';
  end if;
  if v_score < 67 then
    raise exception 'A pontuação mínima para concluir é 67';
  end if;
  if p_track_number > 1 and not exists (
    select 1 from public.training_progress
    where profile_id = p_profile_id and track_number = p_track_number - 1 and status = 'completed'
  ) then
    raise exception 'O treinamento anterior ainda não foi concluído';
  end if;

  insert into public.training_progress(profile_id, track_number, status, score, xp, completed_at)
  values (p_profile_id, p_track_number, 'completed', v_score, 100, now())
  on conflict (profile_id, track_number) do update
    set status = 'completed',
        score = greatest(public.training_progress.score, excluded.score),
        xp = greatest(public.training_progress.xp, excluded.xp),
        completed_at = coalesce(public.training_progress.completed_at, excluded.completed_at);

  delete from public.certificates
  where profile_id = p_profile_id and track_number = p_track_number;
  insert into public.certificates(profile_id, track_number, certificate_code)
  values (p_profile_id, p_track_number, p_certificate_code);
  return true;
end;
$$;

grant execute on function public.academia_complete_training(uuid, integer, text, integer) to anon, authenticated;
-- Nota: esta RPC deve ser validada no projeto de teste antes de produção, pois depende do esquema acima.
