-- FIX-002 — Academia de Segurança O&M Solar
-- Corrige o registro da conclusão e permite liberar o próximo treinamento.
-- Execute este SQL no Supabase SQL Editor do projeto da Academia.

create or replace function public.academia_complete_training(
  p_profile_id uuid,
  p_track_number integer,
  p_certificate_code text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles where id = p_profile_id
  ) then
    raise exception 'Perfil não encontrado';
  end if;

  -- Registra/atualiza o progresso do treinamento.
  insert into public.training_progress(
    profile_id,
    track_number,
    status,
    score,
    xp,
    completed_at
  )
  values (
    p_profile_id,
    p_track_number,
    'completed',
    100,
    100,
    now()
  )
  on conflict (profile_id, track_number) do update
    set status = 'completed',
        score = 100,
        xp = 100,
        completed_at = coalesce(public.training_progress.completed_at, now());

  -- Evita depender de uma constraint UNIQUE específica em certificate_code.
  -- Se o certificado daquele treinamento já existir, ele é substituído.
  delete from public.certificates
  where profile_id = p_profile_id
    and track_number = p_track_number;

  insert into public.certificates(
    profile_id,
    track_number,
    certificate_code
  )
  values (
    p_profile_id,
    p_track_number,
    p_certificate_code
  );

  return true;
end;
$$;

grant execute on function public.academia_complete_training(uuid, integer, text)
to anon, authenticated;

-- Teste esperado após executar:
-- 1. Login com um colaborador de teste.
-- 2. Concluir o Dia 1.
-- 3. Clicar em VER RESULTADO.
-- 4. Deve aparecer a tela de conclusão.
-- 5. Voltar para a trilha.
-- 6. O Dia 2 deve aparecer desbloqueado.
