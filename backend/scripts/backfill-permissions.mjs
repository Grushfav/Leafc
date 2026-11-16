import "dotenv/config";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL, { max: 1 });

const staff = await sql`
  UPDATE users SET
    can_manage_insights = true,
    can_manage_academy = true
  WHERE role IN ('admin','senior_agent','agent')
    AND can_manage_insights = false
    AND can_manage_academy = false
    AND site_content_editor = false
  RETURNING id, email
`;

const editors = await sql`
  UPDATE users SET
    can_edit_home = true,
    can_edit_pages = true,
    can_manage_insights = true,
    can_manage_academy = true,
    can_view_newsletter = true,
    can_edit_menus_footer = true
  WHERE site_content_editor = true
    AND (
      can_edit_home = false OR can_edit_pages = false OR can_edit_menus_footer = false
      OR can_view_newsletter = false OR can_manage_insights = false OR can_manage_academy = false
    )
  RETURNING id, email
`;

console.log("staff insights/academy backfill:", staff.length, staff);
console.log("site editor full grant backfill:", editors.length, editors);
await sql.end();
