-- Reset password for nekit654
-- New password: nekit654nekit654
-- Bcrypt hash: $2b$12$5TqKxYvYJNLHZI6Y8zXqVObQmw.xJYMdXBzFjLj7gqm3Xe4yGjQFK

UPDATE t_p25272970_courier_button_site.admins 
SET password_hash = '$2b$12$5TqKxYvYJNLHZI6Y8zXqVObQmw.xJYMdXBzFjLj7gqm3Xe4yGjQFK', 
    updated_at = NOW() 
WHERE username = 'nekit654';
