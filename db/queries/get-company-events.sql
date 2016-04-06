select e.id,
    e.title,
    e.sentiment,
    e.logo,
    e.date,
    count(es.*)::"numeric" as source_count,
    count(eb.*)::"numeric" as bookmark_count,

    <% if (query.user_id) { %>
    count(me.*) > 0 as bookmarked_by_user,
    <% } else { %>
    false as bookmarked_by_user,
    <% } %>

    array_agg(et.tag_id) as tag_ids

from company_events ce
left join events e on (e.id = ce.event_id and e.deleted_date is null)
left join event_sources es on (e.id = es.event_id and es.deleted_date is null)
left join event_bookmarks eb on (e.id = eb.event_id and eb.deleted_date is null)
left join event_tags et on (e.id = et.event_id and et.deleted_date is null)

-- left join event_bookmarks me on (e.id = me.event_id
--     and me.user_id = 'b2df88fa-dd25-42ba-b456-3c8d164d3343'
--     and me.deleted_date is null)

<% if (query.user_id) { %>
left join event_bookmarks me on (e.id = me.event_id
    and me.user_id = :user_id
    and me.deleted_date is null)
<% } %>

where ce.company_id = :company_id
-- where ce.company_id = 'f45853f5-6e6d-4b9d-b56f-1e92d3186873'
and e.deleted_date is null

group by e.id
order by e.date desc
