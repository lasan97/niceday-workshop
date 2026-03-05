UPDATE workshop_session ws
SET team = mapped.user_team
FROM (
    SELECT
        u.workshop_team_id,
        MIN(BTRIM(u.team)) AS user_team
    FROM workshop_user u
    WHERE u.workshop_team_id IS NOT NULL
      AND BTRIM(u.team) <> ''
    GROUP BY u.workshop_team_id
) mapped
WHERE ws.workshop_team_id = mapped.workshop_team_id
  AND BTRIM(mapped.user_team) <> ''
  AND BTRIM(ws.team) <> BTRIM(mapped.user_team);
