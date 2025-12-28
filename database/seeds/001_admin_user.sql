INSERT INTO Users (email, password_hash, is_admin)
VALUES (
    'pedrokatsbarros@gmail.com',
    '$2b$10$XYanUmN7jOLskmqCCq4nC.6AookrMIke789pB5VWzZw6mXwL8aZIe', -- hash gerado pelo bcrypt
    TRUE
);
