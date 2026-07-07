-- A small starter set of questions (2 per category) so the questionnaire
-- isn't empty. Replace/expand via the admin panel at /admin/questions.
-- Run from apps/worker:
--   wrangler d1 execute bhc-db --remote --file=../../scripts/seed-sample-questions.sql

INSERT INTO questions (id, category_id, prompt, help_text, sort_order, is_active) VALUES
  ('q_website_1', 'cat_website', 'Is your website mobile-friendly?', NULL, 0, 1),
  ('q_website_2', 'cat_website', 'Does your website load in under 3 seconds?', NULL, 1, 1),
  ('q_branding_1', 'cat_branding', 'Do you have a consistent visual identity (logo, colors, fonts) across channels?', NULL, 0, 1),
  ('q_branding_2', 'cat_branding', 'Do you have documented brand guidelines?', NULL, 1, 1),
  ('q_seo_1', 'cat_seo', 'Do you have a documented SEO strategy?', 'Consider keyword research, on-page optimization, etc.', 0, 1),
  ('q_seo_2', 'cat_seo', 'Do you track keyword rankings for your target terms?', NULL, 1, 1),
  ('q_marketing_1', 'cat_marketing', 'Do you have a documented marketing plan with clear goals?', NULL, 0, 1),
  ('q_marketing_2', 'cat_marketing', 'Do you run paid advertising campaigns (search, social, etc.)?', NULL, 1, 1),
  ('q_social_1', 'cat_social_media', 'Do you post on social media consistently (at least weekly)?', NULL, 0, 1),
  ('q_social_2', 'cat_social_media', 'Do you engage with comments and messages within 24 hours?', NULL, 1, 1),
  ('q_leadgen_1', 'cat_lead_generation', 'Do you have a system to capture leads (forms, landing pages, etc.)?', NULL, 0, 1),
  ('q_leadgen_2', 'cat_lead_generation', 'Do you nurture leads that aren''t ready to buy yet?', NULL, 1, 1),
  ('q_sales_1', 'cat_sales', 'Do you have a documented sales process?', NULL, 0, 1),
  ('q_sales_2', 'cat_sales', 'Do you track conversion rates from lead to customer?', NULL, 1, 1),
  ('q_cx_1', 'cat_customer_experience', 'Do you collect customer feedback regularly?', NULL, 0, 1),
  ('q_cx_2', 'cat_customer_experience', 'Do you have a defined customer support response time?', NULL, 1, 1),
  ('q_analytics_1', 'cat_analytics', 'Do you use an analytics tool (e.g. Google Analytics) to track site traffic?', NULL, 0, 1),
  ('q_analytics_2', 'cat_analytics', 'Do you review key business metrics on a regular schedule?', NULL, 1, 1),
  ('q_automation_1', 'cat_automation', 'Do you use automation for repetitive marketing tasks (email sequences, etc.)?', NULL, 0, 1),
  ('q_automation_2', 'cat_automation', 'Is your customer data centralized in a CRM or similar system?', NULL, 1, 1);

INSERT INTO question_options (id, question_id, label, score, sort_order)
SELECT q.id || '_opt_yes', q.id, 'Yes', 10, 0 FROM questions q WHERE q.id LIKE 'q_%'
UNION ALL
SELECT q.id || '_opt_some', q.id, 'Somewhat', 5, 1 FROM questions q WHERE q.id LIKE 'q_%'
UNION ALL
SELECT q.id || '_opt_no', q.id, 'No', 0, 2 FROM questions q WHERE q.id LIKE 'q_%';
