/**
 * Deep links the payment flow may redirect back to. Restricted to the app's
 * own scheme (and Expo Go's exp:// during development) so the verify route
 * cannot be used as an open redirect to arbitrary websites.
 */
export function isAllowedAppReturn(url: string | null | undefined): url is string {
    if (!url) return false;
    return /^apnaselect:\/\//i.test(url) || /^exps?:\/\//i.test(url);
}
