/*Fix all incorret matches info:*/

UPDATE GROUP_MATCHES
SET match_info = '19/jun 21:30h, Estados Unidos'
WHERE id = 16;

UPDATE GROUP_MATCHES
SET match_info = '20/jun 0h, Estados Unidos'
WHERE id = 22;

UPDATE GROUP_MATCHES
SET match_info = '23/jun 0h, Estados Unidos'
WHERE id = 59;