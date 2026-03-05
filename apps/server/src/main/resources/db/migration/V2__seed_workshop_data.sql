INSERT INTO workshop_schedule (id, day_label, starts_at, ends_at, title, location) VALUES
('sch-1', '1일차', '09:00', '10:30', '등록 및 환영', '그랜드 로비'),
('sch-2', '1일차', '10:30', '12:30', '키노트: 미래 비전', '메인홀 A'),
('sch-3', '2일차', '09:00', '12:00', '팀 빌딩 미션', '강릉 해변');

INSERT INTO workshop_mission (id, title, points, active, pending_approvals) VALUES
('mis-1', '숨은 보물 찾기', 50, TRUE, 1),
('mis-2', '팀 피라미드 사진', 30, TRUE, 2),
('mis-3', '커피 브레이크 퀴즈', 10, FALSE, 0);

INSERT INTO workshop_session (id, team, title, speaker, room, live_qa, pending_questions) VALUES
('ses-1', '알파팀', '업무 환경에서의 AI 미래', '제인 도', '그랜드홀 A', TRUE, 5),
('ses-2', '베타팀', '지속 가능한 행사 운영', '마이클 스미스', '오션룸 2', FALSE, 0),
('ses-3', '감마팀', '마이크로서비스 확장 전략', '사라 코너', '그랜드홀 B', TRUE, 12);

INSERT INTO workshop_user (id, name, team, department, role) VALUES
('usr-1', '홍길동', '알파팀', '제품팀', 'PARTICIPANT'),
('usr-2', '김수진', '베타팀', '마케팅팀', 'PARTICIPANT'),
('usr-3', '이민호', '미배정', '엔지니어링팀', 'PARTICIPANT'),
('usr-4', '박은지', '감마팀', '영업팀', 'ADMIN');
