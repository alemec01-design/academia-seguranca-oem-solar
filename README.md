# Academia de Segurança O&M Solar — DUO FINAL FUNCIONAL

Interface inspirada na lógica de trilha de plataformas gamificadas de aprendizagem, usando a referência fornecida pelo usuário.

## Funcionalidades
- 21 treinamentos em 5 seções
- trilha vertical com nós concluídos, atual e bloqueados
- 5 etapas de conteúdo + 10 exercícios por treinamento
- 5 vidas por tentativa
- aprovação mínima de 70%
- +100 XP por treinamento concluído
- desbloqueio semanal a partir da data de admissão
- ADMIN libera todos os treinamentos
- login por matrícula + PIN via Supabase RPC `academia_login`
- progresso via `academia_progress`
- conclusão via `academia_complete_training`
- certificados internos
- perfil e logout
- sem dependência de imagens de treinamento externas/quebradas
