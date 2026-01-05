/* 
* Chave bolao familia -> bj26familia
* Chave bolão amigos -> bj26amigos
*
*/

INSERT INTO SWEEPSTAKE (name, keyword_hash, quota, group_link, is_to_family)
VALUES (
    'bolao_familia_teste',
    '$2b$10$P7KhWa/yYyjqj0VwVwEPOOlcLTG2dR1TAYDutb0.3ZsfbSaHEqvzK',
    25.00,
    NULL,
    TRUE
);

INSERT INTO SWEEPSTAKE (name, keyword_hash, quota, group_link, is_to_family)
VALUES (
    'bolao_amigos_teste',
    '$2b$10$S4o.Q4gDkEL1lqu5MxTnHuk72h5Ms4B1pAOipawQV/lUlM6JxRMvi',
    50.00,
    NULL,
    FALSE
);