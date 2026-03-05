UPDATE workshop_session ws
SET team = wt.name
FROM workshop_team wt
WHERE (ws.team IS NULL OR BTRIM(ws.team) = '')
  AND ws.workshop_team_id = wt.id;

UPDATE workshop_session
SET team = '미배정'
WHERE team IS NULL OR BTRIM(team) = '';
