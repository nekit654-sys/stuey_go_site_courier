-- Синхронизировать контактные данные курьеров из courier_earnings в couriers
UPDATE t_p25272970_courier_button_site.couriers c
SET 
    phone = COALESCE(c.phone, ce.phone),
    first_name = COALESCE(c.first_name, SPLIT_PART(ce.full_name, ' ', 1)),
    last_name = COALESCE(c.last_name, SPLIT_PART(ce.full_name, ' ', 2)),
    city = COALESCE(c.city, ce.city)
FROM (
    SELECT DISTINCT ON (courier_id)
        courier_id,
        phone,
        full_name,
        city
    FROM t_p25272970_courier_button_site.courier_earnings
    WHERE courier_id IS NOT NULL
    ORDER BY courier_id, id DESC
) ce
WHERE c.id = ce.courier_id
AND (c.phone IS NULL OR c.first_name IS NULL OR c.city IS NULL);