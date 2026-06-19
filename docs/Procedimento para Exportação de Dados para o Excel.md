# Procedimento para Exportação de Dados para o Excel:

Todas as etapas a seguir devem ser realizadas no ambiente de Produção:

## ETAPA 1 - PREPARAÇÃO:

1. Acessar servidor via terminal (WSL)
2. Acessar pasta /var/www/app/BJ-2026
3. Realizar backup da base de produção:
```mysqldump -u userapp -p --single-transaction --routines --triggers --default-character-set=utf8mb4 --databases bj_2026 > /database/backups/bj_2026_prod_bkp_110626.sql```
4. Criar pasta para alocar os arquivos contendo os dados exportados:
```mkdir export_data_to_excel```

## ETAPA 2 - EXPORTAÇÃO DE DADOS DOS USUÁRIOS:
1. Bolão da Família:
```
mysql -u appuser -p -D bj_2026 \
  -e "select u.id, u.name from users u join sweepstake_users s on u.id = s.user_id where s.sweepstake_name = 'Bolão Família' order by u.name asc" \
  --batch --raw --skip-column-names \
  > bolao_familia_users.tsv
```

2. Bolão dos Tabaqueiros:
```
mysql -u appuser -p -D bj_2026 \
  -e "select u.id, u.name from users u join sweepstake_users s on u.id = s.user_id where s.sweepstake_name = 'Bolão Tabaqueiros' order by u.name asc" \
  --batch --raw --skip-column-names \
  > bolao_tabaq_users.tsv
```

## ETAPA 2 - EXPORTAÇÃO DOS DADOS DAS PARTIDAS:

1. Exportar dados das partidas da fase de grupos:
```
mysql -u appuser -p -D bj_2026 \
  -e "select * from group_matches g order by g.group_letter_1 asc, g.match_info" \
  --batch --raw --skip-column-names \
  > group_stage_matches.tsv
```
2. Exportar dados das partidas da fase mata-mata:
```
mysql -u appuser -p -D bj_2026 \
  -e "select k.match_number, k.knockout_stage_name, k.match_info from knockout_match_teams_rules k order by k.match_number" \
  --batch --raw --skip-column-names \
  > knockout_stage_matches.tsv
```

## ETAPA 3 - EXPORTAÇÃO DAS PREDIÇÕES DO BOLÃO DA FAMÍLIA:

1. Exportar dados das predições das partidas da fase de grupos:

```
mysql -u appuser -p -D bj_2026 \
  -e "select s.sweepstake_name, g.group_match_id, s.user_id, g.sweepstake_users_id, g.score_team_1, g.score_team_2  from group_matches_predictions g join sweepstake_users s on g.sweepstake_users_id = s.id where s.sweepstake_name = 'Bolão Família' order by g.sweepstake_users_id, g.group_match_id" \
  --batch --raw --skip-column-names \
  > bolao_familia_group_predicts.tsv
```

2. Exportar dados das predições das partidas das fases mata-mata:
```
mysql -u appuser -p -D bj_2026 \
  -e "select s.sweepstake_name, u.match_number, s.user_id, u.sweepstake_users_id, u.team_1_name, u.team_2_name, u.score_team_1, u.score_team_2, u.team_1_chosen_by_user, u.team_2_chosen_by_user from user_knockout_stage_predictions u join sweepstake_users s on u.sweepstake_users_id = s.id where s.sweepstake_name = 'Bolão Família' order by u.sweepstake_users_id, u.match_number" \
  --batch --raw --skip-column-names \
  > bolao_familia_knockout_predicts.tsv
```

## ETAPA 4 - EXPORTAÇÃO DAS PREDIÇÕES DO BOLÃO DOS TABAQUEIROS:

1. Exportar dados das predições das partidas da fase de grupos:

```
mysql -u appuser -p -D bj_2026 \
  -e "select s.sweepstake_name, g.group_match_id, s.user_id, g.sweepstake_users_id, g.score_team_1, g.pts_team_1, g.score_team_2, g.pts_team_2  from group_matches_predictions g join sweepstake_users s on g.sweepstake_users_id = s.id where s.sweepstake_name = 'Bolão Tabaqueiros' order by g.sweepstake_users_id, g.group_match_id" \
  --batch --raw --skip-column-names \
  > bolao_tabaq_group_predicts.tsv
```

2. Exportar dados das predições das partidas das fases mata-mata:
```
mysql -u appuser -p -D bj_2026 \
  -e "select s.sweepstake_name, u.match_number, s.user_id, u.sweepstake_users_id, u.team_1_name, u.team_2_name, u.score_team_1, u.score_team_2, u.team_1_chosen_by_user, u.team_2_chosen_by_user from user_knockout_stage_predictions u join sweepstake_users s on u.sweepstake_users_id = s.id where s.sweepstake_name = 'Bolão Tabaqueiros' order by u.sweepstake_users_id, u.match_number" \
  --batch --raw --skip-column-names \
  > bolao_tabaq_knockout_predicts.tsv
```

## ETAPA 5 - COMMIT E PUSH:
1. Commitar pasta:
````git add export_data_to_excel/*```
```git commit -m "Export datas to use in Excel"```
2. Subir commit para repo remoto:
```git push origin main```


