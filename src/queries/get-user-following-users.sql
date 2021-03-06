select u.id,
    u.name,
    u.title,
    u.email

from user_followers uf

left join users u on (u.id = uf.f_user_id)

where uf.user_id = :id
and u.deleted_date is null
and uf.deleted_date is null

limit 50
offset :offset

;
