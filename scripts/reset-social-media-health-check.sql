-- Replaces the placeholder 10-category/20-question assessment with the
-- client's final 7-question "Social Media Health Check" (see System
-- Question.pdf at the repo root) and its 3-tier scoring bands.
--
-- This is destructive: it clears all existing assessments/businesses too,
-- since they reference the questions being deleted.
--
-- Run from apps/worker, where wrangler.toml lives:
--   wrangler d1 execute bhc-db --local --file=../../scripts/reset-social-media-health-check.sql
--   wrangler d1 execute bhc-db --remote --file=../../scripts/reset-social-media-health-check.sql

DELETE FROM assessment_answers;
DELETE FROM recommendation_rules;
DELETE FROM assessments;
DELETE FROM businesses;
DELETE FROM question_options;
DELETE FROM questions;
DELETE FROM categories;
DELETE FROM scoring_config;

INSERT INTO categories (id, slug, label, sort_order, is_active) VALUES
  ('cat_social_media_presence', 'social_media_presence', 'Social Media Presence', 0, 1),
  ('cat_content', 'content', 'Content', 1, 1),
  ('cat_engagement', 'engagement', 'Engagement', 2, 1),
  ('cat_paid_ads', 'paid_ads', 'Paid Ads', 3, 1),
  ('cat_website', 'website', 'Website', 4, 1),
  ('cat_lead_generation', 'lead_generation', 'Lead Generation', 5, 1),
  ('cat_overall_impact', 'overall_impact', 'Overall Impact', 6, 1);

INSERT INTO scoring_config (id, status, label, min_score, max_score, sort_order) VALUES
  ('sc_strong_performer', 'strong_performer', 'Strong Performer', 71, 100, 0),
  ('sc_on_the_right_track', 'on_the_right_track', 'On The Right Track', 41, 70, 1),
  ('sc_just_getting_started', 'just_getting_started', 'Just Getting Started', 0, 40, 2);

INSERT INTO questions (id, category_id, prompt, help_text, sort_order, is_active) VALUES
  ('q_social_media_presence', 'cat_social_media_presence', 'Is your social media account active?', NULL, 0, 1),
  ('q_content', 'cat_content', 'How would you describe the content you''re currently posting?', NULL, 0, 1),
  ('q_engagement', 'cat_engagement', 'How much real engagement are you getting (comments, shares, DMs, saves)?', NULL, 0, 1),
  ('q_paid_ads', 'cat_paid_ads', 'Have you run any paid ads on TikTok or Meta?', NULL, 0, 1),
  ('q_website', 'cat_website', 'Do you have a website, and is it helping bring in leads?', NULL, 0, 1),
  ('q_lead_generation', 'cat_lead_generation', 'Roughly how many leads or inquiries does your social media (and website) bring in a month?', NULL, 0, 1),
  ('q_overall_impact', 'cat_overall_impact', 'Right now, is your online presence mainly just for visibility, or is it actually driving sales?', NULL, 0, 1);

INSERT INTO question_options (id, question_id, label, score, sort_order) VALUES
  ('opt_smp_0', 'q_social_media_presence', 'Don''t have a social media account', 0, 0),
  ('opt_smp_1', 'q_social_media_presence', 'Yes, but rarely post / haven''t opened it in a long time', 1, 1),
  ('opt_smp_2', 'q_social_media_presence', 'Yes, I post consistently (weekly or more)', 2, 2),

  ('opt_content_0', 'q_content', 'No real content plan, just posting randomly when I remember', 0, 0),
  ('opt_content_1', 'q_content', 'Some content, but no consistent plan', 1, 1),
  ('opt_content_2', 'q_content', 'Consistent content with a clear plan or calendar', 2, 2),

  ('opt_engagement_0', 'q_engagement', 'Very little to none', 0, 0),
  ('opt_engagement_1', 'q_engagement', 'Some, but mostly friends/family, not real customers', 1, 1),
  ('opt_engagement_2', 'q_engagement', 'Good engagement from people who could actually be customers', 2, 2),

  ('opt_paid_ads_0', 'q_paid_ads', 'No, never', 0, 0),
  ('opt_paid_ads_1', 'q_paid_ads', 'Yes, but I''m not sure if it''s actually working', 1, 1),
  ('opt_paid_ads_2', 'q_paid_ads', 'Yes, and it''s working well', 2, 2),

  ('opt_website_0', 'q_website', 'No website at all', 0, 0),
  ('opt_website_1', 'q_website', 'Yes, but it doesn''t really convert visitors into leads', 1, 1),
  ('opt_website_2', 'q_website', 'Yes, it actively brings in leads/inquiries', 2, 2),

  ('opt_lead_gen_0', 'q_lead_generation', 'None, or I''m not tracking it', 0, 0),
  ('opt_lead_gen_1', 'q_lead_generation', '1-5 leads/month', 1, 1),
  ('opt_lead_gen_2', 'q_lead_generation', '6-20 leads/month', 2, 2),
  ('opt_lead_gen_3', 'q_lead_generation', '20+ leads/month', 3, 3),

  ('opt_overall_0', 'q_overall_impact', 'Just visibility, not really driving sales', 0, 0),
  ('opt_overall_1', 'q_overall_impact', 'A bit of both', 1, 1),
  ('opt_overall_2', 'q_overall_impact', 'Yes, it''s genuinely driving sales', 2, 2);
