// ============================================================================
// FILL THESE IN before going live.
// All three values are safe to expose in the browser provided your Supabase
// RLS policies are configured correctly (see /survey/schema.sql).
// ============================================================================

window.SURVEY_CONFIG = {
  // From Supabase project settings > API
  SUPABASE_URL: "https://bpedorxwvujkpbtjauhf.supabase.co",          // e.g. "https://abcdefgh.supabase.co"
  SUPABASE_ANON_KEY: "sb_publishable_xvA7_VgsS2vLicBv2zb1wg_tNkwivV4",     // the long "anon public" key

  // URL of the deployed Edge Function (see /survey/edge-function/reformat/)
  // After `supabase functions deploy reformat`, this will look like:
  //   https://<project-ref>.supabase.co/functions/v1/reformat
  REFORMAT_FN_URL: "https://bpedorxwvujkpbtjauhf.supabase.co/functions/v1/reformat",

  // Set to true to skip the Haiku reformatter and just submit raw feedback,
  // useful for local testing before the edge function is deployed.
  DISABLE_REFORMATTER: false,
};
