// Public configuration only. NEVER put API keys, email-service secrets, or admin secrets here.
window.MQ7_CONFIG = {
  // Keep false until the secure registration backend is deployed and tested.
  registrationRequired: false,
  // Example: https://your-project.supabase.co/functions/v1/mathquest-registration
  registrationEndpoint: "",
  // Cloudflare Turnstile public SITE key (safe to expose). Secret key belongs only on the server.
  turnstileSiteKey: ""
};
