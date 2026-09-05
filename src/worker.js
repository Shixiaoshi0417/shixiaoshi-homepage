// Existing files are served directly by Workers Static Assets.
// Unmatched requests use the same asset binding and custom 404 page.
export default {
  fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
};
