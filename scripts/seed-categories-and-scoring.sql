-- Seeds the 10 default assessment categories and the default business-status
-- score bands. Run once against a fresh database:
--   wrangler d1 execute bhc-db --local --file=../../scripts/seed-categories-and-scoring.sql
--   wrangler d1 execute bhc-db --remote --file=../../scripts/seed-categories-and-scoring.sql
-- (run from apps/worker, where wrangler.toml lives)

INSERT INTO categories (id, slug, label, sort_order, is_active) VALUES
  ('cat_website', 'website', 'Website', 0, 1),
  ('cat_branding', 'branding', 'Branding', 1, 1),
  ('cat_seo', 'seo', 'SEO', 2, 1),
  ('cat_marketing', 'marketing', 'Marketing', 3, 1),
  ('cat_social_media', 'social_media', 'Social Media', 4, 1),
  ('cat_lead_generation', 'lead_generation', 'Lead Generation', 5, 1),
  ('cat_sales', 'sales', 'Sales', 6, 1),
  ('cat_customer_experience', 'customer_experience', 'Customer Experience', 7, 1),
  ('cat_analytics', 'analytics', 'Analytics', 8, 1),
  ('cat_automation', 'automation', 'Automation', 9, 1);

INSERT INTO scoring_config (id, status, label, min_score, max_score, sort_order) VALUES
  ('sc_excellent', 'excellent', 'Excellent', 90, 100, 0),
  ('sc_very_good', 'very_good', 'Very Good', 75, 89, 1),
  ('sc_good', 'good', 'Good', 60, 74, 2),
  ('sc_needs_improvement', 'needs_improvement', 'Needs Improvement', 40, 59, 3),
  ('sc_critical', 'critical', 'Critical', 0, 39, 4);
