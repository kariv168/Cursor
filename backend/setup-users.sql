-- Update existing users with properly hashed passwords
-- Note: The bcrypt hash below corresponds to the password "password"

UPDATE users SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMye.BrU8CQ06pKHVZjBtBhQCmdPGmPONq2' WHERE username = 'admin';
UPDATE users SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMye.BrU8CQ06pKHVZjBtBhQCmdPGmPONq2' WHERE username = 'backend_dev';
UPDATE users SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMye.BrU8CQ06pKHVZjBtBhQCmdPGmPONq2' WHERE username = 'biz_analyst';

-- Verify the update
SELECT u.username, r.role_name, r.description 
FROM users u 
JOIN roles r ON u.role_id = r.role_id
ORDER BY u.user_id;